$("body").on("mousedown", function(e) {});

var KeyNames = {
  _32: "space",
  _80: "p"
};

$("body").on("keyup", function(e) {
  if (e.which == 16) {
    //SHIFT
    SHIFT = false;
  }
  if (e.which == 91) {
    //MAIUSC
    CMD = false;
  }
  //send key event to current project
  if (KeyNames["_" + e.which]) {
    current_scene.keyup(KeyNames["_" + e.which]);
  }
});

$("body").on("keydown", function(e) {
  //ARROW RIGHT
  if (e.which == 39) {
    clearScene();
    scene_index++;
    scene_index %= scene_name_list.length;
    loadCurrentScene();
  }
  //ARROW LEFT
  else if (e.which == 37) {
    clearScene();
    scene_index--;
    if (scene_index < 0) scene_index = scene_name_list.length - 1;
    loadCurrentScene();
  }
  if (KeyNames["_" + e.which]) {
    current_scene.keydown(KeyNames["_" + e.which]);
  }
});
