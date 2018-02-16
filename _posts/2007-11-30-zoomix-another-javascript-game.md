---
layout: post
title: _Zoomix_ -- Another _JavaScript Game_
permalink: /2007/11/zoomix-another-javascript-game.html
summary: Yesterday I wrote another game using JavaScript and the canvas tag, which I've named *Zoomix*. This time the design of the game is completely original, and I think it came out pretty nicely. Hopefully you should be able to figure out the rules / object of the game after playing with it for a few minutes. Let me know what you think! (And post your high scores in the comments).
---

<script src="/javascript/zoomix.js" type="text/javascript" charset="utf-8">
</script>
Updated 2009-12-13: Adding the actual game itself to this page, mainly
so that Aaron has a place to play.

<p id="MD-Text">
<span id="MD-GameOver">GAME OVER - Press Spacebar to Restart</span>
Score: <span id="MD-Score">0</span>

</p>
<canvas id="MD-Canvas" width="600" height="600">
The game would be here if you were using a browser that supported the
[canvas
tag](http://www.whatwg.org/specs/web-apps/current-work/#the-canvas-element</canvas>)

{{ page.summary }}

The look and feel of the game was inspired by the [Rubik’s
Cube](http://www.rubiks.com/). After creating a static image of a face
of the cube, zooming in on it seemed to be the only logical thing to do.
After that was implemented, the mechanics of gameplay just fell out.

The game is [open-source](http://github.com/mdirolf/zoomix) (but those
of you who care probably viewed the source already).

See also: [MDCave](/2007/06/fun-game.html)
