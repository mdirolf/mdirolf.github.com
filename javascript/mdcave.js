var res = 100;
var min_width = 2 * res / 10;
var acc = 0.1;

//initialize the array of top and bottom values
var top;
var bottom;
var positions;
var blockers;

//have we played yet?
var played = false;
//are we done?
var finished;

var last_top;
var last_width;

var score;
var last_pos;

var key;

var velocity;

var canvas;
var ctx;

function keydown (e) {
    if (e.which == 32) { // space
        if (finished && !key) {
            init();
        }
        key = true;
        return false;
    }
    return true;
}

function keypress (e) {
    if (e.which == 32) {
        return false;
    }
    return true;
}

function keyup (e) {
    if (e.which == 32) { // space
        key = false;
        return false;
    }
    return true;
}

function step() {
    score++;

    var new_width = (score % 33 == 0) ? last_width - 1 : last_width;
    new_width = (new_width < min_width) ? min_width : new_width;
    last_top = (new_width < last_width) ? last_top + 0.5 : last_top;

    var rand = Math.random();
    var new_top = (rand > 0.666) ? last_top + 1 : last_top;
    new_top = (rand < 0.333) ? new_top - 1 : new_top;
    new_top = (new_top < 1) ? 1 : new_top;
    new_top = (new_top + new_width > res - 1) ? res - new_width - 1 : new_top;

    last_top = new_top;
    last_width = new_width;

    top.shift();
    top.push(new_top);
    bottom.shift();
    bottom.push(new_top + new_width);

    if(key) {
        velocity = velocity - acc;
        //positions.push(last_pos--);
    }
    else {
        velocity = velocity + acc;
        //positions.push(last_pos++);
    }
    last_pos = last_pos + velocity;
    positions.push(last_pos);
    positions.shift();

    //check walls
    if(positions[res / 5 - 1] < top[res / 5 - 1] || positions[res / 5 - 1] > bottom[res / 5 - 1]) {
        done();
        return;
    }

    //check blockers
    for(var i = 0; i < blockers.length; i++) {
        var cur = positions[res / 5 - 1];
        if (res - score + blockers[i].score == 19) {
            if (cur > blockers[i].pos && cur < blockers[i].pos + res / 10) {
                done();
                return;
            }
        }
    }

    //add blocker
    if(score % (res / 2) == 0) {
        var blocker = {};
        blocker.score = score;
        blocker.pos = Math.random() * (last_width - res / 10) + last_top;
        blockers.push(blocker);
        if(blockers.length > 2)
            blockers.shift();
    }

    setTimeout('step()', 30);
    draw();
}

function done() {
    finished = true;
    draw();

    $("#MD-Score").html(score);
    $("#MD-GameOver").show();
}

function draw() {
    ctx.clearRect(0, 0, res, res);

    if (score % 100 == 0) {
        $("#MD-Score").html(score);
    }

    //draw top
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for(var i = 0; i < res; i++) {
        ctx.lineTo(i, top[i]);
    }
    ctx.lineTo(res - 1, 0);
    ctx.fill();

    //draw bottom
    ctx.beginPath();
    ctx.moveTo(0, res);
    for(i = 0; i < res; i++) {
        ctx.lineTo(i,bottom[i]);
    }
    ctx.lineTo(res - 1, res);
    ctx.fill();

    //draw blockers
    for(i = 0; i < blockers.length; i++) {
        ctx.fillRect(res - score + blockers[i].score, blockers[i].pos, 1, res / 10);
    }

    //draw snake
    ctx.beginPath();
    ctx.moveTo(0, positions[0]);
    for(i = 1; i < res / 5; i++) {
        ctx.lineTo(i,positions[i]);
    }
    ctx.stroke();
}

function init() {
    $("#MD-GameOver").hide();
    $("#MD-Score").html(0);

    finished = false;

    top = new Array();
    bottom = new Array();
    positions = new Array();
    blockers = new Array();

    for(var i = 0; i < res; i++) {
        if(i < res / 5) {
            positions.push(res / 2);
        }
        top.push(res / 10);
        bottom.push(9 * res / 10);
    }

    last_top = res / 10;
    last_width = 8 * res / 10;

    score = 0;
    last_pos = res / 2;

    key = false;
    velocity = 0;

    // Make sure our dimensions are right
    $("#MD-Canvas").height($("#MD-Canvas").width() * 3 / 4);

    canvas = $("#MD-Canvas").get()[0];
    if(!canvas.getContext) {
        console.log("Could not get context");
        return;
    }
    ctx = canvas.getContext("2d");
    ctx.strokeStyle = 'orange';
    ctx.fillStyle = 'black';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if(!played) {
        ctx.scale(canvas.width / res, canvas.height / res);
        played = true;
    }

    //draw the initial scene
    draw();

    $(document).keydown(keydown);
    $(document).keypress(keypress);
    $(document).keyup(keyup);

    setTimeout('step()', 30);
}
$(document).ready(init);
