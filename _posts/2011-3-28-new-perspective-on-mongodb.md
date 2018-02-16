---
layout: post
title: "A _New Perspective_ on _MongoDB_"
summary: "I've been nominally using MongoDB since 2008, but most of my experience has been as a MongoDB developer, not a real end user. Over the past few months I've made the transition to other side, _using_ MongoDB rather than developing it. The project I've been working on, <a href='https://fiesta.cc'>fiesta</a>, uses MongoDB exclusively for data storage. Here are some thoughts on MongoDB from my new perspective."
---

I’ve been nominally using MongoDB since 2008, but most of my experience
has been as a MongoDB developer, not a real end user. Over the past few
months I’ve made the transition to other side, *using* MongoDB rather
than developing it. The project I’ve been working on,
[fiesta](https://fiesta.cc), uses MongoDB exclusively for data storage.
Here are some thoughts on MongoDB from my new perspective.

Flexibility
-----------

In the [presentations](/talks.html) I’ve done about MongoDB, I have
always made a point to talk about how the document-oriented data model
makes the database very flexible. I’d generally cite the example of how,
when working with the folks at Business Insider, we’d seen the need to
run any sort of migrations basically disappear. I’d explain how
documents in a collection can have any “shape”, and how doing migrations
was often as simple as adding an extra key when saving new documents.
Sometimes people didn’t quite buy this. Now that I have some concrete
examples from fiesta, maybe I can explain a little better.

When I first implemented fiesta, lists would always “munge” the Reply-To
header when distributing a message. I like this behavior. Some others
[don’t](http://marc.merlins.org/netrants/reply-to-harmful.html). It
pretty quickly became apparent that deciding either way would leave
roughly 50 percent of my users unhappy, so reply-to munging became one
of the (few) configurable bits of functionality in fiesta.

To implement this, all I needed to do was add a boolean `"munge"` field
to the documents in the users collection. That key is set when a user
chooses their reply-to preference. When sending a message to a user, we
have to be careful to check if that key exists, though, since some users
predate the munge setting:

{% highlight python %}
if user.get("munge", True):
    do_munge(...)
{% endhighlight %}

That’s it! No migration.

Dynamic Queries
---------------

Another feature I always tout when presenting MongoDB is its dynamic
query language. The claims:

1.  Being able to create queries on the fly makes development really
    fast.
2.  The document-based query language looks and feels totally natural in
    dynamic languages.
3.  Dynamic queries make administration easier.

After using MongoDB in the real world for a while, I feel those claims
have proven to be pretty accurate:

1.  When I first started development on fiesta, the queries I was
    running changed probably every five minutes or so. Being able to
    quickly experiment with new queries (especially from the shell) kept
    the pace of development fast.
2.  I write all of my queries directly against PyMongo, and it just
    feels natural. I have noted, however, that my memory of some of the
    $ operators has started to fade a bit. From time to time I’ll have
    to go check the reference – makes me wish I had held onto one of
    those [quick reference cards](http://www.10gen.com/reference) for
    myself!
3.  To be honest I can’t think of any administrative tasks that I’ve had
    to do that have been much easier with dynamic queries then they
    would’ve been with a few well-designed views. So this one might be a
    push – I’ll keep this updated if I think of any.

Replication
-----------

I stopped working full-time on MongoDB right around the time that
replica sets went out in a production release. Even since then they have
come a long way; at this point they really couldn’t be much easier to
work with.

When I first deployed fiesta in beta, it was running on a single EC2
micro instance. I had set up nightly backups (using the fsync and lock
command), but didn’t have replication set up. Needless to say, I was
given a bit of a hard time when the 10gen gang heard that – hadn’t we
(myself included) always said to never run without replication? Their
ribbing was enough to convince me to take the time to set up
replication, which took all of about an hour. And most of that time was
spent playing around with [puppet](http://www.puppetlabs.com/) (time
well spent, for the record). Now fiesta is running on a three-node
replica set, with one passive node. The passive node is responsible for
taking nightly backups.

Administration
--------------

Another thing I’ve often talked about is the MongoDB admin interface /
web console. This has been really useful, especially the replica set UI.
The one issue I’ve run into with it is documented
[here](http://jira.mongodb.org/browse/SERVER-1729), but it’s far from a
show stopper.

For administration I’ve found Elliot’s [munin
plugins](https://github.com/erh/mongo-munin) to be even more useful than
I expected. If you’re running MongoDB in production you should
definitely check them out.

Performance
-----------

So far, so good. More updates here once fiesta hits its millionth user.
Oh, by the way, you should [give it a shot](https://fiesta.cc) if you
haven’t already :).
