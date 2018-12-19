var SHIFT = false;
var CMD = false;

var W = window.innerWidth;
var H = window.innerHeight;
var S = W / 100;
var FRAMERATE = 30;

// var scene_name_list = ["Wave", "Time", "Quake", "Weapon"];
var scene_name_list = ["Wave", "Time", "Quake"];
var current_scene;
var scene_index = 0;

var P = paper;
var T; //paper tool

var fps, fpsInterval, startTime, now, then, elapsed;
