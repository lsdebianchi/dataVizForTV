var WeaponScene = function() {
  $("#pure_canvas").css("background-color", "rgb(230, 230, 230)");

  this.timer = 0;
  this.fallingTreshold = 20 * S;

  this.items_names = ["milk", "weapon", "paper", "cheese", "chicken"];
  this.items_rates = [4, 6, 5, 3, 4];
  this.items_number = this.items_names.length;

  this.ordering = false;
  this.placed = true;

  this.offsetter = 0;

  // this.bg = new P.Path.Rectangle({
  //   pont: [0, 0],
  //   size: [W, H],
  //   fillColor: "white"
  // });

  this.filler = undefined;
  // this.main_label = new P.PointText({
  //   point: [0, H - 6 * S],
  //   content: "0",
  //   fillColor: "black",
  //   fontFamily: "Courier New",
  //   fontWeight: "bold",
  //   fontSize: 6 * S
  // });

  // this.main_label.position.x = W / 2;

  this.Outlet = function(arg, context) {
    console.log("bing");
    this.context = arg.context;

    this.name = arg.name;
    this.rate = arg.rate;
    this.timer = 0;
    this.counter = 0;
    this.next_side_left = true;

    this.base_vel = 0.6 * S;
    this.y = arg.y;
    this.base_y = arg.y;

    this.ty = arg.oy;
    this.target_offset = this.ty - this.y;

    this.item_list = [];

    this.name_label = new P.PointText({
      point: [0, 6 * S],
      content: "Switzerland",
      fillColor: "black",
      fontFamily: "roma",
      fontSize: 6 * S,
      opacity: 0
    });

    this.counter_label = undefined;
    //this.group = new P.Group();

    this.instantiate_item = function() {
      let side = this.next_side_left;

      console.log(this.name + "_SVG");
      let item = this.context[this.name + "_SVG"].copy();
      // let item = new P.Raster({
      //   position: [side ? 0 - 5 * S : W + 5 * S, 0],
      //   source: "./assets/" + this.name + ".png"
      //   //parent: this.group
      //   //size: [10, 10]
      // });
      item.scale(0.2, 0.2);
      item._x = item.position.x;
      item._y = item.position.y;
      item._vx = side ? +this.base_vel : -this.base_vel;
      item._vy = 0;
      item._fallen = false;
      //item.random_y = (Math.random() - 0.5) * 5 * S;

      this.item_list.push(item);

      this.next_side_left = !side;
    };
    this.increase = function() {
      this.counter++;
    };
    this.placeVertically = function(p) {
      this.y = this.base_y + (p * this.target_offset) / 100;
      let po = p - 100 / 3;
      if (po < 0) po = 0;
      po *= 3;
      this.name_label.opacity = po / 100;
    };
    this.placeLabels = function() {
      console.log("he");
      this.name_label.position.y = this.y - 5 * S;
    };
  };

  this.outlests = [];

  this.importCount = 0;
  this.totalImportNumber = 10;

  this.milk_SVG = undefined;
  this.milk_bg_SVG = undefined;
  this.weapon_SVG = undefined;
  this.weapon_bg_SVG = undefined;
  this.paper_SVG = undefined;
  this.paper_bg_SVG = undefined;
  this.chicken_SVG = undefined;
  this.chicken_bg_SVG = undefined;
  this.cheese_SVG = undefined;
  this.cheese_bg_SVG = undefined;

  let imp = new P.Path.Rectangle({
    point: [0, 0],
    size: [0, 0]
  });

  for (let i in this.items_names) {
    let n = this.items_names[i];
    this[n + "_SVG"] = imp.importSVG(
      "./assets/items/" + n + ".svg",
      this.loaderStep()
    );
    this[n + "_bg_SVG"] = imp.importSVG(
      "./assets/items/" + n + "_bg.svg",
      this.loaderStep()
    );
  }
  this.setup();
};

WeaponScene.prototype = {
  loaderStep: function() {
    this.importCount++;
    console.log("imported: " + this.importCount);
    if (this.importCount == this.totalImportNumber) {
      console.log("import ready!");
      //console.log(this.milk_SVG);

      this.setup();
    }
  },
  setup: function() {
    for (let i = 0; i < this.items_names.length; i++) {
      let new_out = new this.Outlet({
        name: this.items_names[i],
        rate: this.items_rates[i],
        context: this,
        y: H * 0.2,
        oy: (i * H * 0.8) / this.items_number + H * 0.2
      });
      this.outlests.push(new_out);
    }

    this.filler = new P.Path.Rectangle({
      point: [0, H],
      size: [W, 10],
      fillColor: "white",
      blendMode: "difference"
    });
  },

  update: function() {
    this.timer++;

    // this.filler.bounds.height += (H / (60 * 30)) * 10;
    // if (this.filler.position.y < H / 2) {
    //   this.filler.opacity -= 0.03;
    //   if (this.filler.opacity <= 0) {
    //     this.filler.bounds.height = 0.01;
    //     this.filler.position.y = H;
    //     this.filler.opacity = 1;
    //   }
    // } else this.filler.position.y = H - this.filler.bounds.height / 2;

    for (let i in this.outlests) {
      let out = this.outlests[i];

      if (out.timer <= 0) {
        out.timer = out.rate;
        out.instantiate_item();
      } else out.timer--;

      if (!this.placed) {
        if (this.ordering) {
          this.offsetter += 0.1 * S;
          if (this.offsetter >= 100) {
            this.offsetter = 100;
            this.placed = true;
          }
          //out.y = out.base_y + out.current_offset;
        } else {
          this.offsetter -= 0.1 * S;
          if (this.offsetter <= 0) {
            this.offsetter = 0;
            this.placed = true;
          }
          //out.y = out.base_y + out.current_offset;
        }
        out.placeVertically(this.offsetter);

        out.placeLabels();
      }

      for (let i in out.item_list) {
        item = out.item_list[i];

        item._x += item._vx;
        item._y += item._vy;

        item.position.x = item._x;
        item.position.y = item._y + out.y; // + item.random_y;

        if (item._fallen) {
          item._vr = item._vy * 0.4 * item._r_dir;

          item.rotate(item._vr);
          item._vx *= 0.98;
          if (item._vy < out.base_vel * 2) item._vy *= 1.2;
          if (item.position.y > H + 10 * S) {
            item.remove();
            out.increase();
            out.item_list.splice(i, 1);
          }
        } else {
          if (Math.abs(item.position.x - W / 2) < this.fallingTreshold) {
            item._fallen = true;
            item._r_dir = item._vx > 0 ? +1 : -1;
            item._vy = 0.1;
          }
        }
      }
    }
  },

  keydown: function(key) {
    if (key === "p") {
      this.ordering = true;
      this.placed = false;
    }
  },

  keyup: function(key) {
    if (key === "p") {
      this.ordering = false;
      this.placed = false;
    }
  }
};
