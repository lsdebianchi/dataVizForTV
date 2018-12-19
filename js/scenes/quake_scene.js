var QuakeScene = function() {
  $("#pure_canvas").css("background-color", "white");

  this.init_time = moment(quake_list[0].timeStamp);
  this.speed = 1;
  this.presence = false;

  this.horizontal_points = 200;
  this.vertical_lines = 25;

  this.lines = [];

  this.quakes = [];
  this.quekes_list_index = 0;

  this.Quake = function(arg, context) {
    this.coord = arg.coordinates;
    this.m = arg.m;
    this.r = arg.radius;
    this.name = arg.locationName;
    this.time = arg.timeStamp;

    this.show_offset = 0;

    this.modul_amp = Math.random() * this.max_modul_amp;
    this.modul_amp_t = Math.random() * this.m;

    this.x = Math.random() * W * 0.8 + W * 0.1;
    let bigness = this.m;
    if (bigness > 5.5) bigness = 5.5;
    this.y =
      H * 0.2 + (this.m / 5.5) * H * 0.6 + (Math.random() - 0.5) * 0.2 * H;

    let li = context.getLineIndexes(this.x, this.y)[1];
    this.myLine = context.lines[li + 1];

    this.text = new P.PointText({
      point: [this.x, this.y + 5 * S],
      content: this.name,
      fillColor: "white",
      fontFamily: "garcia",
      fontSize: (bigness / 5.5) * 25 + 2
    });
    this.text.position.x -= this.text.bounds.width / 2;
    this.text.rotate(90);
    this.text.position.y -= this.text.bounds.height / 2;

    let tm_size = this.text.fontSize * 2;
    let b2 = bigness - 1;
    if (b2 > 0) tm_size += 20 * Math.floor(b2);
    this.textM = new P.PointText({
      point: [this.x, this.y],
      content: this.m,
      fillColor: "white",
      fontFamily: "garcia",
      fontSize: tm_size
    });

    let gray = chroma(this.myLine.fillColor.toCSS());
    gray = gray.set("hsl.l", gray.get("hsl.l") - 0.05);

    this.rectangle = new P.Path.Rectangle({
      point: [
        this.x - (this.text.bounds.width * 1.5) / 2,
        this.y - this.text.bounds.height
      ],
      size: [this.text.bounds.width * 1.5, this.text.bounds.height * 8],
      fillColor: gray.hex(),
      //blendMode: "subtract",
      opacity: 1,
      radius: (this.text.fontSize / 30) * 25
    });
    this.circle = new P.Path.Circle({
      center: [this.x, this.y - this.text.bounds.height + 2 * S],
      radius: this.textM.fontSize * 1,
      fillColor: gray.hex()
    });
    this.rectangle.insertBelow(this.myLine);
    this.circle.insertAbove(this.rectangle);
    this.textM.insertAbove(this.circle);
    this.text.insertAbove(this.rectangle);

    this.placeLabel = function(_offset) {
      this.text.position.x = this.x;
      this.textM.position.x = this.x;
      this.circle.position.x = this.x;
      this.rectangle.position.x = this.x;

      let offset = _offset ? _offset : 0;

      //offset+ = (100 - this.show_offset) / 100;
      offset +=
        (this.show_offset / 100) *
          (-this.circle.bounds.height * 2.6 - this.text.bounds.height * 1.2) +
        this.circle.bounds.height * 2;

      this.text.position.y =
        this.y +
        this.text.bounds.height / 2 +
        this.circle.bounds.height * 0.6 +
        offset;
      this.circle.position.y = this.y + offset;
      this.textM.position.y = this.y + offset;
      this.rectangle.position.y =
        this.y + this.rectangle.bounds.height / 2 + offset;
    };
  };

  this.setup();
  this.collectBack(100);
};

QuakeScene.prototype = {
  collectBack: function(min) {
    var most_past_moment = moment(this.init_time.format());
    most_past_moment.subtract(min, "minutes");

    for (var i in quake_list) {
      let d = moment(quake_list[i].timeStamp).diff(most_past_moment);
      if (d < 0) {
        break;
      }
      this.quakes.push(new this.Quake(quake_list[i], this));
    }
  },

  keydown: function(key) {
    if (key === "p") {
      this.presence = true;
    }
  },

  keyup: function(key) {
    if (key === "p") {
      this.presence = false;
    }
  },

  setup: function() {
    let col = chroma("rgb(240, 130, 60)");
    let b_l = col.get("hsl.l");
    col = col.set("hsl.l", 0.98);

    new P.Path.Rectangle({
      point: [-10, -10],
      size: [W + 20, H + 20],
      fillColor: "black"
    });

    var space_v = H / (this.vertical_lines + 1);
    for (var i = 1; i < this.vertical_lines + 1; i++) {
      let l = new P.Path();
      l.add(new P.Point(-10, H + 10));
      l.add(new P.Point(-10, space_v * i));

      var space_h = W / (this.horizontal_points - 1);
      for (var j = 0; j < this.horizontal_points; j++) {
        l.add(new P.Point(j * space_h, space_v * i));
      }
      l.add(new P.Point(W + 10, space_v * i));
      l.add(new P.Point(W + 10, H + 10));
      l.closePath();
      l.strokeWidth = 50;

      let col = chroma("rgb(240, 130, 60)");
      let b_l = col.get("hsl.l");
      col = col.set("hsl.l", b_l * (i / this.vertical_lines));

      l.fillColor = col.hex();
      l.strokeColor = col.hex();

      l.strokeJoin = "round";
      var g = 255 - i * 10;
      this.lines.push(l);
    }
    for (let i in this.lines) {
      this.lines[i]._phase = i * 2;
      for (let j in this.lines[i].segments) {
        let s = this.lines[i].segments[j];
        s._base_y = s.point.y;
        s._dead = true;
      }
    }
  },

  update: function() {
    if (this.presence) {
      if (this.speed !== 0) {
        this.speed -= 0.035;
        if (this.speed < 0) this.speed = 0;
        for (let i in this.quakes) {
          let q = this.quakes[i];
          q.show_offset += 3.5;
          if (q.show_offset > 100) q.show_offset = 100;
        }
      }
    } else {
      if (this.speed !== 1) {
        this.speed += 0.035;
        if (this.speed > 1) this.speed = 1;
        for (let i in this.quakes) {
          let q = this.quakes[i];
          q.show_offset -= 3.5;
          if (q.show_offset < 0) q.show_offset = 0;
        }
      }
    }

    for (let i in this.lines) {
      for (let j in this.lines[i].segments) {
        let s = this.lines[i].segments[j];
        s._active = false;
      }
    }

    for (let i in this.quakes) {
      let q = this.quakes[i];
      //q.placeLabel();
      q.x += this.speed * S * 0.2;
      if (q.x > W + 150) q.x = -150;
      q.rectangle.position.x += this.speed;
      if (q.rectangle.position.x > W + 150) q.rectangle.position.x = -150;

      //apply QUAKES effect to line point
      q.modul_amp = (Math.sin(q.modul_amp_t) + 1) / 2;
      q.modul_amp_t += 0.005 * q.m;

      ixy = this.getLineIndexes(q.x, q.y);
      var ix = ixy[0];
      var iy = ixy[1];

      if (iy >= this.vertical_lines) iy = this.vertical_lines - 1;
      var l = this.lines[iy];
      var wide = 20;
      for (let j = -wide; j < wide; j++) {
        let s = l.segments[ix + j];
        if (s) {
          s._active = true;
          s._dead = false;
          s._amp = ((wide - Math.abs(j)) / wide) * q.m * 40 * q.modul_amp;
        }
      }
      var wide2 = wide / 2;
      l = this.lines[iy + 1];
      if (l) {
        for (let j = -wide2; j < wide2; j++) {
          let s = l.segments[ix + j];
          if (s) {
            s._active = true;
            s._dead = false;
            s._amp = ((wide - Math.abs(j)) / wide) * q.m * 20 * q.modul_amp;
          }
          if (s && j === 0) {
            q.placeLabel(s.point.y - s._base_y);
          }
        }
      }
      l = this.lines[iy - 1];
      if (l) {
        for (let j = -wide2; j < wide2; j++) {
          let s = l.segments[ix + j];
          if (s) {
            s._active = true;
            s._dead = false;
            s._amp = ((wide - Math.abs(j)) / wide) * q.m * 20 * q.modul_amp;
          }
        }
      }
    }

    // Add movement to line point
    for (let i in this.lines) {
      let l = this.lines[i];
      l._phase += 0.03;
      for (let j in this.lines[i].segments) {
        let s = l.segments[j];
        if (!s || j > this.horizontal_points + 1 || j < 2) continue;
        if (s._dead) {
          continue;
        } else {
          if (!s._active) {
            s.point.y += 0.05 * S;

            //s.point.y = s._base_y;
            if (s.point.y > s._base_y) {
              s.point.y = s._base_y;
              s._amp = 0;
              s._dead = true;
            }
          } else {
            s.point.y +=
              (-s.point.y +
                (s._base_y - Math.sin(j / 2 + l._phase) * s._amp - s._amp)) *
              0.05;
            //s.point.y -= 1 ;
          }
        }
      }
    }
  },

  getLineIndexes: function(x, y) {
    var ix = Math.floor(Math.floor((x / W) * this.horizontal_points));
    var iy = Math.floor(Math.floor((y / H) * (this.vertical_lines + 1)));
    if (iy >= this.vertical_lines) iy = this.vertical_lines - 1;
    return [ix, iy];
  }
  /////
};
