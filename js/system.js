//
//
var Scenes = {
  Wave: WaveScene,
  Weapon: WeaponScene,
  Quake: QuakeScene
};

setup();

function setup() {
  W = $("#pure_canvas").width();
  H = $("#pure_canvas").height();
  S = W / 100;
  C = document.getElementById("pure_canvas").getContext("2d");
  P.setup(document.getElementById("paper_canvas"));

  T = new P.Tool();
  setupPaperToolEvent();

  loadCurrentScene();

  startAnimating(FRAMERATE);
}

function startAnimating(fps) {
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;
  animate();
}
// the animation loop calculates time elapsed since the last loop
// and only draws if your specified fps interval is achieved
function animate() {
  // request another frame
  requestAnimationFrame(animate);
  // calc elapsed time since last loop
  now = Date.now();
  elapsed = now - then;
  // if enough time has elapsed, draw the next frame
  if (elapsed > fpsInterval) {
    // Get ready for next frame by setting then=now, but also adjust for your
    // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
    then = now - (elapsed % fpsInterval);
    // Put your drawing code here
    if (current_scene.update) current_scene.update();
  }
}

function loadCurrentScene() {
  let new_scene = scene_name_list[scene_index];
  console.log(new_scene);
  current_scene = new Scenes[new_scene]();
}

function clearScene() {
  $("#pure_canvas").css("background-color", "rgb(46, 46, 46)");
  C.clearRect(0, 0, W, H);
  for (let i in P.view.children) {
    let el = P.view.choldren[i];
    el.remove();
  }
  current_scene = undefined;
}

window.onresize = function() {
  W = $("#pure_canvas").width();
  H = $("#pure_canvas").height();
  S = W / 100;

  // console.log(W);
  // console.log(H);
};

function setupPaperToolEvent() {
  T.onMouseDown = function(event) {
    //
  };

  T.onMouseMove = function(event) {
    //event.item
  };

  T.onMouseDrag = function(event) {
    //event.delta.x;
  };

  T.onMouseUp = function(event) {
    //
  };
}

function map_val(val, a1, a2, b1, b2) {
  var v = ((val - a1) / (a2 - a1)) * (b2 - b1) + b1;
  if (v < b1) v = b1;
  if (v > b2) v = b2;
  return v;
}
