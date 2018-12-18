var Distance_tracker = function() {
  this.active = false;
  this.meter = document.getElementById("d_meter_point");
  this.value = 50;
  this.detected = 0;
  this.was_detected = 0;
  this.cal_close = 400;
  this.cal_far = 100;
  this.tracker = new tracking.ObjectTracker("face");
  this.tracker.setInitialScale(2.4);
  this.tracker.setStepSize(2);
  this.tracker.setEdgesDensity(0.1);

  this.tracker.on(
    "track",
    function(event) {
      this.was_detected = this.detected;

      var rect = event.data[0];

      if (rect) {
        this.detected = 1;
        var new_val = map_val(
          rect.width + rect.height,
          this.cal_close,
          this.cal_far,
          0,
          200
        );

        this.value += (new_val - this.value) * 0.1;
        this.update_meter();
      } else {
        this.detected = 0;
      }
    }.bind(this)
  );
};

Distance_tracker.prototype = {
  start: function() {
    this.active = true;
    this.trackerTask = tracking.track("#webcam", this.tracker, {
      camera: true
    });
  },

  stop: function() {
    this.active = false;
    this.value = 0;
    this.trackerTask.stop();
    _myStream.getTracks()[0].stop();
  },

  update_meter: function() {
    this.meter.style.left = this.value - 100 + "px";
  }
};

function map_val(val, a1, a2, b1, b2) {
  var v = ((val - a1) / (a2 - a1)) * (b2 - b1) + b1;
  if (v < b1) v = b1;
  if (v > b2) v = b2;
  return v;
}
