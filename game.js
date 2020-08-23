window.addEventListener("load", function () {
  //Get a CanvasRenerContext2D object
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("2d"); // For manipulating the canvas object

  //Set Logical canvas dimensions != intrinsic canvas size
  canvas.width = 500; //1034
  canvas.height = 500; //658

  //Pixelate Image
  context.imageSmoothingEnabled = false;

  const World = function (url, sTW, sTH, tW, tH, bW, map) {
    this.tileSet = new Image();
    this.tileSet.src = url;
    this.sourceTileWidth = sTW;
    this.sourceTileHeight = sTH;
    this.tileWidth = tW;
    this.tileHeight = tH;
    this.borderWidth = bW;

    this.map = map; // Add feature: Can change maps

    this.boundary = new World.Boundary(
      this.tileWidth * 0.3,
      0,
      this.tileWidth * 2.4,
      this.tileHeight * 2.5
    );
    this.hillboundary = new World.Boundary(
      this.tileWidth * 0.3,
      0,
      this.tileWidth * 2.4,
      this.tileHeight * 4
    );
    this.waterboundary = new World.Boundary(
      this.tileWidth * 4.5,
      0,
      this.tileWidth * 11,
      this.tileHeight * 5.5
    );

    this.worldboundary = new World.Boundary(
      0,
      0,
      this.map[0].length * this.tileWidth,
      this.map.length * this.tileHeight
    );

    this.doorway = new World.Doorway(
      this.tileWidth * 1,
      this.tileHeight * 0,
      this.tileWidth,
      this.tileHeight,
      this.tileWidth * 1,
      this.tileHeight * 3.6
    );
  };

  World.Boundary = function (
    boundary_x,
    boundary_y,
    boundary_width,
    boundary_height
  ) {
    this.boundary_x = boundary_x;
    this.boundary_y = boundary_y;
    this.boundary_height = boundary_height;
    this.boundary_width = boundary_width;

    this.collide = function (object) {
      let colliding = true;

      // inner top
      if (
        object.getLeftSafety() > this.boundary_x &&
        object.getRightSafety() < this.boundary_x + this.boundary_width &&
        object.getTop() < this.boundary_y &&
        object.getPrevTop() >= this.boundary_y
      ) {
        object.setTop(this.boundary_y);
      }
      // inner left
      if (
        object.getLeft() < this.boundary_x &&
        object.getPrevLeft() >= this.boundary_x &&
        object.getTopSafety() <= this.boundary_y + this.boundary_height &&
        object.getBottomSafety() >= boundary_y
      ) {
        object.setLeft(this.boundary_x);
      }
      // inner right
      if (
        object.getRight() > this.boundary_x + this.boundary_width &&
        object.getPrevRight() <= this.boundary_x + this.boundary_width &&
        object.getBottomSafety() <= this.boundary_y + this.boundary_height &&
        object.getTopSafety() >= this.boundary_y
      ) {
        object.setRight(this.boundary_x + this.boundary_width);
      }
      // outer left
      if (
        object.getRight() > this.boundary_x &&
        object.getPrevRight() <= this.boundary_x &&
        object.getTopSafety() <= this.boundary_y + this.boundary_height &&
        object.getBottomSafety() >= this.boundary_y
      ) {
        object.setRight(this.boundary_x);
      }
      // outer bottom
      if (
        object.getRightSafety() > this.boundary_x &&
        object.getLeftSafety() < this.boundary_x + this.boundary_width &&
        object.getTop() < this.boundary_y + this.boundary_height &&
        object.getPrevTop() >= this.boundary_y + this.boundary_height
      ) {
        object.setTop(this.boundary_y + this.boundary_height);
      }
      // outer right
      if (
        object.getLeft() < this.boundary_x + this.boundary_width &&
        object.getPrevLeft() >= this.boundary_x + this.boundary_width &&
        object.getTopSafety() <= this.boundary_y + this.boundary_height &&
        object.getBottomSafety() >= this.boundary_y
      ) {
        object.setLeft(this.boundary_x + this.boundary_width);
      }
      // outer top
      if (
        object.getLeftSafety() > this.boundary_x &&
        object.getRightSafety() < this.boundary_x + this.boundary_width &&
        object.getBottom() > this.boundary_y + this.boundary_height &&
        object.getTop() < this.boundary_y + this.boundary_height &&
        object.getPrevBottom() <= this.boundary_y + this.boundary_height
      ) {
        object.setBottom(this.boundary_y + this.boundary_height);
      }

      if (
        !(object.getTop() < this.boundary_y) ||
        !(object.getLeft() < this.boundary_x) ||
        !(object.getRight() > this.boundary_x + this.boundary_width) ||
        !(object.getBottom() > this.boundary_y + this.boundary_height)
      ) {
        colliding = false;
      }
      return colliding;
    };
  };

  const Animator = function (animation, delay, mode = "loop") {
    this.count = 0;
    this.delay = delay >= 1 ? delay : 1;
    this.animation = animation;
    this.frameIndex = 0;
    this.frame = animation[0];
    this.mode = mode;

    this.animate = function () {
      switch (this.mode) {
        case "loop":
          this.loop();
          break;
        case "pause":
          break;
      }
    };

    this.changeAnimation = function (
      animation,
      mode,
      delay = 3,
      frameIndex = 0
    ) {
      if (this.animation == animation) {
        return;
      }

      this.count = 0;
      this.delay = delay;
      this.animation = animation;
      this.frameIndex = frameIndex;
      this.frame = animation[frameIndex];
      this.mode = mode;
    };

    this.loop = function () {
      this.count++;

      while (this.count > this.delay) {
        this.count -= this.delay;
        this.frameIndex =
          this.frameIndex > 0 ? this.frameIndex - 1 : this.animation.length - 1;

        this.frame = this.animation[this.frameIndex];
      }
    };
  };

  //Define player constructor function
  const Object = function (url, x, y, width, height) {
    this.sprite = new Image();
    if (url) this.sprite.src = url;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.offset_top = 0;
    this.offset_left = 0;
    this.offset_right = 0;
    this.offset_bottom = 0;

    this.getTop = function () {
      return this.y + this.offset_top;
    };
    this.getLeft = function () {
      return this.x + this.offset_left;
    };
    this.getRight = function () {
      return this.x + this.width - this.offset_right;
    };
    this.getBottom = function () {
      return this.y + this.height - this.offset_bottom;
    };
    this.getCenterX = function () {
      return (this.getLeft() + this.getRight()) / 2;
    };
    this.getCenterY = function () {
      return (this.getTop() + this.getBottom()) / 2;
    };
    this.getPrevTop = function () {
      return this.prevY + this.offset_top;
    };
    this.getPrevLeft = function () {
      return this.prevX + this.offset_left;
    };
    this.getPrevRight = function () {
      return this.prevX + this.width - this.offset_right;
    };
    this.getPrevBottom = function () {
      return this.prevY + this.height - this.offset_bottom;
    };
    this.getPrevCenterX = function () {
      return (this.getPrevLeft() + this.getPrevRight()) / 2;
    };
    this.getPrevCenterY = function () {
      return (this.getPrevTop() + this.getPrevBottom()) / 2;
    };

    this.setTop = function (top) {
      this.y = top - this.offset_top;
    };
    this.setLeft = function (left) {
      this.x = left - this.offset_left;
    };
    this.setRight = function (right) {
      this.x = right - this.width + this.offset_right;
    };
    this.setBottom = function (bottom) {
      this.y = bottom - this.height + this.offset_bottom;
    };

    this.collideObject = function (object) {
      if (
        this.getRight() < object.getLeft() ||
        this.getBottom() < object.getTop() ||
        this.getLeft() > object.getRight() ||
        this.getTop() > object.getBottom()
      )
        return false;
      return true;
    };
  };

  World.Doorway = function (x, y, width, height, destination_x, destination_y) {
    Object.call(this, false, x, y, width, height);
    this.destination_x = destination_x;
    this.destination_y = destination_y;

    this.teleport = function (object) {
      object.x = this.destination_x;
      object.y = this.destination_y;
    };
  };

  //prettier-ignore
  const world = new World("img/tilemaps/beach.png", 112, 112, 94, 94, 5, [
    ["AA", "CO", "CA", "AN", "AH", "DN", "DN", "DN", "DN", "DN", "DN", "DN", "DN", "DN", "DN", "BI", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN"],
    ["AB", "BB", "CB", "AN", "AI", "EN", "EN", "AJ", "FF", "FF", "BJ", "EN", "EN", "EN", "EN", "BH", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN"],
    ["AC", "BC", "CC", "CN", "AH", "FN", "FN", "BI", "AO", "BO", "CI", "FN", "FN", "FN", "FN", "BI", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN"],
    ["AD", "HN", "CD", "AN", "AI", "GN", "GN", "DI", "AP", "BP", "CI", "GN", "GN", "GN", "GN", "BH", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN"],
    ["AN", "AN", "AN", "AN", "AH", "DN", "DN", "AK", "FG", "GG", "BK", "DN", "DN", "DN", "DN", "BI", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN"],
    ["AN", "BN", "AN", "AN", "AM", "AF", "BF", "CF", "DF", "AF", "BF", "CF", "DF", "AF", "BF", "BM", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN"],
    ["CN", "AN", "AN", "CN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN"],
    ["AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "BN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN"],
    ["AN", "AN", "AN", "BN", "AN", "AN", "CN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN"],
  ]);

  const MovingObject = function (
    url,
    x,
    y,
    width,
    height,
    speed = 5,
    direction = "up"
  ) {
    Object.call(this, url, x, y, width, height);
    this.prevX = x;
    this.prevY = y;
    this.speed = speed;
    this.direction = direction;

    this.moveUp = function () {
      this.direction = "up";
      this.y -= this.speed;
    };

    this.moveRight = function () {
      this.direction = "right";
      this.x += this.speed;
    };

    this.moveDown = function () {
      this.direction = "down";
      this.y += this.speed;
    };

    this.moveLeft = function () {
      this.direction = "left";
      this.x -= this.speed;
    };

    this.getTopSafety = function () {
      return this.getTop() + this.speed;
    };

    this.getLeftSafety = function () {
      return this.getLeft() + this.speed;
    };

    this.getRightSafety = function () {
      return this.getRight() - this.speed;
    };

    this.getBottomSafety = function () {
      return this.getBottom() - this.speed;
    };
    this.getPrevTopSafety = function () {
      return this.getPrevTop() + this.speed;
    };

    this.getPrevLeftSafety = function () {
      return this.getPrevLeft() + this.speed;
    };

    this.getPrevRightSafety = function () {
      return this.getPrevRight() - this.speed;
    };

    this.getPrevBottomSafety = function () {
      return this.getPrevBottom() - this.speed;
    };
  };

  const Frame = function (source_x, source_y, source_width, source_height) {
    this.source_x = source_x;
    this.source_y = source_y;
    this.source_width = source_width;
    this.source_height = source_height;
  };

  const Player = function () {
    MovingObject.call(this, "img/dog.png", 10, 100, 112, 112, 5);
    this.offset_bottom = 0;
    this.offset_left = 20;
    this.offset_right = 20;
    this.offset_top = 40;

    this.animations = {
      walkup: [
        new Frame(0, 32 * 2, 32, 32),
        new Frame(32, 32 * 2, 32, 32),
        new Frame(64, 32 * 2, 32, 32),
        new Frame(96, 32 * 2, 32, 32),
      ],
      walkdown: [
        new Frame(0, 32 * 0, 32, 32),
        new Frame(32, 32 * 0, 32, 32),
        new Frame(64, 32 * 0, 32, 32),
        new Frame(96, 32 * 0, 32, 32),
      ],
      walkright: [
        new Frame(0, 32 * 1, 32, 32),
        new Frame(32, 32 * 1, 32, 32),
        new Frame(64, 32 * 1, 32, 32),
        new Frame(96, 32 * 1, 32, 32),
      ],
      walkleft: [
        new Frame(0, 32 * 3, 32, 32),
        new Frame(32, 32 * 3, 32, 32),
        new Frame(64, 32 * 3, 32, 32),
        new Frame(96, 32 * 3, 32, 32),
      ],
      sitright: [
        new Frame(0, 32 * 4, 32, 32),
        new Frame(32, 32 * 4, 32, 32),
        new Frame(64, 32 * 4, 32, 32),
        new Frame(96, 32 * 4, 32, 32),
      ],
      bark: [
        new Frame(0, 32 * 5, 32, 32),
        new Frame(32, 32 * 5, 32, 32),
        new Frame(64, 32 * 5, 32, 32),
      ],
      sleep: [new Frame(0, 32 * 6, 32, 32), new Frame(32, 32 * 6, 32, 32)],
      runright: [new Frame(0, 32 * 8, 32, 32), new Frame(32, 32 * 8, 32, 32)],
      sad: [new Frame(96, 32 * 7, 32, 32)],
    };

    this.animation = this.animations["walkdown"];
    this.totalHearts = 3;
    Animator.call(this, this.animation, 3, "pause");

    this.update = function () {};
  };

  //create player object
  const player = new Player("img/dog.png");

  const Bullet = function (ex, ey) {
    MovingObject.call(this, "img/cats/furball.png", ex, ex, 56, 56, 6);
    this.ex = ex;
    this.ey = ey;
    this.speed = 6;

    this.animations = {
      spin: [
        new Frame(32 * 0, 32 * 0, 32, 32),
        new Frame(32 * 1, 32 * 2, 32, 32),
        new Frame(32 * 2, 32 * 2, 32, 32),
      ],
    };
    this.animation = this.animations["spin"];
    Animator.call(this, this.animation, 7, "loop");
    this.dist = Math.hypot(player.y - this.ey, player.x - this.ex);
    this.update = function () {
      this.ex += ((player.y - this.ey) / this.dist) * this.speed;
      this.ex += ((player.x - this.ex) / this.dist) * this.speed;
    };
  };
  const SlidingCat = function (x, y) {
    MovingObject.call(this, "img/cats/cat.png", x, y, 112, 112, 3);
    this.offset_bottom = 5;
    this.offset_left = 30;
    this.offset_right = 30;
    this.offset_top = 45;
    this.walkSpeed = 3;
    this.pounceSpeed = 15;
    this.maxSteps = 20;

    this.animations = {
      walkdown: [
        new Frame(32 * 0, 32 * 0, 32, 32),
        new Frame(32 * 1, 32 * 0, 32, 32),
        new Frame(32 * 2, 32 * 0, 32, 32),
        new Frame(32 * 3, 32 * 0, 32, 32),
      ],
      walkright: [
        new Frame(32 * 0, 32 * 1, 32, 32),
        new Frame(32 * 1, 32 * 1, 32, 32),
        new Frame(32 * 2, 32 * 1, 32, 32),
        new Frame(32 * 3, 32 * 1, 32, 32),
      ],
      walkup: [
        new Frame(32 * 0, 32 * 2, 32, 32),
        new Frame(32 * 1, 32 * 2, 32, 32),
        new Frame(32 * 2, 32 * 2, 32, 32),
        new Frame(32 * 3, 32 * 2, 32, 32),
      ],
      walkleft: [
        new Frame(32 * 0, 32 * 3, 32, 32),
        new Frame(32 * 1, 32 * 3, 32, 32),
        new Frame(32 * 2, 32 * 3, 32, 32),
        new Frame(32 * 3, 32 * 3, 32, 32),
      ],
      sit: [
        new Frame(32 * 0, 32 * 4, 32, 32),
        new Frame(32 * 1, 32 * 4, 32, 32),
        new Frame(32 * 2, 32 * 4, 32, 32),
        new Frame(32 * 3, 32 * 4, 32, 32),
      ],
      sitting: [new Frame(32 * 3, 32 * 4, 32, 32)],
      yawn: [
        new Frame(32 * 0, 32 * 5, 32, 32),
        new Frame(32 * 1, 32 * 5, 32, 32),
        new Frame(32 * 2, 32 * 5, 32, 32),
        new Frame(32 * 3, 32 * 5, 32, 32),
      ],
      fallright: [
        new Frame(32 * 0, 32 * 6, 32, 32),
        new Frame(32 * 1, 32 * 6, 32, 32),
        new Frame(32 * 2, 32 * 6, 32, 32),
        new Frame(32 * 3, 32 * 6, 32, 32),
      ],
      sleep: [
        new Frame(32 * 0, 32 * 7, 32, 32),
        new Frame(32 * 1, 32 * 7, 32, 32),
      ],
      pounceright: [new Frame(32 * 2, 32 * 7, 32, 32)],
      pounceleft: [new Frame(32 * 3, 32 * 7, 32, 32)],
      pouncedown: [new Frame(32 * 0, 32 * 4, 32, 32)],
      pounceup: [new Frame(32 * 2, 32 * 2, 32, 32)],
    };
    this.animation = this.animations["yawn"];
    Animator.call(this, this.animation, 7, "loop");

    this.state = "follow";

    this.update = function () {
      switch (this.state) {
        case "follow":
          if (player.getBottom() > this.getTop()) {
            if (
              this.animation != this.animations["walkright"] &&
              this.animation != this.animations["walkleft"]
            )
              this.changeAnimation(this.animations["walkdown"], "loop");
            this.moveDown();
          }
          if (player.getTop() < this.getBottom()) {
            if (
              this.animation != this.animations["walkright"] &&
              this.animation != this.animations["walkleft"]
            )
              this.changeAnimation(this.animations["walkup"], "loop");
            this.moveUp();
          }
          if (player.getLeft() > this.getRight()) {
            this.changeAnimation(this.animations["walkright"], "loop");
            this.moveRight();
          }
          if (player.getRight() < this.getLeft()) {
            this.changeAnimation(this.animations["walkleft"], "loop");
            this.moveLeft();
          }

          if (
            player.getRight() > enemy.getLeft() - world.tileWidth &&
            player.getBottom() > enemy.getTop() - world.tileHeight &&
            player.getLeft() < enemy.getRight() + world.tileWidth &&
            player.getTop() < enemy.getBottom() + world.tileHeight
          ) {
            this.state = "slideready";
            this.pounceBegin = 30;
          }
          break;
        case "slideready":
          this.pounceBegin -= 1;
          if (this.pounceBegin <= 0) {
            this.dist = Math.hypot(player.y - this.y, player.x - this.x);
            this.state = "slide";
            this.speed = this.pounceSpeed;
            this.countPounce = 0;
          }

          let x = player.getCenterX() - enemy.getCenterX();
          let y = enemy.getCenterY() - player.getCenterY();

          if (y < x && y < -x) {
            this.changeAnimation(this.animations["pouncedown"], "loop");
          } else if (y > x && y > -x) {
            this.changeAnimation(this.animations["pounceup"], "loop");
          } else if (y < x && y > -x) {
            this.changeAnimation(this.animations["pounceright"], "loop");
          } else if (y > x && y < -x) {
            this.changeAnimation(this.animations["pounceleft"], "loop");
          }

          if (
            !(
              player.getRight() > enemy.getLeft() - world.tileWidth &&
              player.getBottom() > enemy.getTop() - world.tileHeight &&
              player.getLeft() < enemy.getRight() + world.tileWidth &&
              player.getTop() < enemy.getBottom() + world.tileHeight
            )
          ) {
            this.speed = this.walkSpeed;
            this.state = "follow";
          }

          break;

        case "slide":
          this.countPounce++;
          if (
            this.countPounce <
            Math.min(this.maxSteps, Math.ceil(this.dist / this.speed))
          ) {
            this.y += ((player.y - this.y) / this.dist) * this.speed;
            this.x += ((player.x - this.x) / this.dist) * this.speed;
          } else {
            if (
              player.getRight() > enemy.getLeft() - world.tileWidth &&
              player.getBottom() > enemy.getTop() - world.tileHeight &&
              player.getLeft() < enemy.getRight() + world.tileWidth &&
              player.getTop() < enemy.getBottom() + world.tileHeight
            ) {
              this.state = "slideready";
              this.pounceBegin = 30;
            } else {
              this.speed = this.walkSpeed;
              this.state = "follow";
              this.countPounce = 0;
              this.pounceBegin = 30;
            }
          }

          break;
      }
    };
  };

  const ShootingCat = function (x, y) {
    MovingObject.call(this, "img/cats/cat2.png", x, y, 112, 112, 3);
    this.offset_bottom = 5;
    this.offset_left = 30;
    this.offset_right = 30;
    this.offset_top = 45;
    this.speed = 1.5;
    this.count = 0;
    this.animations = {
      walkdown: [
        new Frame(32 * 0, 32 * 0, 32, 32),
        new Frame(32 * 1, 32 * 0, 32, 32),
        new Frame(32 * 2, 32 * 0, 32, 32),
        new Frame(32 * 3, 32 * 0, 32, 32),
      ],
      walkright: [
        new Frame(32 * 0, 32 * 1, 32, 32),
        new Frame(32 * 1, 32 * 1, 32, 32),
        new Frame(32 * 2, 32 * 1, 32, 32),
        new Frame(32 * 3, 32 * 1, 32, 32),
      ],
      walkup: [
        new Frame(32 * 0, 32 * 2, 32, 32),
        new Frame(32 * 1, 32 * 2, 32, 32),
        new Frame(32 * 2, 32 * 2, 32, 32),
        new Frame(32 * 3, 32 * 2, 32, 32),
      ],
      walkleft: [
        new Frame(32 * 0, 32 * 3, 32, 32),
        new Frame(32 * 1, 32 * 3, 32, 32),
        new Frame(32 * 2, 32 * 3, 32, 32),
        new Frame(32 * 3, 32 * 3, 32, 32),
      ],
      sit: [
        new Frame(32 * 0, 32 * 4, 32, 32),
        new Frame(32 * 1, 32 * 4, 32, 32),
        new Frame(32 * 2, 32 * 4, 32, 32),
        new Frame(32 * 3, 32 * 4, 32, 32),
      ],
      sitting: [new Frame(32 * 3, 32 * 4, 32, 32)],
      yawn: [
        new Frame(32 * 0, 32 * 5, 32, 32),
        new Frame(32 * 1, 32 * 5, 32, 32),
        new Frame(32 * 2, 32 * 5, 32, 32),
        new Frame(32 * 3, 32 * 5, 32, 32),
      ],
      fallright: [
        new Frame(32 * 0, 32 * 6, 32, 32),
        new Frame(32 * 1, 32 * 6, 32, 32),
        new Frame(32 * 2, 32 * 6, 32, 32),
        new Frame(32 * 3, 32 * 6, 32, 32),
      ],
      sleep: [
        new Frame(32 * 0, 32 * 7, 32, 32),
        new Frame(32 * 1, 32 * 7, 32, 32),
      ],
      pounceright: [new Frame(32 * 2, 32 * 7, 32, 32)],
      pounceleft: [new Frame(32 * 3, 32 * 7, 32, 32)],
      pouncedown: [new Frame(32 * 0, 32 * 4, 32, 32)],
      pounceup: [new Frame(32 * 2, 32 * 2, 32, 32)],
    };
    this.animation = this.animations["yawn"];
    Animator.call(this, this.animation, 7, "loop");

    this.state = "follow";

    this.update = function () {
      switch (this.state) {
        case "follow":
          if (player.getBottom() > this.getTop()) {
            if (
              this.animation != this.animations["walkright"] &&
              this.animation != this.animations["walkleft"]
            )
              this.changeAnimation(this.animations["walkdown"], "loop");
            this.moveDown();
          }
          if (player.getTop() < this.getBottom()) {
            if (
              this.animation != this.animations["walkright"] &&
              this.animation != this.animations["walkleft"]
            )
              this.changeAnimation(this.animations["walkup"], "loop");
            this.moveUp();
          }
          if (player.getLeft() > this.getRight()) {
            this.changeAnimation(this.animations["walkright"], "loop");
            this.moveRight();
          }
          if (player.getRight() < this.getLeft()) {
            this.changeAnimation(this.animations["walkleft"], "loop");
            this.moveLeft();
          }

          if (
            player.getRight() > this.getLeft() - 3 * world.tileWidth &&
            player.getBottom() > this.getTop() - 3 * world.tileHeight &&
            player.getLeft() < this.getRight() + 3 * world.tileWidth &&
            player.getTop() < this.getBottom() + 3 * world.tileHeight
          ) {
            this.state = "shoot";
            this.pounceBegin = 30;
          }
          break;
        case "shoot":
          this.mode = "pause";
          this.count++;
          let x2 = player.getCenterX() - this.getCenterX();
          let y2 = this.getCenterY() - player.getCenterY();
          if (y2 < x2 && y2 < -x2) {
            this.changeAnimation(this.animations["walkdown"], "pause");
          } else if (y2 > x2 && y2 > -x2) {
            this.changeAnimation(this.animations["walkup"], "pause");
          } else if (y2 < x2 && y2 > -x2) {
            this.changeAnimation(this.animations["walkright"], "pause");
          } else if (y2 > x2 && y2 < -x2) {
            this.changeAnimation(this.animations["walkleft"], "pause");
          }
          if (this.count == 30) {
            const bullet = new Bullet(this.x, this.y);
            this.count = 0;
          }
          if (
            !(
              player.getRight() > this.getLeft() - 3 * world.tileWidth &&
              player.getBottom() > this.getTop() - 3 * world.tileHeight &&
              player.getLeft() < this.getRight() + 3 * world.tileWidth &&
              player.getTop() < this.getBottom() + 3 * world.tileHeight
            )
          ) {
            this.state = "follow";
            this.mode = "loop";
            this.count = 0;
          }
      }
    };
  };

  const ChasingCat = function (x, y) {
    MovingObject.call(this, "img/cats/cat3.png", x, y, 112, 112, 3);
    this.offset_bottom = 5;
    this.offset_left = 30;
    this.offset_right = 30;
    this.offset_top = 45;
    this.speed = 4.5;
    this.restcount = 0;

    this.animations = {
      walkdown: [
        new Frame(32 * 0, 32 * 0, 32, 32),
        new Frame(32 * 1, 32 * 0, 32, 32),
        new Frame(32 * 2, 32 * 0, 32, 32),
        new Frame(32 * 3, 32 * 0, 32, 32),
      ],
      walkright: [
        new Frame(32 * 0, 32 * 1, 32, 32),
        new Frame(32 * 1, 32 * 1, 32, 32),
        new Frame(32 * 2, 32 * 1, 32, 32),
        new Frame(32 * 3, 32 * 1, 32, 32),
      ],
      walkup: [
        new Frame(32 * 0, 32 * 2, 32, 32),
        new Frame(32 * 1, 32 * 2, 32, 32),
        new Frame(32 * 2, 32 * 2, 32, 32),
        new Frame(32 * 3, 32 * 2, 32, 32),
      ],
      walkleft: [
        new Frame(32 * 0, 32 * 3, 32, 32),
        new Frame(32 * 1, 32 * 3, 32, 32),
        new Frame(32 * 2, 32 * 3, 32, 32),
        new Frame(32 * 3, 32 * 3, 32, 32),
      ],
      sit: [
        new Frame(32 * 0, 32 * 4, 32, 32),
        new Frame(32 * 1, 32 * 4, 32, 32),
        new Frame(32 * 2, 32 * 4, 32, 32),
        new Frame(32 * 3, 32 * 4, 32, 32),
      ],
      sitting: [new Frame(32 * 3, 32 * 4, 32, 32)],
      yawn: [
        new Frame(32 * 0, 32 * 5, 32, 32),
        new Frame(32 * 1, 32 * 5, 32, 32),
        new Frame(32 * 2, 32 * 5, 32, 32),
        new Frame(32 * 3, 32 * 5, 32, 32),
      ],
      fallright: [
        new Frame(32 * 0, 32 * 6, 32, 32),
        new Frame(32 * 1, 32 * 6, 32, 32),
        new Frame(32 * 2, 32 * 6, 32, 32),
        new Frame(32 * 3, 32 * 6, 32, 32),
      ],
      sleep: [
        new Frame(32 * 0, 32 * 7, 32, 32),
        new Frame(32 * 1, 32 * 7, 32, 32),
      ],
      pounceright: [new Frame(32 * 2, 32 * 7, 32, 32)],
      pounceleft: [new Frame(32 * 3, 32 * 7, 32, 32)],
      pouncedown: [new Frame(32 * 0, 32 * 4, 32, 32)],
      pounceup: [new Frame(32 * 2, 32 * 2, 32, 32)],
    };
    this.animation = this.animations["yawn"];
    Animator.call(this, this.animation, 7, "loop");

    this.state = "follow";

    this.update = function () {
      switch (this.state) {
        case "follow":
          this.count++;
          if (player.getBottom() > this.getTop()) {
            if (
              this.animation != this.animations["walkright"] &&
              this.animation != this.animations["walkleft"]
            )
              this.changeAnimation(this.animations["walkdown"], "loop");
            this.moveDown();
          }
          if (player.getTop() < this.getBottom()) {
            if (
              this.animation != this.animations["walkright"] &&
              this.animation != this.animations["walkleft"]
            )
              this.changeAnimation(this.animations["walkup"], "loop");
            this.moveUp();
          }
          if (player.getLeft() > this.getRight()) {
            this.changeAnimation(this.animations["walkright"], "loop");
            this.moveRight();
          }
          if (player.getRight() < this.getLeft()) {
            this.changeAnimation(this.animations["walkleft"], "loop");
            this.moveLeft();
          }
          if (this.count == 120) {
            this.count = 0;
            this.state = "rest";
          }
          break;

        case "rest":
          this.changeAnimation(this.animations["yawn"], "loop");

          this.restcount++;

          if (this.restcount == 180) {
            this.restcount = 0;
            this.state = "follow";
          }
          break;
      }
    };
  };

  const enemy = new SlidingCat(1000, 100);
  const enemy2 = new ShootingCat(1000, 100);
  const enemy3 = new ChasingCat(1000, 100);

  const heart = new Object("img/heart.png", 0, 0, 25, 25);
  heart.frame = new Frame(0, 0, 254, 254);

  const Camera = function () {
    this.x = 0;
    this.y = 0;
    this.width = 500;
    this.height = 500;
    this.blindspot = 50;

    this.setCamera = function () {
      if (player.getRight() > this.x + this.width - this.blindspot)
        this.x += player.speed;
      if (player.getBottom() > this.y + this.width - this.blindspot)
        this.y += player.speed;
      if (player.getLeft() < this.x + this.blindspot) this.x -= player.speed;
      if (player.getTop() < this.y + this.blindspot) this.y -= player.speed;
      this.repositionCamera();
    };

    this.moveCamera = function (dx, dy) {
      if (player.prevX != player.x || player.prevY != player.y) {
        console.log(player.prevX, player.x);
        if (
          player.getLeft() > this.blindspot &&
          player.getRight() <
            world.map[0].length * world.tileWidth - this.blindspot
        ) {
          this.x += dx;
        }
        if (
          player.getTop() > this.blindspot &&
          player.getBottom() <
            world.map.length * world.tileHeight - this.blindspot
        ) {
          this.y += dy;
        }
        this.repositionCamera();
      }
    };
    this.repositionCamera = function () {
      if (this.y < 0) {
        this.y = 0;
      }
      if (this.y > world.map.length * world.tileHeight - this.height) {
        this.y = world.map.length * world.tileHeight - this.height;
      }
      if (this.x < 0) {
        this.x = 0;
      }
      if (this.x > world.map[0].length * world.tileWidth - this.width) {
        this.x = world.map[0].length * world.tileWidth - this.width;
      }
    };
  };

  const camera = new Camera();
  let vdirection = [];
  let hdirection = [];
  let damageCooldown = 0;
  //let pause = false;
  const update = function () {
    enemy.prevX = enemy.x;
    enemy.prevY = enemy.y;
    enemy2.prevX = enemy2.x;
    enemy2.prevY = enemy2.y;
    enemy3.prevX = enemy3.x;
    enemy3.prevY = enemy3.y;
    player.prevX = player.x;
    player.prevY = player.y;

    enemy.update();
    enemy2.update();
    enemy3.update();
    player.mode = "loop";
    if (controller.down.active == false) {
      if (vdirection.includes("down"))
        vdirection.splice(vdirection.indexOf("down"), 1);
    }
    if (controller.down.active) {
      if (!hdirection.includes("right") && !hdirection.includes("left"))
        player.changeAnimation(player.animations["walkdown"], "loop");
      player.moveDown();
      //camera.moveCamera(0, player.speed)
      if (vdirection.includes("down") == false) {
        vdirection.push("down");
      }
    }
    if (controller.up.active == false) {
      if (vdirection.includes("up"))
        vdirection.splice(vdirection.indexOf("up"), 1);
    }
    if (controller.up.active) {
      if (!hdirection.includes("right") && !hdirection.includes("left"))
        player.changeAnimation(player.animations["walkup"], "loop");
      player.moveUp();
      //camera.moveCamera(0, -player.speed)
      if (vdirection.includes("up") == false) {
        vdirection.push("up");
      }
    }
    if (controller.right.active == false) {
      if (hdirection.includes("right"))
        hdirection.splice(hdirection.indexOf("right"), 1);
    }
    if (controller.right.active) {
      player.changeAnimation(player.animations["walkright"], "loop");
      player.moveRight();
      //camera.moveCamera(player.speed, 0)
      if (hdirection.includes("right") == false) {
        hdirection.push("right");
      }
    }
    if (controller.left.active == false) {
      if (hdirection.includes("left"))
        hdirection.splice(hdirection.indexOf("left"), 1);
    }
    if (controller.left.active) {
      player.changeAnimation(player.animations["walkleft"], "loop");
      player.moveLeft();
      //camera.moveCamera(-player.speed, 0)
      if (hdirection.includes("left") == false) {
        hdirection.push("left");
      }
    }

    ////////////////////////

    if (controller.up.active && controller.down.active) {
      if (hdirection[0] == "up") {
        player.changeAnimation(player.animations["walkup"], "loop");
      }
      if (vdirection[0] == "down") {
        player.changeAnimation(player.animations["walkdown"], "loop");
      }
    }
    if (controller.left.active && controller.right.active) {
      if (hdirection[0] == "right") {
        player.changeAnimation(player.animations["walkright"], "loop");
      }
      if (hdirection[0] == "left") {
        player.changeAnimation(player.animations["walkleft"], "loop");
      }
    }
    if (
      !controller.right.active &&
      !controller.left.active &&
      !controller.up.active &&
      !controller.down.active
    ) {
      player.mode = "pause";
    }
    player.update();

    if (world.doorway.collideObject(player)) {
      world.doorway.teleport(player);
      camera.repositionCamera();
    }
    player.animate();
    enemy.animate();
    enemy2.update();
    enemy3.update();
    [enemy].forEach((object) => {
      if (player.collideObject(object) && damageCooldown == 0) {
        player.totalHearts -= 1;
        damageCooldown = 30;
      }
    });
    [enemy2].forEach((object) => {
      if (player.collideObject(object) && damageCooldown == 0) {
        player.totalHearts -= 1;
        damageCooldown = 30;
      }
    });
    [enemy3].forEach((object) => {
      if (player.collideObject(object) && damageCooldown == 0) {
        player.totalHearts -= 1;
        damageCooldown = 30;
      }
    });
    damageCooldown--;
    if (damageCooldown <= 0) {
      damageCooldown = 0;
    }

    [
      world.boundary,
      world.worldboundary,
      world.hillboundary,
      world.waterboundary,
    ].forEach((boundary) => {
      [player, enemy, enemy2, enemy3].forEach((object) => {
        boundary.collide(object);
      });
    });
    camera.setCamera();
  };

  const render = function () {
    context.fillStyle = "white";

    for (column in world.map) {
      for (row in world.map[column]) {
        context.drawImage(
          world.tileSet,
          world.borderWidth +
            ("A".charCodeAt() - 65) *
              (world.sourceTileWidth + world.borderWidth),
          world.borderWidth +
            ("N".charCodeAt() - 65) *
              (world.sourceTileHeight + world.borderWidth),
          world.sourceTileWidth,
          world.sourceTileHeight,
          world.tileWidth * row - camera.x,
          world.tileHeight * column - camera.y,
          world.tileWidth,
          world.tileHeight
        );
      }
    }

    for (column in world.map) {
      for (row in world.map[column]) {
        context.drawImage(
          world.tileSet,
          world.borderWidth +
            (world.map[column][row][0].charCodeAt() - 65) *
              (world.sourceTileWidth + world.borderWidth),
          world.borderWidth +
            (world.map[column][row][1].charCodeAt() - 65) *
              (world.sourceTileHeight + world.borderWidth),
          world.sourceTileWidth,
          world.sourceTileHeight,
          world.tileWidth * row - camera.x,
          world.tileHeight * column - camera.y,
          world.tileWidth,
          world.tileHeight
        );
      }
    }

    context.drawImage(
      enemy.sprite,
      enemy.frame.source_x,
      enemy.frame.source_y,
      enemy.frame.source_width,
      enemy.frame.source_height,
      enemy.x - camera.x,
      enemy.y - camera.y,
      enemy.width,
      enemy.height
    );

    context.drawImage(
      enemy2.sprite,
      enemy2.frame.source_x,
      enemy2.frame.source_y,
      enemy2.frame.source_width,
      enemy2.frame.source_height,
      enemy2.x - camera.x,
      enemy2.y - camera.y,
      enemy2.width,
      enemy2.height
    );

    context.drawImage(
      enemy3.sprite,
      enemy3.frame.source_x,
      enemy3.frame.source_y,
      enemy3.frame.source_width,
      enemy3.frame.source_height,
      enemy3.x - camera.x,
      enemy3.y - camera.y,
      enemy3.width,
      enemy3.height
    );

    context.drawImage(
      player.sprite,
      player.frame.source_x,
      player.frame.source_y,
      player.frame.source_width,
      player.frame.source_height,
      player.x - camera.x,
      player.y - camera.y,
      player.width,
      player.height
    );

    for (numHearts = 0; numHearts < player.totalHearts; numHearts++) {
      context.drawImage(
        heart.sprite,
        heart.frame.source_x,
        heart.frame.source_y,
        heart.frame.source_width,
        heart.frame.source_height,
        heart.x + heart.width * numHearts,
        heart.y,
        heart.width,
        heart.height
      );
    }

    context.strokeStyle = "#000000";
    context.beginPath();
    context.rect(
      world.doorway.getLeft() - camera.x,
      world.doorway.getTop() - camera.y,
      world.doorway.getRight() - world.doorway.getLeft(),
      world.doorway.getBottom() - world.doorway.getTop()
    );
    context.stroke();
    context.beginPath();
    context.rect(
      player.getLeft() - camera.x,
      player.getTop() - camera.y,
      player.getRight() - player.getLeft(),
      player.getBottom() - player.getTop()
    );
    context.stroke();
    context.beginPath();
    context.rect(
      enemy.getLeft() - camera.x,
      enemy.getTop() - camera.y,
      enemy.getRight() - enemy.getLeft(),
      enemy.getBottom() - enemy.getTop()
    );

    context.stroke();
    context.beginPath();
    context.rect(
      enemy2.getLeft() - camera.x,
      enemy2.getTop() - camera.y,
      enemy2.getRight() - enemy2.getLeft(),
      enemy2.getBottom() - enemy2.getTop()
    );
    context.stroke();
    context.beginPath();
    context.rect(
      enemy3.getLeft() - camera.x,
      enemy3.getTop() - camera.y,
      enemy3.getRight() - enemy3.getLeft(),
      enemy3.getBottom() - enemy3.getTop()
    );
    context.stroke();
    context.strokeStyle = "#FF0000";

    context.rect(
      enemy.getLeft() - camera.x - world.tileWidth,
      enemy.getTop() - camera.y - world.tileHeight,
      enemy.getRight() + world.tileWidth * 2 - enemy.getLeft(),
      enemy.getBottom() + world.tileHeight * 2 - enemy.getTop()
    );
    context.rect(
      enemy2.getLeft() - camera.x - 3 * world.tileWidth,
      enemy2.getTop() - camera.y - 3 * world.tileHeight,
      enemy2.getRight() + 3 * world.tileWidth * 2 - enemy2.getLeft(),
      enemy2.getBottom() + 3 * world.tileHeight * 2 - enemy2.getTop()
    );

    context.stroke();
  };

  //create engine object
  const engine = new Engine(1000 / 30, update, render);

  //create controller object
  const controller = new Controller();

  //callback function for controller
  const keyDownUp = function (event) {
    controller.keyDownUp(event.type, event.keyCode);
  };

  //add event listeners for controller
  window.addEventListener("keydown", keyDownUp);
  window.addEventListener("keyup", keyDownUp);

  //start engine
  engine.start();
});
