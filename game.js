window.addEventListener('load', function () {
  //Get a CanvasRenerContext2D object
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('2d'); //what is this for?

  //Set Logical canvas dimensions != intrinsic canvas size
  canvas.width = 1200;
  canvas.height = 900;

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

    // prettier-ignore
    this.map = map; //why is this inside, shouldn't it be outside if we want to make different maps?

    this.boundary = new World.Boundary(this.tileWidth * 0.3, 0, this.tileWidth * 2.4, this.tileHeight * 2.5)
    //this.doorway = new World.Doorway(this.tileWidth * 0, this.tileWidth * 0, this.tileWidth * 0, this.tileHeight * 0, this.tileWidth * 1, this.tileHeight * 4)
  };

  World.Boundary = function (
    boundary_x,
    boundary_y,
    boundary_width,
    boundary_height,
  ) {

    this.boundary_x = boundary_x;
    this.boundary_y = boundary_y;
    this.boundary_height = boundary_height;
    this.boundary_width = boundary_width;

    this.collide = function (object) {
      let colliding = true;
      if (object.getTop() < this.boundary_y) object.setTop(this.boundary_y);
      else if (object.getLeft() < this.boundary_x)
        object.setLeft(this.boundary_x);
      else if (object.getRight() > this.boundary_x + this.boundary_width)
        object.setRight(this.boundary_x + this.boundary_width);
      else if (object.getBottom() > this.boundary_y + this.boundary_height)
        object.setBottom(this.boundary_y + this.boundary_height);
      else colliding = false;

      return colliding;
    };
  };

  World.Doorway = function (
    boundary_x,
    boundary_y,
    boundary_width,
    boundary_height,
    destination_x,
    destination_y
  ) {

    this.boundary_x = boundary_x;
    this.boundary_y = boundary_y;
    this.boundary_height = boundary_height;
    this.boundary_width = boundary_width;
    this.destination_x = destination_x;
    this.destination_y = destination_y;

    this.collide = function (object) {
      let colliding = true;
      if (object.getTop() < this.boundary_y) {
        object.setTop(this.destination_y);
        object.setLeft(this.destination_x);
      }
      else if (object.getLeft() < this.boundary_x) {
        object.setTop(this.destination_y);
        object.setLeft(this.destination_x);
      }
      else if (object.getRight() > this.boundary_x + this.boundary_width) {
        object.setTop(this.destination_y);
        object.setLeft(this.destination_x);
      }
      else if (object.getBottom() > this.boundary_y + this.boundary_height) {
        object.setTop(this.destination_y);
        object.setLeft(this.destination_x);
      }
      else colliding = false;

      return colliding;
    };
  };
  const world = new World('img/tilemaps/beach.png', 112, 112, 94, 94, 5, [
    ['AA', 'CO', 'CA', 'AN', 'AH', 'DN', 'DN', 'DN', 'DN', 'DN', 'DN'],
    ['AB', 'BB', 'CB', 'AN', 'AI', 'EN', 'EN', 'AJ', 'FF', 'FF', 'BJ'],
    ['AC', 'BC', 'CC', 'CN', 'AH', 'FN', 'FN', 'BI', 'AO', 'BO', 'CI'],
    ['AD', 'HN', 'CD', 'AN', 'AI', 'GN', 'GN', 'DI', 'AP', 'BP', 'CI'],
    ['AN', 'AN', 'AN', 'AN', 'AH', 'DN', 'DN', 'AK', 'FG', 'GG', 'BK'],
    ['AN', 'BN', 'AN', 'AN', 'AM', 'AF', 'BF', 'CF', 'DF', 'AF', 'BF'],
    ['AN', 'AN', 'AN', 'AN', 'AN', 'AN', 'AN', 'AN', 'AN', 'AN', 'AN']
  ]);

  const Animator = function (animation, delay, mode = 'loop') {
      this.count = 0
      this.delay = delay >= 1 ? delay : 1
      this.animation = animation
      this.frameIndex = 0
      this.frame = animation[0]
      this.mode = mode

      this.animate = function () {
          switch (this.mode) {
              case 'loop':
                  this.loop()
                  break
              case 'pause':
                  break
          }
      }

      this.changeAnimation = function (
          animation,
          mode,
          delay = 3,
          frameIndex = 0
      ) {
          if (this.animation == animation) {
              return
          }

          this.count = 0
          this.delay = delay
          this.animation = animation
          this.frameIndex = frameIndex
          this.frame = animation[frameIndex]
          this.mode = mode
      }

      this.loop = function () {
          this.count++

          while (this.count > this.delay) {
              this.count -= this.delay
              this.frameIndex =
                  this.frameIndex > 0
                      ? this.frameIndex - 1
                      : this.animation.length - 1

              this.frame = this.animation[this.frameIndex]
          }
      }
  }

  //Define player constructor function
  const Object = function (url, x, y, width, height) {
    this.sprite = new Image();
    if (url)this.sprite.src = url
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;


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

    this.collideObject = function(object) {
      if (this.getRight() < object.getLeft() ||
        this.getBottom() < object.getTop() ||
        this.getLeft() > object.getRight() ||
        this.getTop() > object.getBottom()
      )
        return false
        return true
    }
  }

  const MovingObject = function (url, x, y, width, height, speed = 5, direction = 'up') {
    Object.call(this, url, x, y, width, height)
    this.speed = speed;
    this.direction = direction;

    this.moveUp = function () {
      this.direction = 'up';
      this.y -= this.speed;
    }

    this.moveRight = function () {
      this.direction = 'right';
      this.x += this.speed;
    }

    this.moveDown = function () {
      this.direction = 'down';
      this.y += this.speed;
    }

    this.moveLeft = function () {
      this.direction = 'left';
      this.x -= this.speed;
    }
  }

  const Frame = function (source_x, source_y, source_width, source_height) {
    this.source_x = source_x;
    this.source_y = source_y;
    this.source_width = source_width;
    this.source_height = source_height;
  }


  const Player = function () {
    MovingObject.call(this, 'img/dog.png', 10, 10, 112, 112, 5);
    this.offset_bottom = 0;
    this.offset_left = 20;
    this.offset_right = 20;
    this.offset_top = 40;

    this.animations = {
      walkup: [
        new Frame(0, 32*2, 32, 32),
        new Frame(32, 32 *2, 32, 32),
        new Frame(64, 32*2, 32, 32),
        new Frame(96, 32 *2, 32, 32),
      ],
      walkdown: [
        new Frame(0, 32*0, 32, 32),
        new Frame(32, 32 *0, 32, 32),
        new Frame(64, 32*0, 32, 32),
        new Frame(96, 32 *0, 32, 32),
      ],
      walkright: [
        new Frame(0, 32*1, 32, 32),
        new Frame(32, 32 *1, 32, 32),
        new Frame(64, 32*1, 32, 32),
        new Frame(96, 32 *1, 32, 32),
      ],
      walkleft: [
        new Frame(0, 32*3, 32, 32),
        new Frame(32, 32 *3, 32, 32),
        new Frame(64, 32*3, 32, 32),
        new Frame(96, 32 *3, 32, 32),
      ],
      sitright: [
        new Frame(0, 32*4, 32, 32),
        new Frame(32, 32 *4, 32, 32),
        new Frame(64, 32*4, 32, 32),
        new Frame(96, 32 *4, 32, 32),
      ],
      bark: [
        new Frame(0, 32*5, 32, 32),
        new Frame(32, 32 *5, 32, 32),
        new Frame(64, 32*5, 32, 32),
      ],
      sleep: [
        new Frame(0, 32*6, 32, 32),
        new Frame(32, 32*6, 32, 32)
      ],
      runright: [
        new Frame(0, 32*8, 32, 32),
        new Frame(32, 32*8, 32, 32)
      ],
      sad: [
        new Frame(96, 32*7, 32, 32),
      ]
    }

    this.animation = this.animations['walkdown'];
    Animator.call(this, this.animation, 3, 'pause')

    this.update = function () {
      this.mode = 'loop';
       if (controller.up.active) {
          this.moveUp();
          this.changeAnimation(this.animations['walkup'], 'loop')
       } else if (controller.right.active) {
          this.moveRight();
          this.changeAnimation(this.animations['walkright'], 'loop')
       } else if (controller.down.active) {
          this.moveDown();
          this.changeAnimation(this.animations['walkdown'], 'loop')
       } else if (controller.left.active) {
          this.moveLeft();
          this.changeAnimation(this.animations['walkleft'], 'loop')
       } else this.mode = 'pause';
      }
  };

  //create player object
  const player = new Player('img/dog.png');



  const Enemy = function () {
    MovingObject.call(this, 'img/cats/cat.png', 10, 10, 112, 112, 5);
    this.offset_bottom = 5;
    this.offset_left = 30;
    this.offset_right = 30;
    this.offset_top = 45;

    this.animations = {
            walkdown: [
                new Frame(32 * 0, 32 * 0, 32, 32),
                new Frame(32 * 1, 32 * 0, 32, 32),
                new Frame(32 * 2, 32 * 0, 32, 32),
                new Frame(32 * 3, 32*  0, 32, 32),
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
                new Frame(32 * 2, 32  *2, 32, 32),
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
                new Frame(32*  1, 32 * 4, 32, 32),
                new Frame(32 * 2, 32 * 4, 32, 32),
                new Frame(32 * 3, 32 * 4, 32, 32),
            ],
            sitting: [
                new Frame(32 * 3, 32 * 4, 32, 32),
            ],
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
                new Frame(32 * 1, 32* 7, 32, 32),
            ],
            pounce: [
                new Frame(32 * 2, 32*  7, 32, 32),
                new Frame(32 * 3, 32 * 7, 32, 32),
            ],
        }
        this.animation = this.animations['yawn'];
        Animator.call(this, this.animation, 7, 'loop');

  };

    const enemy = new Enemy();
  //Update animation for every frame
  const update = function () {

    world.boundary.collide(player);
    //world.doorway.collide(player);
    player.update();
    player.animate();
    enemy.animate();

    ;[enemy].forEach((object) => {
      if(player.collideObject(object)) {
        if(player.direction =='up')
          player.setTop(object.getBottom() + 0.1);
        else if(player.direction == 'down')
          player.setBottom(object.getTop() - 0.1);
        else if(player.direction == 'left')
          player.setLeft(object.getRight() + 0.1);
        else if(player.direction == 'right')
          player.setRight(object.getLeft() - 0.1);
      }
    })
  };

  //draw image to canvas

  const render = function () {
    context.fillStyle = 'white';

    for (column in world.map) {
      for (row in world.map[column]) {
        context.drawImage(
          world.tileSet,
          world.borderWidth + (world.map[column][row][0].charCodeAt() - 65) * (world.sourceTileWidth + world.borderWidth),
          world.borderWidth + (world.map[column][row][1].charCodeAt() - 65) * (world.sourceTileHeight + world.borderWidth),
          world.sourceTileWidth,
          world.sourceTileHeight,
          world.tileWidth * row,
          world.tileHeight * column,
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
      enemy.x,
      enemy.y,
      enemy.width,
      enemy.height
    )
    context.beginPath();
    context.rect(enemy.getLeft(), enemy.getTop(), enemy.getRight() - enemy.getLeft(), enemy.getBottom() - enemy.getTop());
    context.stroke();

    context.drawImage(
      player.sprite,
      player.frame.source_x,
      player.frame.source_y,
      player.frame.source_width,
      player.frame.source_height,
      player.x,
      player.y,
      player.width,
      player.height
    )

    context.beginPath();
    context.rect(player.getLeft(), player.getTop(), player.getRight() - player.getLeft(), player.getBottom() - player.getTop());
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
  window.addEventListener('keydown', keyDownUp);
  window.addEventListener('keyup', keyDownUp);

  //start engine
    engine.start();
});