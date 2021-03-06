---
layout: post
title: A _New_ _GridFS_ Implementation for _PyMongo_
summary: One weak point of PyMongo has always been its support for GridFS. The GridFS API is a bit confusing and hard to work with, and sometimes allows incorrect operations to be performed. I've just finished a new implementation of GridFS for PyMongo -- this post introduces the new API and requests feedback before it gets officially released.
---

The API (Application Programming Interface) for
[PyMongo](http://api.mongodb.org/python), the Python driver for
[MongoDB](http://www.mongodb.org), has been pretty stable for quite some
time now. In general, I think that the driver does a great job of
exposing all of MongoDB’s functionality in a way that is both
MongoDB-ish and Pythonic (of course I’m biased — if you have suggestions
for improvements please let me know). There have been some minor tweaks
recently, like an improvement for the [command
API](http://api.mongodb.org/python/1.5.1%2B/api/pymongo/database.html#pymongo.database.Database.command),
but there haven’t been any huge changes in a while.

All that said, I think there is one place where PyMongo has been
deficient for a long time: its support for
[GridFS](http://dochub.mongodb.org/core/gridfs). There are a couple of
problems with the GridFS implementation in previous versions (**<span
style="text-align:left;">= 1.5.2</span>**) of PyMongo:

* It is slower and less concurrency-friendly than it needs to be.

* It could be much simpler and easier to work with.

* It allows some operations (modifying existing files) that are incorrect according to the GridFS semantics.

I think that all of these deficiencies stem from one fatal flaw in the
original API design: it was trying *too hard* to mimic Python’s
filesystem API. Exposing file-like objects for writing and reading is
great, but things like focusing on filename as a file-handle (filename
is less important in GridFS) and allowing users to modify files (which
is not a concept supported by GridFS) were bad decisions. This post
introduces a new GridFS API for PyMongo which tries to address all of
the deficiencies in the old implementation.

The New API
-----------

The new GridFS API is available in PyMongo versions **<span
style="text-align:right;">= 1.6</span>**. There are [API
docs](http://api.mongodb.org/python/current/api/gridfs/index.html)
available for the new version of GridFS, but this post walks through the
API in a little more detail.

Almost all of the API is exposed through the GridFS class, here’s an
example instantiation:

{% highlight pycon %}
>>> from pymongo import Connection
>>> from gridfs import GridFS
>>> db = Connection().test_database
>>> fs = GridFS(db)
{% endhighlight %}

You can also use an alternate root collection for GridFS by passing a
collection name as the second argument to <code>GridFS</code>. Given an
instance of GridFS, creating new files and getting data from existing
ones is easy:

{% highlight pycon %}
>>> file_id = fs.put("hello world")
>>> fs.get(file_id).read()
'hello world'
{% endhighlight %}

The <code>put</code> method takes a string or file-like object
containing data to be written to a GridFS file, and returns the
<code>\_id</code> of the newly created file. It also accepts keyword
arguments for any of the fields available in the GridFS file spec. So to
insert the contents of the local file *myimage.jpg* with the content
type “image/jpeg” and the filename “myimage” we would do:

{% highlight pycon %}
>>> with open("myimage.jpg") as myimage:
...   oid = fs.put(myimage, content_type="image/jpeg", filename="myimage")
...
{% endhighlight %}

The equivalent of doing this using the old API would be:

{% highlight pycon %}
>>> from pymongo.objectid import ObjectId
>>> with open("myimage.jpg") as myimage:
...   with fs.open({"filename": "myimage",
...                 "contentType": "image/jpeg",
...                 "_id": ObjectId()}, "w") as grid_file:
...     grid_file.write(myimage.read())
...     oid = grid_file._id
...
{% endhighlight %}

The <code>get</code> method takes an <code>\_id</code> of a file in
GridFS, and returns a file-like object (an instance of
<code>gridfs.grid\_file.GridOut</code>) that can be used to read that
file’s data. If there is no file with the given <code>\_id</code> an
exception is raised:

{% highlight pycon %}
>>> oid = fs.put("hello world")
>>> fs.get(oid)
<gridfs.grid_file.GridOut object at ...>
>>> fs.get("non-existant _id")
Traceback (most recent call last):
gridfs.errors.NoFile: ...
{% endhighlight %}

To delete a file in GridFS, pass its <code>\_id</code> to the
<code>delete</code> method:

{% highlight pycon %}
>>> fs.get(oid)
<gridfs.grid_file.GridOut object at ...>
>>> fs.delete(oid)
>>> fs.get(oid)
Traceback (most recent call last):
gridfs.errors.NoFile: ...
{% endhighlight %}

Advanced Usage
--------------

While <code>put</code> should cover most use cases that opening a file
in write mode used to, there may be some cases where you don’t want to
write all of the file’s data at once. In that case you can use the
<code>new\_file</code> method to get a new
<code>gridfs.grid\_file.GridIn</code> instance which you can write to.
When you’re done with the instance call <code>close</code> (or just use
Python 2.6’s <code>with</code> statement to handle it for you). Like
<code>put</code>, <code>new\_file</code> takes keyword arguments for any
of the values in the GridFS file spec. A cool note about both methods is
that any unrecognized keyword arguments (in this example,
<code>location</code>) will automatically be set as attributes on the
underlying file document:

{% highlight pycon %}
>>> myfile = fs.new_file(location=[-74, 40.74])
>>> myfile.write("hello ")
>>> myfile.write("world")
>>> myfile.writelines([" and have a ", "good day!"])
>>> myfile.close()
>>> out = fs.get(myfile._id)
>>> out.read()
'hello world and have a good day!'
>>> out.location
[-74, 40.740000000000002]
{% endhighlight %}

Most of the examples above have been referencing files in GridFS by
their <code>\_id</code>. The old API made more of a point of emphasizing
<code>filename</code> as the primary mode of access. While the new API
encourages the better practice of referencing by <code>\_id</code>,
there are still some cases where you might need to work with files based
on <code>filename</code>, or where your application treats
<code>filename</code> as a unique identifier.

The way to work with filenames in the new API is to create a new GridFS
file with the same filename every time you need to modify a file. Since
files in GridFS store their upload date, we can always get the most
recent version of a file by filename. We can also reference by
<code>\_id</code> to get any previous version — we can treat GridFS as a
versioned filestore. The method to get the last version of a file by
name is <code>get\_last\_version</code>:

{% highlight pycon %}
>>> a = fs.put("foo", filename="test")
>>> fs.get_last_version("test").read()
'foo'
>>> b = fs.put("bar", filename="test")
>>> fs.get_last_version("test").read()
'bar'
>>> fs.delete(b)
>>> fs.get_last_version("test").read()
'foo'
{% endhighlight %}

Performance
-----------

I’ve only done some very basic benchmarking of the new GridFS
implementation. It doesn’t appear to be a drastic improvement when
writing large files, but writing small files is about four times faster
in a simple benchmark of mine. This is because the simplification of the
API has reduced the per-file overhead dramatically. There are also huge
performance improvements when uploading a large file from disk or some
other file-like source (especially if it was being done naively using
the old API), as the new API automatically handles streaming from a
file-like source into chunk-sized buffers.

Reading small files is about 10% faster with the new API, while there
doesn’t seem to be much difference with reading large files. A big
difference in performance for both reads and writes is that concurrency
is vastly improved. Since the GridFS semantics are handled correctly,
there is no longer a per-file lock for access - concurrent operations
are fully supported and safe now (with the notable exception of deleting
a file, which could cause concurrent readers to see partial data).

If anybody has any ideas for benchmarks, or existing benchmarks for the
old API, I’d love to see how they compare — please leave a note in the
comments.

Deprecation of the Old API
--------------------------

In the current state of the master branch I have removed the old GridFS
API completely, raising an <code>UnsupportedAPI</code> acception when
attempts are made to use it. Normally I would go through a deprecation
window, but I’m considering just releasing like this. My reasoning is
that it’s a big change and I want people to be making it as soon as
possible. There is also a problem that mixed use of the APIs could be
unsafe (in general, *any* use of the old API can be unsafe, if it’s used
to overwrite existing files). Let me know what your thoughts on this
decision are as well. Hoping to get this right as I think it will be a
big improvement to PyMongo!
