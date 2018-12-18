var WaveScene = function() {
  $("#pure_canvas").css("background-color", "black");

  this.t = 0;
  this.t_speed = 1 / 30;

  this.n_of_beaches = 10;
  this.dw_beaches = W / this.n_of_beaches;
  this.beaches = [];
  this.moving = false;
  this.ordered = false;

  this.Beach = function(arg) {
    this.x = arg.x;
    this.w = arg.w;

    this.tx = undefined;
    this.initial_x = this.x;

    this.ready_to_change_sand_text = false;
    this.hide_sea_text = true;

    this.frequency = Math.PI / (5 + Math.random() * 10); // period of the wave movement
    // this.frequency = Math.PI / 5;
    this.w_height = arg.w_height; // amplitude of the wave movement
    //this.w_height = H * 0.2 + Math.random() * H * 0.6;
    this.name = arg.name;
    this.country = arg.country;
    this.temperature = arg.temperature;
    this.wave_tall_meters = arg.tall_meters;
    this.tide = H - arg.w_height; // where the waves top chrashing 100 = top of the screen
    //  this.tide = H * 0.1 + Math.random() * H * 0.8;

    let img_w = 404;
    let img_h = 2500;

    ////ELEMENTS
    this.sand = new P.Raster({
      source: "./assets/sand.jpg",

      position: [this.x + this.w / 2, H / 2 - Math.random() * 15 * S],
      size: [404, 2500],
      shadowColor: new P.Color(0, 0, 0),
      shadowBlur: 100,
      shadowOffset: new P.Point(0, 0)
    });
    this.sand.scale(this.w / 404, (this.w / 404) * 1.5);
    //shuffle sand image
    {
      if (arg.i % 4 === 1) this.sand.scale(1, -1);
      if (arg.i % 4 === 2) this.sand.scale(1, 1);
      if (arg.i % 4 === 3) this.sand.scale(1, -1);
    }
    this.generateText = function(content) {
      this.textSand = new P.PointText({
        point: [this.x, this.tide + 3 * S],
        content: content,
        fillColor: "rgb(255, 212, 170)",
        fontFamily: "libertine",
        blendMode: "soft-light",
        fontWeight: "bold",
        fontSize: 25
      });
      this.textSand.insertAbove(this.sand);
      this.textSand.rotate(90);
      let lead_size = this.w_height;
      if (this.tide + this.w_height > H) lead_size = H - this.tide;

      let old_h = this.textSand.bounds.height;
      this.textSand.bounds.height = lead_size;
      this.textSand.bounds.width =
        (this.textSand.bounds.height / old_h) * this.textSand.bounds.width;

      if (this.textSand.bounds.width >= this.w) {
        console.log("too much");
        let old_w = this.textSand.bounds.width;

        this.textSand.bounds.width = this.w - 1 * S;
        this.textSand.bounds.height =
          (this.textSand.bounds.width / old_w) * this.textSand.bounds.height;
      }
    };
    this.textSand = undefined;
    this.generateText("");
    this.sandShadow = new P.Path.Rectangle({
      point: [this.x, 0],
      size: [this.w, H]
    });
    this.wave = new P.Raster({
      source: "./assets/water.jpg",
      // blendMode: "subtract",
      position: [this.x + this.w / 2, H / 2],
      size: [404, 2500]
    });
    this.wave.scale(this.w / 404);
    this.waveBaseHeight = this.wave.bounds.height;
    //shuffle wave image
    {
      if (arg.i % 4 === 1) this.wave.scale(-1, -1);
      if (arg.i % 4 === 2) this.wave.scale(1, 1);
      if (arg.i % 4 === 3) this.wave.scale(1, -1);
    }
    this.waveCrestSize = 5 * S;
    this.waveCrest = new P.Path.Rectangle({
      point: [this.x, (this.tide * H) / 100],
      size: [this.w, this.waveCrestSize],
      fillColor: {
        gradient: {
          stops: [
            "rgb(255, 255, 255, 0)",

            "rgb(255, 255, 255)",
            "rgb(255, 255, 255)",
            "rgba(255, 255, 255, 0.7)",
            "rgba(255, 255, 255, 0)"
          ]
        },
        origin: [this.x + this.w / 2, (this.tide * H) / 100],
        destination: [this.x + this.w / 2, (this.tide * H) / 100 + 5 * S]
      }
    });
    this.waveShadow = new P.Path.Rectangle({
      point: [this.x, 0],
      size: [this.w, H],
      // blendMode: "doge",
      fillColor: {
        gradient: {
          stops: ["rgba(0, 0, 255, 0)", "rgba(0, 0, 85, 1)"]
        },
        origin: [this.x, (this.tide * H) / 100 + 10 * S],
        destination: [this.x, H]
      }
    });
    this.waveText = new P.PointText({
      point: [this.x, this.tide + 3 * S],
      content: this.name,
      fillColor: "black",
      fontFamily: "libertine",
      blendMode: "overlay",
      fontWeight: "bold",
      fontSize: 25
    });
    //correctly size the wave text
    {
      this.waveText.rotate(90);
      let lead_size = H - this.tide;

      let old_h = this.waveText.bounds.height;
      this.waveText.bounds.height = lead_size - 3 * S;
      this.waveText.bounds.width =
        (this.waveText.bounds.height / old_h) * this.waveText.bounds.width;

      if (this.waveText.bounds.width >= this.w) {
        let old_w = this.waveText.bounds.width;

        this.waveText.bounds.width = this.w - 3 * S;
        this.waveText.bounds.height =
          (this.waveText.bounds.width / old_w) * this.waveText.bounds.height;
      }
    }
    //FUNCTIONS
    this.placeSand = function(p) {
      this.sand.position.x = this.x + this.w / 2;
    };
    this.placeSandShadow = function(p) {
      this.sandShadow.position.x = this.x + this.w / 2;
      if (!this.sandShadow._last_p) {
        this.sandShadow._last_p = p;
        return;
      }
      if (p > this.sandShadow._last_p) {
        this.sandShadow._last_p = p;
        return;
      }
      this.sandShadow.fillColor = {
        gradient: {
          stops: [
            "rgba(0, 0, 50, " + 1 + ")",
            "rgba(0, 0, 50, " + (0.8 - (0.8 * (100 - p)) / 100) + ")",
            "rgba(0, 0, 50, " + 0 + ")"
          ]
        },
        origin: [
          this.x + this.w / 2,
          (1.5 * this.w_height * (100 - p)) / 100 + this.tide
        ],
        destination: [this.x + this.w / 2, this.tide]
      };
      this.sandShadow._last_p = p;
    };
    this.placeWave = function(p) {
      this.wave.bounds.height = this.waveBaseHeight + (p / 100) * 25 * S;

      this.wave.position.x = this.x + this.w / 2;
      this.wave.position.y =
        ((100 - p) / 100) * this.w_height +
        this.wave.bounds.height / 2 +
        this.tide; //+ ((100 - p) / 100) * H;
    };
    this.placeCrest = function(p) {
      this.waveCrest.position.x = this.x + this.w / 2;
      this.waveCrest.position.y = ((100 - p) / 100) * this.w_height + this.tide;
      this.waveCrest.bounds.height = (this.waveCrestSize * 2 * (p + 20)) / 100;
    };
    this.placeWaveShadow = function(p) {
      this.waveShadow.position.x = this.x + this.w / 2;
      let dest = ((100 - p) / 100) * this.w_height + this.tide;
      if (dest > H) dest = H;
      this.waveShadow.fillColor = {
        gradient: {
          stops: ["rgba(0, 0, 85, " + 1 + ")", "rgba(0, 0, 255, 0)"]
        },
        origin: [this.x, H + 0.5 * S],
        destination: [this.x, dest]
      };
    };
    this.placeSandText = function(p) {
      this.textSand.position.x = this.x + this.w / 2;
      if (!this.textSand._last_p) {
        this.textSand._last_p = p;
        return;
      }
      if (p > this.textSand._last_p) {
        this.textSand._last_p = p;
        return;
      }
      if (p > 50) p = 70;
      p *= 2;
      this.textSand.opacity = p / 100;
      this.textSand._last_p = p;
    };
    this.placeWaveText = function(p) {
      this.waveText.position.x = this.x + this.w / 2;
      this.waveText.position.y =
        3 * S +
        this.waveText.bounds.height / 2 +
        ((100 - p) / 100) * this.w_height +
        this.tide;
      p -= 50;
      if (p < 0) p = 0;
      if (this.hide_sea_text) p = 0;
      this.waveText.opacity = p / 100;
    };

    this.getNewText = function(mov, order) {
      if (!mov && order) {
        let choice = Math.floor(Math.random() * 4);
        if (choice === 0) this.generateText(this.temperature + "°C");
        else if (choice === 1) this.generateText(this.wave_tall_meters + " m");
      } else {
        this.generateText("");
      }
    };
  };

  this.setup();
};

WaveScene.prototype = {
  setup: function() {
    this.create_beaches();
  },

  create_beaches: function() {
    for (var i = 0; i < this.n_of_beaches; i++) {
      let b = new this.Beach({
        x: i * this.dw_beaches,
        w: this.dw_beaches,
        i: i,
        name: beaches_list[i].name,
        temperature: beaches_list[i].temperature,
        tall_meters: beaches_list[i].w_height[0],
        country: beaches_list[i].country,
        w_height: H * 0.2 + Math.random() * H * 0.6
      });
      this.beaches.push(b);
    }
  },

  update: function() {
    this.t += this.t_speed;

    // beach loop
    for (let i in this.beaches) {
      let beach = this.beaches[i];

      let p = 50 * Math.sin(this.t * beach.frequency) + 50;

      beach.placeSandShadow(p);
      beach.placeWave(p);
      beach.placeCrest(p);
      beach.placeWaveShadow(p);
      beach.placeSand(p);
      beach.placeSandText(p);
      beach.placeWaveText(p);

      if (p < 98) beach.ready_to_change_sand_text = true;
      if (p > 98 && beach.ready_to_change_sand_text) {
        beach.ready_to_change_sand_text = false;
        beach.getNewText(this.moving, this.ordered);
      }
      if (p < 10) {
        if (!this.moving && this.ordered) beach.hide_sea_text = false;
        else beach.hide_sea_text = true;
      }
    }

    // beach rearrange movement
    if (this.moving) {
      let arrivals = 0;

      for (let i in this.beaches) {
        let beach = this.beaches[i];
        beach.x -= (beach.x - beach.tx) * 0.1;
        if (Math.abs(beach.x - beach.tx) <= 1) {
          beach.x = beach.tx;
          arrivals++;
        }
      }
      if (arrivals == this.n_of_beaches) {
        this.moving = false;
      }
    }
  },

  keydown: function(key) {
    if (key === "p") {
      if (!this.ordered) {
        this.moving = true;
        this.ordered = true;
        //order tides from low to high
        let indexes = [];
        for (let i in this.beaches) {
          indexes.push(i);
        }
        let sorted_indexes = [];
        for (let i in this.beaches) {
          if (i === 0) sorted_indexes.push(i);
          else {
            let placed = false;
            for (let j in sorted_indexes) {
              if (
                this.beaches[i].tide >= this.beaches[sorted_indexes[j]].tide
              ) {
                sorted_indexes.splice(j, 0, i);
                placed = true;
                break;
              }
            }
            if (!placed) sorted_indexes.push(i);
          }
        }

        //set target x for beaches
        for (let i in sorted_indexes) {
          let b = this.beaches[sorted_indexes[i]];
          b.tx = i * this.dw_beaches;
        }
      }
    }
  },

  keyup: function(key) {
    if (key === "p") {
      this.moving = true;
      this.ordered = false;
      for (let i in this.beaches) {
        let b = this.beaches[i];
        b.tx = b.initial_x;
      }
    }
  }
};

function rand_r(a, b) {
  var n = Math.random() * (b - a) + a;
  return n.toFixed(2);
}
