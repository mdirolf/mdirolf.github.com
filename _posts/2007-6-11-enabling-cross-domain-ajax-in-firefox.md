---
layout: post
title: Enabling _Cross-Domain AJAX_ in _Firefox_
permalink: /2007/06/enabling-cross-domain-ajax-in-firefox.html
summary: Tonight I have finally conquered one of the biggest annoyances of the past year for me (in terms of development at least). Developing web applications with Firefox is a pleasure because of the "firebug extension":http://getfirebug.com/. Nothing comes close in Safari. Unfortunately, Firefox doesn't allow cross-domain XMLHttpRequests for security reasons. While good security is a plus, this restriction can make development and testing a real chore. For those of us willing to risk the security vulnerability, here is how to bypass the cross-domain restriction once and for all.
---

<div class="note">
Updated 2009-12-13: This post seems to be the most popular of those from
the old incarnation of this blog. As such I’ve decided to migrate it
over. Unfortunately I can’t migrate the comments as well. One comment
which seems that it might be useful comes from
[stefano](http://myblog.digitalemagine.com/) (I’ve editorialized
somewhat):

> Good trick, but there’s an easier way to enable cross domain without
> editing config files by hand. Type “about:config” in your URL bar,
> then right click on the list of preferences and select the *New* -&gt;
> *String* contextual menu. Add
> **capability.policy.default.XMLHttpRequest.open** as key name and
> **allAccess** as value. I do not remember if this is taken into
> account immediately or if you have to reboot. Done!

I’m also not positive if this works in newer versions of Firefox, and I
haven’t tested it. Feel free to let everybody know in the comments.

</div>
{{ page.summary }}

\#

<p>
Close Firefox

\#

<p>
Edit the file **prefs.js** in your Firefox user profile folder

\#

<p>
Add the following line anywhere in the file:  
{% highlight javascript %}
user_pref("capability.policy.default.XMLHttpRequest.open",
          "allAccess");
{% endhighlight %}

\#

<p>
Save the file and re-open Firefox. You can now risk your life and limb
by doing XHR (XMLHttpRequests)’s to whatever domains you want -
congratulations!
