var TimeScene = function() {
  $("#pure_canvas").css("background-color", "black");

  this.column_number = 20;
  this.column_w = W / this.column_number;
  this.row_h = this.column_w / 5;
  this.row_number = H / this.row_h + 1;

  this.loop_size = 7;

  this.TimeStamp = function(arg) {
    this.context = arg.context;

    this.place = arg.place;
    this.x = arg.x;
    this.y = arg.y;
    this.w = arg.w;
    this.h = arg.h;
    this.loop_i = arg.loop_i;

    this.intensity = 0;
    this.latency = 3;

    this.my_update_index = undefined;

    this.time = moment();

    let bg = this.loop_i * 4;

    this.frame = new P.Path.Rectangle({
      point: [this.x - this.w / 2, this.y - this.h / 2],
      size: [this.w, this.h],
      strokeColor: "white",
      strokeWidth: 0,
      fillColor: "rgb(" + bg + ", " + bg + ", " + bg + ")"
    });

    this.time_lablel = new P.PointText({
      point: [this.x, this.y],
      content: this.place + " | " + this.time.format("hh:mm:ss a"),
      fillColor: "white",
      fontFamily: "arial",
      fontSize: this.h * 0.8,
      opacity: 0.8
    });

    let old_w = this.time_lablel.bounds.width;
    this.time_lablel.bounds.width = this.w * 0.9;
    this.time_lablel.bounds.height = this.h / ((old_w / this.w) * 1.1);

    this.time_lablel.position.x = this.x; // - this.time_lablel.bounds.width / 2;
    this.time_lablel.position.y = this.y; // + this.time_lablel.bounds.height / 4;

    this.city_lablel = undefined;
    this.clock_lablel = undefined;

    // this.name_label = new P.PointText({
    //   point: [0, 6 * S],
    //   content: "Switzerland",
    //   fillColor: "black",
    //   fontFamily: "roma",
    //   fontSize: 6 * S,
    //   opacity: 0
    // });

    this.update = function() {
      this.intensity -= this.latency;
      if (this.intensity <= 0) {
        this.context.updateList.splice(this.my_update_index, 0);
      }
      let l = this.loop_i * 4 + (this.intensity / 100) * 255;
      this.frame.fillColor = "rgb(" + l + ", " + l + ", " + l + ")";
    };
  };

  this.UpdateEvent = function(arg) {
    this.i = arg.i;
    this.j = arg.j;
    this.context = arg.parent;
    this.timer_limit = 5;
    this.timer = this.timer_limit;

    this.update = function() {
      this.timer--;
      if (this.timer <= 0) {
        this.timer = this.timer_limit;

        let dir1 = Math.random() - 0.5;
        let dir2 = Math.random() - 0.5;
        if (dir1 > 0) this.i += dir2 > 0 ? 1 : -1;
        else this.j += dir2 > 0 ? 1 : -1;

        if (this.i >= this.context.column_number) this.i = 0;
        else if (this.i < 0) this.i = this.context.column_number - 1;
        if (this.j >= this.context.row_number) this.j = 0;
        else if (this.j < 0) this.j = this.context.row_number - 1;

        this.context.stamps[this.i][this.j].intensity = 100;
        this.context.stamps[this.i][
          this.j
        ].my_update_index = this.context.updateList.length;
        this.context.updateList.push(this.context.stamps[this.i][this.j]);
      }
    };
  };

  this.stamps = [];
  this.updateEvents = [];
  this.updateList = [];
  console.log("launch");
  this.setup();
};

TimeScene.prototype = {
  setup: function() {
    for (let i = 0; i < this.column_number; i++) {
      this.stamps.push([]);
      for (let j = 0; j < this.row_number; j++) {
        let s = new this.TimeStamp({
          x: i * this.column_w + this.column_w / 2,
          y: j * this.row_h + this.row_h / 2,
          w: this.column_w,
          h: this.row_h,
          place: "Here",
          context: this,
          loop_i: ((i + j) % this.loop_size) + 1
        });
        this.stamps[i].push(s);
      }
    }

    let uen = 1;
    for (let i = 0; i < uen; i++) {
      console.log("placed");
      this.updateEvents.push(
        new this.UpdateEvent({
          i: Math.floor(this.column_number / 2),
          j: Math.floor(this.row_number / 2),
          parent: this
        })
      );
    }
  },

  update: function() {
    for (let i in this.updateList) {
      this.updateList[i].update();
    }

    for (let i in this.updateEvents) {
      this.updateEvents[i].update();
    }
  },

  keydown: function(key) {
    if (key === "p") {
    }
  },

  keyup: function(key) {
    if (key === "p") {
    }
  }
};
