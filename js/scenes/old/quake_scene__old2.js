var QuakeScene = function() {
  $("#pure_canvas").css("background-color", "black");

  this.initial_time = new Date();
  console.log(this.initial_time);
  this.offset_seconds = 10;
  this.d_seconds = 0;
  this.initial_time.setSeconds(
    this.initial_time.getSeconds() + this.offset_seconds
  );
  console.log(this.initial_time);

  this.quakes = [];

  this.Quake = function(x, y, m, name, time, dt) {
    this.x = x;
    this.y = y;
    this.m = m;
    this.name = name;
    this.time = time;
    this.dt = dt;

    this.number_waves = this.m;
    this.obs = [];
    this.life = this.number_waves;

    for (var i = 1; i < this.number_waves + 1; i++) {
      let ob = new P.Path.Star({
        center: [this.x, this.y],
        points: 40,
        radius1: i / (this.number_waves + 1) / 10,
        radius2: i / (this.number_waves + 1) / 10,
        strokeColor: "black",
        strokeWidth: this.m,
        opacity: i / (this.number_waves + 1)
        //applyMatrix: false
      });
      ob._s = 0.01;
      ob._l_s = 0.01;
      //ob.smooth();

      this.obs.push(ob);
    }

    this.explosion = new P.Path.Circle({
      center: [this.x, this.y],
      radius: 7 * S,
      fillColor: "white",
      opacity: 0.005
    });

    //path.smooth();
  };

  this.event_index = 0;
  this.eventList = [
    // { name: "", x: 0.2, y: 0.3, time: 1, m: 3 },
    // { name: "", x: 0.6, y: 0.1, time: 4, m: 3 },
    { name: "", x: 0.5, y: 0.5, time: 4, m: 3 }
    // { name: "", x: 0.9, y: 0.6, time: 5, m: 3 }
  ];
  for (var i = 0; i < this.offset_seconds; i++) {
    console.log(this.event_index);

    let new_q = this.eventList[this.event_index];
    if (new_q && new_q.time < i) {
      this.instantiateQuake(this.event_index);
      console.log("GOT" + this.event_index);
      this.event_index++;
    }
  }
};

QuakeScene.prototype = {
  instantiateQuake: function(index) {
    let new_q = this.eventList[index];
    let q = new this.Quake(
      W * new_q.x,
      H * new_q.y,
      new_q.m,
      new_q.name,
      new_q.time,
      0
    );
    this.quakes.push(q);

    for (var i = 0; i < (this.offset_seconds - new_q.time) * 30; i++) {
      this.tick_quake(q);
    }
  },

  tick_quake: function(q) {
    if (q.explosion) {
      let time = 15;
      q.explosion.opacity *= 1.12;
      q.explosion.scale(0.96, 0.96);
      if (q.explosion.opacity >= 50) {
        q.explosion.remove();
        q.explosion = undefined;
        for (let k in q.obs) q.obs[k].strokeColor = "white";
      }
    }

    for (let j in q.obs) {
      let wave = q.obs[j];
      if (!wave) continue;
      //wave.smooth();
      wave._s += 0.01 * q.m * (j * 0.9 + 1);
      wave.strokeWidth = ((300 - wave._s) / 300) * q.m;
      if (wave.strokeWidth <= 0) {
        console.log("killed");
        wave.remove();
        this.life--;
        if (this.life === 0) return false;
        continue;
      }

      wave.scale(1 / wave._l_s);
      wave.scale(wave._s);
      wave._l_s = wave._s;

      let center = new P.Point(wave.position.x, wave.position.y);
      for (let k in wave.segments) {
        if (k % 2 === 0) continue;
        //if (Math.random() * 2 > 1) continue;
        let s = wave.segments[k];
        let dir_v = s.point.subtract(center);
        //dir_v = dir_v.normalize(wave._s * Math.random());
        dir_v = dir_v.normalize(wave._s / 200);
        s.point = s.point.add(dir_v);
      }
    }
    return true;
  },

  update: function() {
    var dt = new Date() - this.initial_time;
    this.d_seconds =
      Math.floor(
        ((((dt % (60 * 60 * 1000 * 24)) % (60 * 60 * 1000)) % (60 * 1000)) /
          1000) *
          1
      ) +
      this.offset_seconds * 2;
    /////
    let new_q = this.eventList[this.event_index];
    if (new_q && new_q.time < this.d_seconds) {
      this.instantiateQuake(this.event_index);
      this.event_index++;
    }
    //////
    for (let i in this.quakes) {
      if (!this.quakes[i]) continue;
      if (this.tick_quake(this.quakes[i]) === false) this.quakes[i] = undefined;
    }
  }
};
