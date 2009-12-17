var RES = 101;
var SIZE = 30;
var GAP_RATIO = 1.0 / 10.0; //size of the gap relative to size of a square in the grid
var R_RATIO = 1.0 / 10.0;
var LINE_RATIO = 1.0 / 20.0;
var LINE_COLOR = "black";
var SELECTED_COLOR = "skyblue";
var TIMEOUT = 30;

var COLORS = new Array(6);
COLORS[0] = "red";
COLORS[1] = "blue";
COLORS[2] = "green";
COLORS[3] = "yellow";
COLORS[4] = "darkorange";
COLORS[5] = "white";

var canvas;
var ctxt;

var big = new Array(9);
var small = new Array(9);
var zoom = 0.0;
var zoomStep = 0.01;
var zoomTowards = 4; // which grid square are we zooming towards
var newZoomTowards = 4;
var xOffset = 0;
var yOffset = 0;
var goalColor;
var lessThanPointFive = true;
var score = 0;
var counter = 0;
var done = false;

function colorizeGrid (grid) {
    for (var i = 0; i < grid.length; i++) {
        grid[i] = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
}

function drawGrid (grid, x, y, size, selected) {
    var gap = size * GAP_RATIO;

    var x2 = x + size + gap;
    var x3 = x + 2 * size + 2 * gap;
    var y2 = y + size + gap;
    var y3 = y + 2 * size + 2 * gap;

    if (y + size > 0) {
        if (x + size > 0)
            stylizedSquare(x, y, size, grid[0], (selected == 0) ? SELECTED_COLOR : LINE_COLOR);
        if (x2 + size > 0 && x2 < RES)
            stylizedSquare(x2, y, size, grid[1], (selected == 1) ? SELECTED_COLOR : LINE_COLOR);
        if (x3 < RES)
            stylizedSquare(x3, y, size, grid[2], (selected == 2) ? SELECTED_COLOR : LINE_COLOR);
    }

    if (y2 + size > 0 && y2 < RES) {
        if (x + size > 0)
            stylizedSquare(x, y2, size, grid[3], (selected == 3) ? SELECTED_COLOR : LINE_COLOR);
        if (x2 + size > 0 && x2 < RES)
            stylizedSquare(x2, y2, size, grid[4], (selected == 4) ? SELECTED_COLOR : LINE_COLOR);
        if (x3 < RES)
            stylizedSquare(x3, y2, size, grid[5], (selected == 5) ? SELECTED_COLOR : LINE_COLOR);
    }

    if (y3 < RES) {
        if (x + size > 0)
            stylizedSquare(x, y3, size, grid[6], (selected == 6) ? SELECTED_COLOR : LINE_COLOR);
        if (x2 + size > 0 && x2 < RES)
            stylizedSquare(x2, y3, size, grid[7], (selected == 7) ? SELECTED_COLOR : LINE_COLOR);
        if (x3 < RES)
            stylizedSquare(x3, y3, size, grid[8], (selected == 8) ? SELECTED_COLOR : LINE_COLOR);
    }
}

// draw a stylized square
function stylizedSquare (x, y, size, color, line_color){
    /*var r = size * R_RATIO;
     ctxt.beginPath();
     ctxt.moveTo(x, y + r);
     ctxt.lineTo(x, y + size - r);
     ctxt.quadraticCurveTo(x, y + size, x + r, y + size);
     ctxt.lineTo(x + size - r, y + size);
     ctxt.quadraticCurveTo(x + size , y + size, x + size, y + size - r);
     ctxt.lineTo(x + size, y + r);
     ctxt.quadraticCurveTo(x + size, y, x + size - r, y);
     ctxt.lineTo(x + r, y);
     ctxt.quadraticCurveTo(x, y, x, y + r);*/
    ctxt.fillStyle = color;
    //ctxt.fill();
    ctxt.lineWidth = size * LINE_RATIO;
    ctxt.strokeStyle = line_color;
    //ctxt.stroke();
    ctxt.fillRect(x,y,size,size);
    ctxt.strokeRect(x,y,size,size);
}

function draw () {
    ctxt.globalAlpha = 1.0;
    ctxt.fillStyle = goalColor;
    ctxt.fillRect(0, 0, RES, RES);

    var alpha = 0.0;
    if (zoom > 0.5)
        alpha = 2.0 * (zoom - 0.5);

    var x = 1 - xOffset;
    var y = 1 - yOffset;
    var s = SIZE * (1 + 2.3 * zoom);

    ctxt.globalAlpha = 1 - alpha;
    drawGrid (big, x, y, s, (zoom > 0.5) ? -1 : zoomTowards);

    ctxt.globalAlpha = alpha;
    drawGrid (small, x + (s * (GAP_RATIO + 1)) * (zoomTowards % 3), y + (s * (GAP_RATIO + 1)) * Math.floor(zoomTowards / 3), s / 3.3, (zoom > 0.5) ? newZoomTowards : -1);

}

function failed () {
    done = true;
    $("#MD-GameOver").show();
}

// advance the simulation
function step () {
    counter++;
    if (counter % 100 == 0) {
        zoomStep *= 1.1;
    }

    var finalOffX = SIZE * 3.3 * (GAP_RATIO + 1) * (zoomTowards % 3);
    var finalOffY = SIZE * 3.3 * (GAP_RATIO + 1) * Math.floor(zoomTowards / 3);

    xOffset += (finalOffX - xOffset) / ((1 - zoom) / zoomStep);
    yOffset += (finalOffY - yOffset) / ((1 - zoom) / zoomStep);

    zoom += zoomStep;

    if (zoom >= 1) {
        zoom = 0.0;
        xOffset = 0;
        yOffset = 0;
        for (var i = 0; i < big.length; i++)
            big[i] = small[i];
        colorizeGrid(small);
    }

    if (zoom <= 0.5) {
        zoomTowards = newZoomTowards;
        lessThanPointFive = true;
    } else if (lessThanPointFive) {
        lessThanPointFive = false;

        if (goalColor == big[zoomTowards]) {
            score++;
            $("#MD-Score").html(score);
        }
        else
            return failed();

        goalColor = small[Math.floor(Math.random() * small.length)];
    }

    draw();
    setTimeout('step()', TIMEOUT);
}

function keypress (e) {
    // 37,38,39,40,32 :: left,up,right,down,space
    switch(e.which) {
    case 32:
        if (done) {
            restart();
            return false;
        }
        return true;
    case 37:
        if (newZoomTowards % 3 != 0)
            newZoomTowards--;
        return false;
    case 38:
        if (Math.floor(newZoomTowards / 3) != 0)
            newZoomTowards -= 3;
        return false;
    case 39:
        if (newZoomTowards % 3 != 2)
            newZoomTowards++;
        return false;
    case 40:
        if (Math.floor(newZoomTowards / 3) != 2)
            newZoomTowards += 3;
        return false;
    }
    return true;
}

function restart () {
    goalColor = small[Math.floor(Math.random() * small.length)];
    done = false;
    score = 0;
    zoomStep = 0.01;

    $("#MD-Score").html("0");
    $("#MD-GameOver").hide();

    draw();
    setTimeout('step()', TIMEOUT);
}

// initialize
$(document).ready(function () {
                      // It's okay to be square
                      $("#MD-Canvas").height($("#MD-Canvas").width());

                      canvas = $("#MD-Canvas").get()[0];
                      $("#MD-GameOver").hide();

                      if (!canvas.getContext) {
                          console.log("Could not get context");
                          return;
                      }

                      ctxt = canvas.getContext("2d");

                      ctxt.scale(canvas.width / RES, canvas.height / RES);

                      // setup and draw the initial scene
                      colorizeGrid(big);
                      colorizeGrid(small);
                      goalColor = big[Math.floor(Math.random() * big.length)];
                      draw();

                      $(document).keydown(keypress);

                      setTimeout('step()', TIMEOUT);
                  });
