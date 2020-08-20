window.addEventListener('load', function () {
    //Get a CanvasRenerContext2D object
    const canvas = document.querySelector('canvas')
    const context = canvas.getContext('2d') // For manipulating the canvas object

    //Set Logical canvas dimensions != intrinsic canvas size
    canvas.width = 500 //1034
    canvas.height = 500 //658

    //Pixelate Image
    context.imageSmoothingEnabled = false

    const World = function (url, sTW, sTH, tW, tH, bW, map) {
        this.tileSet = new Image()
        this.tileSet.src = url
        this.sourceTileWidth = sTW
        this.sourceTileHeight = sTH
        this.tileWidth = tW
        this.tileHeight = tH
        this.borderWidth = bW

        this.map = map // Add feature: Can change maps

        this.boundary = new World.Boundary(
            this.tileWidth * 0.3,
            0,
            this.tileWidth * 2.4,
            this.tileHeight * 2.5
        )

        this.worldboundary = new World.Boundary(
            0,
            0,
            this.map[0].length * this.tileWidth,
            this.map.length * this.tileHeight
        )

        this.doorway = new World.Doorway(
            this.tileWidth * 1,
            this.tileHeight * 0,
            this.tileWidth,
            this.tileHeight,
            this.tileWidth * 1,
            this.tileHeight * 3
        )
    }

    World.Boundary = function (
        boundary_x,
        boundary_y,
        boundary_width,
        boundary_height
    ) {
        this.boundary_x = boundary_x
        this.boundary_y = boundary_y
        this.boundary_height = boundary_height
        this.boundary_width = boundary_width

        this.collide = function (object) {
            let colliding = true
            if (object.getTop() < this.boundary_y) {
                object.setTop(this.boundary_y)
            }
            if (object.getLeft() < this.boundary_x) {
                object.setLeft(this.boundary_x)
            }
            if (
                object.getRight() > this.boundary_x + this.boundary_width &&
                object.getLeft() < this.boundary_x + this.boundary_width &&
                object.getBottom() - object.speed <=
                    this.boundary_y + this.boundary_height &&
                object.getTop() + object.speed >= this.boundary_y
            ) {
                object.setRight(this.boundary_x + this.boundary_width)
            }
            if (
                object.getBottom() > this.boundary_y + this.boundary_height &&
                object.getTop() < this.boundary_y + this.boundary_height
            ) {
                object.setBottom(this.boundary_y + this.boundary_height)
            }
            if (
                !(object.getTop() < this.boundary_y) ||
                !(object.getLeft() < this.boundary_x) ||
                !(object.getRight() > this.boundary_x + this.boundary_width) ||
                !(object.getBottom() > this.boundary_y + this.boundary_height)
            ) {
                colliding = false
            }
            return colliding
        }
    }

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
        this.sprite = new Image()
        if (url) this.sprite.src = url
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.offset_top = 0
        this.offset_left = 0
        this.offset_right = 0
        this.offset_bottom = 0

        this.getTop = function () {
            return this.y + this.offset_top
        }
        this.getLeft = function () {
            return this.x + this.offset_left
        }
        this.getRight = function () {
            return this.x + this.width - this.offset_right
        }
        this.getBottom = function () {
            return this.y + this.height - this.offset_bottom
        }
        this.getCenterX = function () {
            return (this.getLeft() + this.getRight()) / 2
        }
        this.getCenterY = function () {
            return (this.getTop() + this.getBottom()) / 2
        }
        this.setTop = function (top) {
            this.y = top - this.offset_top
        }
        this.setLeft = function (left) {
            this.x = left - this.offset_left
        }
        this.setRight = function (right) {
            this.x = right - this.width + this.offset_right
        }
        this.setBottom = function (bottom) {
            this.y = bottom - this.height + this.offset_bottom
        }

        this.collideObject = function (object) {
            if (
                this.getRight() < object.getLeft() ||
                this.getBottom() < object.getTop() ||
                this.getLeft() > object.getRight() ||
                this.getTop() > object.getBottom()
            )
                return false
            return true
        }
    }

    World.Doorway = function (
        x,
        y,
        width,
        height,
        destination_x,
        destination_y
    ) {
        Object.call(this, false, x, y, width, height)
        this.destination_x = destination_x
        this.destination_y = destination_y

        this.teleport = function (object) {
            object.x = this.destination_x
            object.y = this.destination_y
        }
    }

    const world = new World('img/tilemaps/beach.png', 112, 112, 94, 94, 5, [
        ['AA', 'CO', 'CA', 'AN', 'AH', 'DN', 'DN', 'DN', 'DN', 'DN', 'DN'],
        ['AB', 'BB', 'CB', 'AN', 'AI', 'EN', 'EN', 'AJ', 'FF', 'FF', 'BJ'],
        ['AC', 'BC', 'CC', 'CN', 'AH', 'FN', 'FN', 'BI', 'AO', 'BO', 'CI'],
        ['AD', 'HN', 'CD', 'AN', 'AI', 'GN', 'GN', 'DI', 'AP', 'BP', 'CI'],
        ['AN', 'AN', 'AN', 'AN', 'AH', 'DN', 'DN', 'AK', 'FG', 'GG', 'BK'],
        ['AN', 'BN', 'AN', 'AN', 'AM', 'AF', 'BF', 'CF', 'DF', 'AF', 'BF'],
        ['CN', 'AN', 'AN', 'CN', 'AN', 'AN', 'AN', 'AN', 'AN', 'AN', 'AN'],
        ['AN', 'AN', 'AN', 'AN', 'AN', 'AN', 'AN', 'AN', 'BN', 'AN', 'AN'],
        ['AN', 'AN', 'AN', 'BN', 'AN', 'AN', 'CN', 'AN', 'AN', 'AN', 'AN'],
    ])

    const MovingObject = function (
        url,
        x,
        y,
        width,
        height,
        speed = 5,
        direction = 'up'
    ) {
        Object.call(this, url, x, y, width, height)
        this.speed = speed
        this.direction = direction

        this.moveUp = function () {
            this.direction = 'up'
            this.y -= this.speed
        }

        this.moveRight = function () {
            this.direction = 'right'
            this.x += this.speed
        }

        this.moveDown = function () {
            this.direction = 'down'
            this.y += this.speed
        }

        this.moveLeft = function () {
            this.direction = 'left'
            this.x -= this.speed
        }
    }

    const Frame = function (source_x, source_y, source_width, source_height) {
        this.source_x = source_x
        this.source_y = source_y
        this.source_width = source_width
        this.source_height = source_height
    }

    const Player = function () {
        MovingObject.call(this, 'img/dog.png', 10, 100, 112, 112, 5)
        this.offset_bottom = 0
        this.offset_left = 20
        this.offset_right = 20
        this.offset_top = 40

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
            sleep: [
                new Frame(0, 32 * 6, 32, 32),
                new Frame(32, 32 * 6, 32, 32),
            ],
            runright: [
                new Frame(0, 32 * 8, 32, 32),
                new Frame(32, 32 * 8, 32, 32),
            ],
            sad: [new Frame(96, 32 * 7, 32, 32)],
        }

        this.animation = this.animations['walkdown']
        this.totalHearts = 3
        Animator.call(this, this.animation, 3, 'pause')

        this.update = function () {}
    }

    //create player object
    const player = new Player('img/dog.png')

    const SlidingCat = function () {
        MovingObject.call(this, 'img/cats/cat.png', 100, 100, 112, 112, 3)
        this.offset_bottom = 5
        this.offset_left = 30
        this.offset_right = 30
        this.offset_top = 45

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
        }
        this.animation = this.animations['yawn']
        Animator.call(this, this.animation, 7, 'loop')

        this.state = 'follow'

        this.update = function () {
            switch (this.state) {
                case 'follow':
                    if (player.getBottom() > this.getTop()) {
                        if (
                            this.animation != this.animations['walkright'] &&
                            this.animation != this.animations['walkleft']
                        )
                            this.changeAnimation(
                                this.animations['walkdown'],
                                'loop'
                            )
                        this.moveDown()
                    }
                    if (player.getTop() < this.getBottom()) {
                        if (
                            this.animation != this.animations['walkright'] &&
                            this.animation != this.animations['walkleft']
                        )
                            this.changeAnimation(
                                this.animations['walkup'],
                                'loop'
                            )
                        this.moveUp()
                    }
                    if (player.getLeft() > this.getRight()) {
                        this.changeAnimation(
                            this.animations['walkright'],
                            'loop'
                        )
                        this.moveRight()
                    }
                    if (player.getRight() < this.getLeft()) {
                        this.changeAnimation(
                            this.animations['walkleft'],
                            'loop'
                        )
                        this.moveLeft()
                    }

                    if (
                        player.getRight() > enemy.getLeft() - world.tileWidth &&
                        player.getBottom() >
                            enemy.getTop() - world.tileHeight &&
                        player.getLeft() < enemy.getRight() + world.tileWidth &&
                        player.getTop() < enemy.getBottom() + world.tileHeight
                    ) {
                        this.state = 'slide'
                        this.countPounce = 0
                        this.pounceBegin = 1 * 30
                    }
                    break
                case 'slide':
                    this.pounceBegin -= 1
                    if (this.pounceBegin <= 0) {
                        this.countPounce++
                        if (this.countPounce < 8) {
                            this.y += (player.y - this.y) / 8
                            this.x += (player.x - this.x) / 8
                        }
                    }
                    if (this.countPounce >= 8) {
                        this.countPounce = 0
                        this.pounceBegin = 30
                    }

                    let x = player.getCenterX() - enemy.getCenterX()
                    let y = enemy.getCenterY() - player.getCenterY()

                    if (y < x && y < -x) {
                        this.changeAnimation(
                            this.animations['pouncedown'],
                            'loop'
                        )
                    } else if (y > x && y > -x) {
                        this.changeAnimation(
                            this.animations['pounceup'],
                            'loop'
                        )
                    } else if (y < x && y > -x) {
                        this.changeAnimation(
                            this.animations['pounceright'],
                            'loop'
                        )
                    } else if (y > x && y < -x) {
                        this.changeAnimation(
                            this.animations['pounceleft'],
                            'loop'
                        )
                    }

                    if (
                        !(
                            player.getRight() >
                                enemy.getLeft() - world.tileWidth &&
                            player.getBottom() >
                                enemy.getTop() - world.tileHeight &&
                            player.getLeft() <
                                enemy.getRight() + world.tileWidth &&
                            player.getTop() <
                                enemy.getBottom() + world.tileHeight
                        )
                    ) {
                        this.state = 'follow'
                    }

                    break
            }
        }
    }

    const enemy = new SlidingCat()

    const heart = new Object('img/heart.png', 0, 0, 25, 25)
    heart.frame = new Frame(0, 0, 254, 254)

    const Camera = function () {
        this.x = 0
        this.y = 0
        this.width = 500
        this.height = 500
        this.aspectRatio = 0.25
        //    canvas.width = 1034 canvas.height = 658
        this.moveCamera = function (dx, dy) {
            if (
                player.x >
                    world.map[0].length * world.tileWidth * this.aspectRatio &&
                player.x <
                    world.map[0].length *
                        world.tileWidth *
                        (1 - this.aspectRatio)
            ) {
                this.x += dx
            }
            if (
                player.y >
                    world.map.length * world.tileHeight * this.aspectRatio &&
                player.y <
                    world.map.length * world.tileHeight * (1 - this.aspectRatio)
            ) {
                this.y += dy
            }
            this.repositionCamera()
        }
        this.repositionCamera = function () {
            if (this.y < 0) {
                this.y = 0
            }
            if (this.y > world.map.length * world.tileHeight - this.height) {
                this.y = world.map.length * world.tileHeight - this.height
            }
            if (this.x < 0) {
                this.x = 0
            }
            if (this.x > world.map[0].length * world.tileWidth) {
                this.x = world.map[0].length * world.tileWidth
            }
        }
    }

    const camera = new Camera()
    let vdirection = []
    let hdirection = []
    let damageCooldown = 0
    //let pause = false;
    const update = function () {
        enemy.update()
        player.mode = 'loop'
        if (controller.down.active == false) {
            if (vdirection.includes('down'))
                vdirection.splice(vdirection.indexOf('down'), 1)
        }
        if (controller.down.active) {
            if (!hdirection.includes('right') && !hdirection.includes('left'))
                player.changeAnimation(player.animations['walkdown'], 'loop')
            player.moveDown()
            camera.moveCamera(0, player.speed)
            if (vdirection.includes('down') == false) {
                vdirection.push('down')
            }
        }
        if (controller.up.active == false) {
            if (vdirection.includes('up'))
                vdirection.splice(vdirection.indexOf('up'), 1)
        }
        if (controller.up.active) {
            if (!hdirection.includes('right') && !hdirection.includes('left'))
                player.changeAnimation(player.animations['walkup'], 'loop')
            player.moveUp()
            camera.moveCamera(0, -player.speed)
            if (vdirection.includes('up') == false) {
                vdirection.push('up')
            }
        }
        if (controller.right.active == false) {
            if (hdirection.includes('right'))
                hdirection.splice(hdirection.indexOf('right'), 1)
        }
        if (controller.right.active) {
            player.changeAnimation(player.animations['walkright'], 'loop')
            player.moveRight()
            camera.moveCamera(player.speed, 0)
            if (hdirection.includes('right') == false) {
                hdirection.push('right')
            }
        }
        if (controller.left.active == false) {
            if (hdirection.includes('left'))
                hdirection.splice(hdirection.indexOf('left'), 1)
        }
        if (controller.left.active) {
            player.changeAnimation(player.animations['walkleft'], 'loop')
            player.moveLeft()
            camera.moveCamera(-player.speed, 0)
            if (hdirection.includes('left') == false) {
                hdirection.push('left')
            }
        }

        ////////////////////////

        if (controller.up.active && controller.down.active) {
            if (hdirection[0] == 'up') {
                player.changeAnimation(player.animations['walkup'], 'loop')
            }
            if (vdirection[0] == 'down') {
                player.changeAnimation(player.animations['walkdown'], 'loop')
            }
        }
        if (controller.left.active && controller.right.active) {
            if (hdirection[0] == 'right') {
                player.changeAnimation(player.animations['walkright'], 'loop')
            }
            if (hdirection[0] == 'left') {
                player.changeAnimation(player.animations['walkleft'], 'loop')
            }
        }
        if (
            !controller.right.active &&
            !controller.left.active &&
            !controller.up.active &&
            !controller.down.active
        ) {
            player.mode = 'pause'
        }
        player.update()

        if (world.doorway.collideObject(player)) {
            world.doorway.teleport(player)
            camera.repositionCamera()
        }
        player.animate()
        enemy.animate()
        ;[enemy].forEach((object) => {
            if (player.collideObject(object) && damageCooldown == 0) {
                player.totalHearts -= 1
                damageCooldown = 30
            }
        })
        damageCooldown--
        if (damageCooldown <= 0) {
            damageCooldown = 0
        }

        ;[world.boundary, world.worldboundary].forEach((boundary) => {
            ;[player, enemy].forEach((object) => {
                boundary.collide(object)
            })
        })
        console.log(camera.x, camera.y)
    }
    //draw image to canvas

    const render = function () {
        context.fillStyle = 'white'

        for (column in world.map) {
            for (row in world.map[column]) {
                context.drawImage(
                    world.tileSet,
                    world.borderWidth +
                        ('A'.charCodeAt() - 65) *
                            (world.sourceTileWidth + world.borderWidth),
                    world.borderWidth +
                        ('N'.charCodeAt() - 65) *
                            (world.sourceTileHeight + world.borderWidth),
                    world.sourceTileWidth,
                    world.sourceTileHeight,
                    world.tileWidth * row - camera.x,
                    world.tileHeight * column - camera.y,
                    world.tileWidth,
                    world.tileHeight
                )
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
                )
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
        )

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
        )

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
            )
        }

        context.strokeStyle = '#000000'
        context.beginPath()
        context.rect(
            world.doorway.getLeft() - camera.x,
            world.doorway.getTop() - camera.y,
            world.doorway.getRight() - world.doorway.getLeft(),
            world.doorway.getBottom() - world.doorway.getTop()
        )
        context.stroke()
        context.beginPath()
        context.rect(
            player.getLeft() - camera.x,
            player.getTop() - camera.y,
            player.getRight() - player.getLeft(),
            player.getBottom() - player.getTop()
        )
        context.stroke()
        context.beginPath()
        context.rect(
            enemy.getLeft() - camera.x,
            enemy.getTop() - camera.y,
            enemy.getRight() - enemy.getLeft(),
            enemy.getBottom() - enemy.getTop()
        )
        context.stroke()
        context.strokeStyle = '#FF0000'

        context.rect(
            enemy.getLeft() - camera.x - world.tileWidth,
            enemy.getTop() - camera.y - world.tileHeight,
            enemy.getRight() + world.tileWidth * 2 - enemy.getLeft(),
            enemy.getBottom() + world.tileHeight * 2 - enemy.getTop()
        )
        context.stroke()
    }

    //create engine object
    const engine = new Engine(1000 / 30, update, render)

    //create controller object
    const controller = new Controller()

    //callback function for controller
    const keyDownUp = function (event) {
        controller.keyDownUp(event.type, event.keyCode)
    }

    //add event listeners for controller
    window.addEventListener('keydown', keyDownUp)
    window.addEventListener('keyup', keyDownUp)

    //start engine
    engine.start()
})
