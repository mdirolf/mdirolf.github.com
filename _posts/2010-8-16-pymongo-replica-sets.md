---
layout: post
title: Connecting to a _Replica Set_ from _PyMongo_
summary: PyMongo makes working with "replica sets":http://dochub.mongodb.org/core/rs easy. Here we'll launch a new replica set and show how to handle both initialization and normal connections with PyMongo. This blog post will also be going up as an example in the "PyMongo docs":http://api.mongodb.org/python/current/examples/index.html - check that page out for more examples of how to get things done with PyMongo.
---

{{ page.summary }}

Replica sets require server version **<span style="text-align:right;">=
1.6.0</span>**. Support for connecting to replica sets also requires
PyMongo version **<span style="text-align:right;">= 1.8.0</span>**.

Starting a Replica Set
----------------------

The main [replica set documentation](http://dochub.mongodb.org/core/rs)
contains extensive information about setting up a new replica set or
migrating an existing MongoDB setup, be sure to check that out. Here,
we’ll just do the bare minimum to get a three node replica set setup
locally.

Replica sets should always use multiple nodes in production - putting
all set members on the same physical node is only recommended for
testing and development.

We start three <code>mongod</code> processes, each on a different port
and with a different dbpath, but all using the same replica set name
“foo”. In the example we use the hostname “morton.local”, so replace
that with your hostname when running:

{% highlight bash %}
$ hostname
morton.local
$ mongod --replSet foo/morton.local:27018,morton.local:27019 --rest
{% endhighlight %}

{% highlight bash %}
$ mongod --port 27018 --dbpath /data/db1 \
  --replSet foo/morton.local:27017 --rest
{% endhighlight %}

{% highlight bash %}
$ mongod --port 27019 --dbpath /data/db2 \
  --replSet foo/morton.local:27017 --rest
{% endhighlight %}

Initializing the Set
--------------------

At this point all of our nodes are up and running, but the set has yet
to be initialized. Until the set is initialized no node will become the
primary, and things are essentially “offline”.

To initialize the set we need to connect to a single node and run the
initiate command. Since we don’t have a primary yet, we’ll need to tell
PyMongo that it’s okay to connect to a slave/secondary:

{% highlight pycon %}
>>> from pymongo import Connection
>>> c = Connection("morton.local:27017", slave_okay=True)
{% endhighlight %}

We could have connected to any of the other nodes instead, but only the
node we initiate from is allowed to contain any initial data.

After connecting, we run the initiate command to get things started
(here we just use an implicit configuration, for more advanced
configuration options see the replica set documentation):

{% highlight pycon %}
>>> c.admin.command("replSetInitiate")
{u'info': u'Config now saved locally.  ...',
 u'info2': u'no configuration explicitly specified -- making one',
 u'ok': 1.0}
{% endhighlight %}

The three <code>mongod</code> servers we started earlier will now
coordinate and come online as a replica set.

Connecting to a Replica Set
---------------------------

The initial connection as made above is a special case, for an
uninitialized replica set. Normally we’ll want to connect differently. A
connection to a replica set can be made using the normal
<code>Connection()</code> constructor, specifying one or more members of
the set. For example, any of the following will create a connection to
the set we just created:

{% highlight pycon %}
>>> Connection("morton.local")
>>> Connection("morton.local:27018")
>>> Connection("morton.local", 27019)
>>> Connection(["morton.local:27018", "morton.local:27019"])
>>> Connection("morton.local:27017,morton.local:27018,morton.local:27019")
{% endhighlight %}

The nodes passed to <code>Connection()</code> are called the **seeds**.
As long as at least one of the seeds is online, the driver will be able
to “discover” all of the nodes in the set and make a connection to the
current primary.

Handling Failover
-----------------

When a failover occurs, PyMongo will automatically attempt to find the
new primary node and perform subsequent operations on that node. This
can’t happen completely transparently, however. Here we’ll perform an
example failover to illustrate how everything behaves. First, we’ll
connect to the replica set and perform a couple of basic operations:

{% highlight pycon %}
>>> db = Connection("morton.local").test
>>> db.test.save({"x": 1})
ObjectId('...')
>>> db.test.find_one()
{u'x': 1, u'_id': ObjectId('...')}
{% endhighlight %}

By checking the host and port, we can see that we’re connected to
**morton.local:27017**, which is the current primary:

{% highlight pycon %}
>>> db.connection.host
'morton.local'
>>> db.connection.port
27017
{% endhighlight %}

Now let’s bring down that node and see what happens when we run our
query again:

{% highlight pycon %}
>>> db.test.find_one()
Traceback (most recent call last):
pymongo.errors.AutoReconnect: ...
{% endhighlight %}

We get an <code>AutoReconnect</code> exception. This means that the
driver was not able to connect to the old primary (which makes sense, as
we killed the server), but that it will attempt to automatically
reconnect on subsequent operations. When this exception is raised our
application code needs to decide whether to retry the operation or to
simply continue, accepting the fact that the operation might have
failed.

On subsequent attempts to run the query we might continue to see this
exception. Eventually, however, the replica set will failover and elect
a new primary (this should take a couple of seconds in general). At that
point the driver will connect to the new primary and the operation will
succeed:

{% highlight pycon %}
>>> db.test.find_one()
{u'x': 1, u'_id': ObjectId('...')}
>>> db.connection.host
u'morton.local'
>>> db.connection.port
27018
{% endhighlight %}

If you have any questions on working with Replica Sets and PyMongo, feel
free to ask in the comments!
