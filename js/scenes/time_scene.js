var TimeScene = function() {
  $("#pure_canvas").css("background-color", "black");

  this.tick_timer = 0;
  this.showHere = false;
  this.tickReady = false;

  this.originPlace = "Zurich";

  this.column_number = 17;
  this.column_w = W / this.column_number;
  this.row_h = this.column_w / 2.5;
  this.row_number = Math.floor(H / this.row_h + 1);

  this.loop_size = 5;

  this.stamps = [];
  //this.updateEvents = [];
  this.minuteEvent = undefined;
  this.hoursEvent = undefined;
  this.explosion = undefined;

  this.updateList = [];

  this.TimeStamp = function(arg) {
    this.context = arg.context;

    this.place_key = arg.place;
    this.place = arg.place.replace(/_/g, " ");
    if (this.place.length > 12) this.place = this.place.substring(0, 11) + ".";
    this.x = arg.x;
    this.y = arg.y;
    this.w = arg.w;
    this.h = arg.h;
    this.loop_i = arg.loop_i;

    this.originActivated = false;

    this.intensity = 0;
    this.latency = 4;

    this.my_update_index = undefined;

    this.UTC = arg.UTC;
    this.time = moment().utcOffset(this.UTC);

    let bg = this.loop_i * 4;

    this.city_lablel = undefined;
    this.clock_lablel = undefined;

    this.context.drawStamp(this);

    this.update = function() {
      // if (this.intensity - this.latency < 0) this.originActivated = false;
      this.context.drawStamp(this);

      this.intensity -= this.latency;
      let del = false;

      if (this.intensity <= 0) {
        this.intensity = 0;
        del = true;
      }
      return del;
    };
  };

  this.UpdateEvent = function(arg) {
    this.i = arg.i;
    this.j = arg.j;
    this.context = arg.parent;
    this.speed = arg.speed;
    this.timer = this.speed;

    this.type = arg.type; //0 min, 1 hours, 2 propagate

    this.update = function() {
      this.timer--;
      if (this.timer <= 0) {
        this.timer = this.speed;
        // let dir1 = Math.random() - 0.5;
        // let dir2 = Math.random() - 0.5;
        // if (dir1 > 0) this.i += dir2 > 0 ? 1 : -1;
        // else this.j += dir2 > 0 ? 1 : -1;

        if (this.type == 0) {
          //MIN
          this.j = Math.floor(
            (moment().minutes() / 60) * this.context.row_number
          );
          this.i++;
          if (this.i >= this.context.column_number) {
            this.i = 0;
          }
        } else if (this.type == 1) {
          //HOURS
          this.i = Math.round(
            ((Number(moment().format("h")) - 1) / 12) *
              this.context.column_number
          );
          this.j++;
          if (this.j >= this.context.row_number) {
            this.j = 0;
          }
        }

        let stamp = this.context.stamps[this.i][this.j];
        stamp.intensity = 100;
        stamp.originActivated = false;
        stamp.time = moment().utcOffset(stamp.UTC);
        this.context.updateList.push(stamp);
      }
    };
  };

  this.UpdateExplosion = function(arg) {
    this.last_pos = [];
    this.last_pos.push([arg.i, arg.j]);

    this.speed = arg.speed;
    this.timer = arg.speed;
    this.context = arg.parent;

    this.update = function() {
      this.timer--;
      if (this.timer <= 0) {
        this.timer = this.speed;
        let stamp_l = this.context.stamps;

        for (let k = 0; k < this.last_pos.length; k++) {
          let p = this.last_pos[k];

          let stamp = stamp_l[p[0]][p[1]];
          stamp.intensity = 100;
          stamp.time = moment().utcOffset(stamp.UTC);
          stamp._visited = true;
          stamp.originActivated = true;
          // this.context.updateList.push(stamp);
          this.context.drawStampSingle(stamp);

          this.last_pos.splice(k, 1);
          if (
            stamp_l[p[0]] &&
            stamp_l[p[0]][p[1] + 1] &&
            !stamp_l[p[0]][p[1] + 1]._visited
          ) {
            this.last_pos.push([p[0], p[1] + 1]);
            k++;
          }
          if (
            stamp_l[p[0] + 1] &&
            stamp_l[p[0] + 1][p[1]] &&
            !stamp_l[p[0] + 1][p[1]]._visited
          ) {
            this.last_pos.push([p[0] + 1, p[1]]);
            k++;
          }
          if (
            stamp_l[p[0] - 1] &&
            stamp_l[p[0] - 1][p[1]] &&
            !stamp_l[p[0] - 1][p[1]]._visited
          ) {
            this.last_pos.push([p[0] - 1, p[1]]);
            k++;
          }
          if (
            stamp_l[p[0]] &&
            stamp_l[p[0]][p[1] - 1] &&
            !stamp_l[p[0]][p[1] - 1]._visited
          ) {
            this.last_pos.push([p[0], p[1] - 1]);
            k++;
          }
        }

        if (this.last_pos.length == 0) {
          this.context.tickReady = true;
          for (let i in stamp_l) {
            for (let j in stamp_l[i]) {
              stamp_l[i][j]._visited = false;
            }
          }
          // this.last_pos.push([
          //   Math.floor(this.context.column_number / 2),
          //   Math.floor(this.context.row_number / 2)
          // ]);
        }
      }
    };
  };

  console.log("launch");
  this.setup();
};

TimeScene.prototype = {
  drawStampSingle: function(s) {
    let c_bg = s.loop_i * 6 + (s.intensity / 100) * 30;
    c_bg = s.loop_i * 6; //+ (s.intensity / 100) * 50;
    //let c_bg = Math.floor(Math.random() * 255);
    C.fillStyle = "rgb(" + c_bg + ", " + c_bg + ", " + c_bg + ")";

    C.fillRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h);
    // C.clearRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h);

    let originPlace = this.originPlace.replace(/_/g, " ");
    if (originPlace.length > 12)
      originPlace = originPlace.substring(0, 11) + ".";

    let originTime = moment().utcOffset(timeZone_list[this.originPlace].UTC);

    C.fillStyle = "rgb(" + 255 + ", " + 255 + ", " + 255 + ")";

    C.font = /*big*/ +s.h * 0.35 + "px Inconsolata";
    C.textAlign = "left";
    let margin = S * 0.5;

    C.fillText(originPlace, margin + s.x - s.w / 2, s.y - s.h / 10);

    C.fillStyle = "rgb(" + 255 + ", " + 255 + ", " + 0 + ")";
    C.fillText(
      originTime.format("HH:mm:ss"),
      margin + s.x - s.w / 2,
      s.y + s.h / 3.5
    );
  },

  drawStamp: function(s) {
    let c_bg = s.loop_i * 6 + (s.intensity / 100) * 30;
    c_bg = s.loop_i * 6; //+ (s.intensity / 100) * 50;
    //let c_bg = Math.floor(Math.random() * 255);
    C.fillStyle = "rgb(" + c_bg + ", " + c_bg + ", " + c_bg + ")";

    C.fillRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h);

    let c_yellow = s.loop_i * 6 + (s.intensity / 100) * 255;

    if (s.intensity > 1 && !s.originActivated) {
      C.fillStyle = "rgb(" + c_yellow + ", " + c_yellow + ", " + 0 + ")";
      C.beginPath();
      C.arc(s.x + s.w / 5, s.y + s.h / 6, 0.1 * S, 0, 2 * Math.PI);
      C.fill();
    }

    // C.strokeStyle = "white";
    C.fillStyle = "white";

    let big = s.intensity >= 95 ? -0.05 * S : 0;

    C.font = /*big*/ +s.h * 0.35 + "px Inconsolata";
    C.textAlign = "left";
    let margin = S * 0.5;

    let originPlace = this.originPlace.replace(/_/g, " ");
    if (originPlace.length > 12)
      originPlace = originPlace.substring(0, 11) + ".";

    let originTime = moment().utcOffset(timeZone_list[this.originPlace].UTC);

    let place = s.originActivated ? originPlace : s.place;
    let time = s.originActivated ? originTime : s.time;

    l = 150 + (s.intensity / 100) * 255;
    C.fillStyle = "rgb(" + l + ", " + l + ", " + l + ")";
    C.fillText(place, margin + s.x - s.w / 2, s.y - s.h / 10);

    l = (s.intensity / 100) * 255;
    C.fillStyle = "rgb(" + 255 + ", " + 255 + ", " + (255 - l) + ")";
    C.fillText(
      time.format("HH:mm:ss"),
      margin + s.x - s.w / 2,
      s.y + s.h / 3.5
    );

    // if (s.intensity >= 80) {
    //   let lw = 2;
    //   C.fillRect(s.x - s.w / 2, s.y - s.h / 2 + lw, s.w, lw);
    //   C.fillRect(s.x + s.w / 2 - lw, s.y - s.h / 2, lw, s.h);
    //   C.fillRect(s.x - s.w / 2, s.y + s.h / 2 - lw, s.w, lw);
    //   C.fillRect(s.x - s.w / 2 + lw, s.y - s.h / 2, lw, s.h);
    // }
  },

  setup: function() {
    for (let i = 0; i < this.column_number; i++) {
      this.stamps.push([]);
      for (let j = 0; j < this.row_number; j++) {
        let city = randomProperty(timeZone_list)[0];

        let s = new this.TimeStamp({
          x: i * this.column_w + this.column_w / 2,
          y: j * this.row_h + this.row_h / 2,
          w: this.column_w,
          h: this.row_h,
          place: city,
          UTC: timeZone_list[city].UTC,
          context: this,
          loop_i: ((i + j) % this.loop_size) + 1
        });
        this.stamps[i].push(s);
      }
    }

    this.minuteEvent = new this.UpdateEvent({
      i: 0,
      j: Math.floor((moment().minutes() / 60) * this.row_number),
      type: 0,
      parent: this,
      speed: 30 / this.column_number
    });
    this.hoursEvent = new this.UpdateEvent({
      i: Math.floor(
        ((Number(moment().format("h")) - 1) / 12) * this.column_number
      ),
      j: 0,
      type: 1,
      parent: this,
      speed: 30 / this.row_number
    });
    // for (let i = 0; i < uen; i++) {
    //   console.log("placed");
    //   this.updateEvents.push(
    //     new this.UpdateEvent({
    //       i: Math.floor(Math.random() * this.column_number),
    //       j: Math.floor(Math.random() * this.row_number),
    //       parent: this
    //     })
    //   );
    // }
  },

  update: function() {
    for (let i = 0; i < this.updateList.length; i++) {
      if (this.updateList[i].update()) {
        this.updateList.splice(i, 1);
      }
    }
    if (!this.showHere) {
      this.minuteEvent.update();
      this.hoursEvent.update();
    } else {
      console.log("show");
      this.explosion.update();
      if (this.tickReady) {
        console.log("tick");
        this.tick_timer--;
        if (this.tick_timer <= 0) {
          this.tick_timer = 30;
          for (let i in this.stamps) {
            for (let j in this.stamps[i]) {
              this.drawStampSingle(this.stamps[i][j]);
            }
          }
        }
      }
    }

    // for (let i in this.updateEvents) {
    //   this.updateEvents[i].update();
    // }
  },

  keydown: function(key) {
    if (key === "p") {
      if (!this.showHere) {
        this.explosion = new this.UpdateExplosion({
          i: Math.floor(this.column_number / 2),
          j: Math.floor(this.row_number / 2),
          speed: 1,
          parent: this
        });
        this.updateList = [];
      }
      this.showHere = true;
      this.minuteEvent.i = this.column_number;
      this.hoursEvent.j = this.row_number;
    }
  },

  keyup: function(key) {
    if (key === "p") {
      this.tickReady = false;

      this.showHere = false;
      this.explosion = undefined;
      for (let i in this.stamps) {
        for (let j in this.stamps[i]) {
          this.updateList.push(this.stamps[i][j]);
        }
      }
    }
  }
};
