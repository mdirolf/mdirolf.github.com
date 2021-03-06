---
layout: post
title: Working With _Stored_ _JavaScript_ in _MongoDB_
---

Stored JS in MongoDB is saved in the special *system.js* collection. The
documents there should be structured like:

{% highlight js %}
{_id: "sum",
 value: function (x, y) { return x + y; }}
{% endhighlight %}

**\_id** is the name of the function, and **value** is the JS code
defining the function. Here’s an example of saving such a function and
then using it in an eval. This can be run using the MongoDB shell:

{% highlight js %}
> db.system.js.save({_id: "sum",
...                  value: function (x, y) { return x + y; }});
> db.eval("return sum(2, 3);");
5
{% endhighlight %}

Once <code>sum</code> is defined we can use it from all of MongoDB’s JS
contexts, including Map/Reduce and $where. In this example we use
<code>sum</code> within a $where clause to get all documents where the
sum of **x** and **y** is 6:

{% highlight js %}
> db.test.save({x: 4, y: 2});
> db.test.save({x: 4, y: 3});
> db.test.save({x: 3, y: 3});
> db.test.find({$where: "sum(this.x, this.y) == 6"});
{ "_id" : ObjectId("4bba376231d25858659843f7"), "x" : 4, "y" : 2 }
{ "_id" : ObjectId("4bba376e31d25858659843f9"), "x" : 3, "y" : 3 }
{% endhighlight %}

Since *system.js* is a collection, we can perform normal MongoDB
operations on it in order to administer our stored JS functions. We
might want to list the stored functions:

{% highlight js %}
> db.system.js.distinct("_id");
[ "sum" ]
{% endhighlight %}

or remove a function we previously stored:

{% highlight js %}
> db.system.js.remove({_id: "sum"});
> db.eval("return sum(2, 3);");
Mon Apr  5 15:14:45 JS Error: uncaught exception: {
    "errno" : -3,
    "errmsg" : "[...] sum is not defined [...]",
    "ok" : 0
}
{% endhighlight %}

Stored JS and PyMongo
---------------------

In version 1.5 [PyMongo](http://api.mongodb.org/python) added some
helpers to make working with stored JS incredibly easy. The API is
accessed through the <code>Database.system\_js</code> property, which
returns an instance of the [SystemJS helper
class](http://api.mongodb.org/python/1.5.2%2B/api/pymongo/database.html#pymongo.database.SystemJS).
The SystemJS class allows us to add, call, and remove stored JS
functions using a nice Pythonic interface:

{% highlight pycon %}
>>> db.system_js.sum = "function (x, y) { return x + y; }"
>>> db.system_js.sum(3, 2)
5.0
>>> del db.system_js.sum
>>> db.system_js.sum(3, 2)
Traceback (most recent call last):
pymongo.errors.OperationFailure: [...] sum is not defined [...]
{% endhighlight %}

The
[implementation](http://github.com/mongodb/mongo-python-driver/blob/master/pymongo/database.py#L587)
of the SystemJS class is actually pretty trivial. The trickiest bit is
getting the argument passing right between the Python lambda returned by
<code>*getattr*</code> and the invocation of the stored JS function
within the eval.
