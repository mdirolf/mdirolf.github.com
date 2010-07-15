var urls = ["http://dirolf.com",
            "http://www.mongodb.org",
            "http://loudonvillelongboards.com",
            "http://www.google.com",
            "http://bit.ly",
            "http://bsonspec.org",
            "http://www.10gen.com",
            "http://www.example.net",
            "http://www.youtube.com",
            "http://www.apple.com",
            "http://www.twitter.com/mdirolf",
            "http://en.wikipedia.org",
            "http://twitter.com",
            "http://github.com",
            "http://github.com/mdirolf",
            "http://msn.com",
            "http://foursquare.com",
            "http://last.fm",
            "http://craigslist.org",
            "http://myspace.com",
            "http://bing.com",
            "http://ebay.com",
            "http://en.wikipedia.org/wiki/MongoDB",
            "http://en.wikipedia.org/wiki/BSON"];
var hashes = [];
var shorts = {};
var longs = {};
var current_url;
var current_hash;
var start = (new Date()).getTime();
var score = 0;
var t;

function opt(url) {
    return "<a href='#' onclick='javascript:handle_long(\"" + url + "\")'>" + url + "</a><br>";
}

function lengthen () {
    $("#options").show();
    $("#options").html("");
    $("#text").hide();
    current_hash = hashes[Math.floor(Math.random() * hashes.length)];
    current_url = null;
    $("#help").html("Unshorten this:");
    $("#url").html(current_hash);

    var answer = longs[current_hash];
    var alt1 = answer;
    while (alt1 === answer) {
        alt1 = urls[Math.floor(Math.random() * urls.length)];
    }
    var alt2 = answer;
    while (alt2 === answer || alt2 === alt1) {
        alt2 = urls[Math.floor(Math.random() * urls.length)];
    }
    var options = [opt(answer),
                   opt(alt1),
                   opt(alt2)];
    options.sort(function() { return 0.5 - Math.random(); });
    options.forEach(function(o) {
                        $("#options").append(o);
                    });
}

function shorten () {
    $("#options").hide();
    $("#text").show().focus();
    current_url = urls[Math.floor(Math.random() * urls.length)];
    current_hash = null;
    $("#help").html("Shorten this:");
    $("#url").html("<a href='" + current_url + "'>" + current_url + "</a>");
}

function task (keep_error) {
    clearTimeout(t);
    if (!keep_error) {
        $("#error").html("");
    }
    start = new Date();
    var r = Math.random();
    if (hashes.length === 0 || r < 0.5) {
        shorten();
    } else {
        lengthen();
    }
    t = setTimeout("timeout()", 4000);
}

function added_short () {
    $("#total").html(hashes.length);
    var sum = 0.0;
    hashes.forEach(function (h) {
                       sum += h.length;
                   });
    $("#average").html((sum / hashes.length).toFixed(2));
}

function update_score() {
    $("#score").html(score.toFixed(2));
}

function timeout () {
    fail("504 timed out - gotta be quick");
    task(true);
}

function fail (text) {
    score = Math.min(score - 10, score * 0.75);
    update_score();
    $("#error").html(text);
}

function success (val) {
    score += 100 / val;
    update_score();
}

function handle_short (text) {
    if (!shorts[current_url]) {
        if (!longs[text]) {
            hashes.push(text);
            shorts[current_url] = text;
            longs[text] = current_url;
            added_short();
            success(text.length);
            task();
        } else {
            fail("500 repeat hash");
        }
    } else if (text === shorts[current_url]) {
        success(text.length);
        task();
    } else {
        fail("500 wrong hash");
    }
}

function handle_long (text) {
    if (text === longs[current_hash]) {
        score += 10;
        update_score();
        task();
    } else {
        fail("500 wrong url");
    }
}

function handle_text (e) {
    if (e.which == 13) {
        var text = $.trim($("#text").val());
        if (!text) {
            return true;
        }
        $("#text").val("");

        if (current_url) {
            handle_short(text);
        } else {
            handle_long(text);
        }
        return false;
    }
    return true;
}

function pad(s) {
    s = s.toString();
    return (s.length === 1) ? "0" + s : s;
}

function timers () {
    var now = (new Date()).getTime();
    $("#task_time").html(((now - start) / 1000.0).toFixed(2));
    setTimeout('timers()', 10);
}

function begin (e) {
    if (e.which == 32) {
        $("body").keyup(function () {});
        $("#intro").hide();
        $("#game").show();
        $("#text").keyup(handle_text);
        setTimeout('timers()', 10);
        task();
    }
}

function init () {
    $("#game").hide();
    $("body").keyup(begin);
}

$(document).ready(init);
