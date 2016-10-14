var current_level = 0;
var current_size = 1;
var default_font_style = { font: "bold 64px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
var restarted = false;

var state = {

    preload: function() {
        // Here we preload the assets
        game.load.image('player', 'static/assets/player.png');
        game.load.image('wall', 'static/assets/wall.png');
        game.load.image('coin', 'static/assets/coin.png');
        game.load.image('lava', 'static/assets/lava.png');
        game.load.image('enemy', 'static/assets/enemy.png');
        game.load.image('smaller', 'static/assets/smaller.png');
        game.load.image('larger', 'static/assets/larger.png');

        game.load.image('spark', 'static/assets/spark.png');
        game.load.image('blood', 'static/assets/blood.png');
        game.load.image('parts', 'static/assets/parts.png');
        game.load.image('lava_splash', 'static/assets/lava_splash.png');
        game.load.image('dark', 'static/assets/dark.png');
    },

    create: function() {
        restarted = false;
        // Here we create the game

        // Set the background color to blue
        game.stage.backgroundColor = '#8FC2FF';

        // Start the Arcade physics system (for movements and collisions)
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Add the physics engine to all game objects
        game.world.enableBody = true;

        // Variable to store the arrow key pressed
        this.cursor = game.input.keyboard.createCursorKeys();
        
        this.createMap(levels[current_level]);
    },

    update: function() {
        // Here we update the game 60 times per second
        // Make the player and the walls collide
        game.physics.arcade.collide(this.player, this.walls);

        // Call the 'takeCoin' function when the player takes a coin
        game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this);

        game.physics.arcade.overlap(this.player, this.smallers, this.smaller, null, this);
        game.physics.arcade.overlap(this.player, this.largers, this.larger, null, this);

        // Call the 'restart' function when the player touches the enemy or lava
        game.physics.arcade.overlap(this.player, this.lavas, this.gameOver, null, this);

        game.physics.arcade.overlap(this.player, this.enemies, this.fight, null, this);

        game.physics.arcade.overlap(this.enemies, this.walls, this.enemyTurn, null, this);
        game.physics.arcade.overlap(this.enemies, this.lavas, this.enemyTurn, null, this);

        // Move the player when an arrow key is pressed
        if (this.cursor.left.isDown) {
            this.player.body.velocity.x = - this.player.agility * 0.8;
        } else if (this.cursor.right.isDown) {
            this.player.body.velocity.x = this.player.agility * 0.8;
        } else {
            this.player.body.velocity.x = 0;
        }


        if (this.cursor.up.isDown && this.player.body.touching.down) {
            this.player.body.velocity.y = - this.player.agility;
        }
    },

    smaller: function (player, smaller) {
        current_size--;
        smaller.kill();
        this.explode('dark', smaller);
        if (current_size < 0) {
            current_size = 0;
        }
        this.changeSize(player, current_size);
    },

    larger: function (player, larger) {
        current_size++;
        larger.kill();
        this.explode('dark', larger);
        if (current_size > 2) {
            current_size = 2;
        }
        this.changeSize(player, current_size);
    },

    changeSize: function(player, size) {
        if (player.height < size * 32)
            player.y -= player.height;
        var sizes = {
            0: function() { player.width = 16; player.height = 16; player.agility = 280; },
            1: function() { player.width = 31; player.height = 31; player.agility = 250; },
            2: function() { player.width = 63; player.height = 63; player.agility = 220; }
        };
        sizes[size]();
    },

    createMap: function(level) {
        // Create the level by going through the array

        // Create 3 groups that will contain our objects
        this.walls = game.add.group();
        this.coins = game.add.group();
        this.lavas = game.add.group();
        this.enemies = game.add.group();
        this.smallers = game.add.group();
        this.largers = game.add.group();

        game.world.setBounds(0, 0,
            level.size.x * 32,
            level.size.y * 32
        );

        for (var i = 0; i < level.body.length; i++) {
            for (var j = 0; j < level.body[i].length; j++) {

                if (level.body[i][j] == 'p') {
                    this.player = game.add.sprite(32 * j,32 * i, 'player');
                    this.player.body.gravity.y = 600;
                    this.player.agility = 250;
                    current_size = 1;
                }

                if (level.body[i][j] == '-') {
                    var smaller = game.add.sprite(32 * j + 8,32 * i + 16, 'smaller');
                    this.smallers.add(smaller);
                }

                if (level.body[i][j] == '+') {
                    var larger = game.add.sprite(32 * j,32 * i, 'larger');
                    this.largers.add(larger);
                }

                // Create a wall and add it to the 'walls' group
                if (level.body[i][j] == 'x') {
                    var wall = game.add.sprite(32 * j,32 * i, 'wall');
                    wall.body.immovable = true;
                    this.walls.add(wall);
                    wall.z = i*j + 1000;
                }

                // Create a coin and add it to the 'coins' group
                else if (level.body[i][j] == 'o') {
                    var coin = game.add.sprite(32 * j,32 * i, 'coin');
                    this.coins.add(coin);
                }

                // Create a enemy and add it to the 'lava' group
                else if (level.body[i][j] == '!') {
                    var lava = game.add.sprite(32 * j,32 * i, 'lava');
                    lava.body.immovable = true;
                    this.lavas.add(lava);

                    if (level.body[i - 1] && level.body[i - 1][j] == ' ') {
                        var emitter = game.add.emitter(lava.x + lava.width / 2, lava.y, 100);
                        emitter.makeParticles('lava_splash');
                        emitter.gravity = 800;
                        emitter.width = lava.width;
                        emitter.minParticleSpeed.setTo(-10, -200);
                        emitter.maxParticleSpeed.setTo(10, -100);
                        emitter.start(false, 400, Math.floor(Math.random() * 4000 + 2000));
                    }

                    if (level.body[i + 1] && level.body[i + 1][j] == ' ') {
                        emitter = game.add.emitter(lava.x + lava.width / 2, lava.y + lava.height, 100);
                        emitter.makeParticles('lava_splash');
                        emitter.gravity = 800;
                        emitter.width = lava.width;
                        emitter.minParticleSpeed.setTo(0, 100);
                        emitter.maxParticleSpeed.setTo(0, 150);
                        emitter.start(false, 400, Math.floor(Math.random() * 6000 + 1000));
                    }
                }


                // Create a enemy and add it to the 'enemies' group
                else if (level.body[i][j] == '#') {
                    var enemy = game.add.sprite(32 * j,32 * i, 'enemy');
                    enemy.body.velocity.x = 50 * [-1, 1][Math.floor(Math.random() * 2)];
                    this.enemies.add(enemy);
                }
            }
        }

        this.showText('LEVEL ' + (current_level + 1), true);

        game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    },

    enemyTurn: function (enemy) {
        enemy.body.velocity.x = -enemy.body.velocity.x;
    },

    fight: function (player, enemy) {
        if (enemy.position.y - player.position.y < player.height) {
            this.gameOver();
        } else {
            player.body.velocity.y = -250;
            enemy.kill();
            this.explode('blood', enemy);
        }
    },

    takeCoin: function(player, coin) {
        coin.kill();
        this.explode('spark', coin);

        if (this.coins.total == 0) {
            this.levelComplete();
        }
    },

    explode: function (sprite, obj) {
        var emitter = game.add.emitter(obj.x + obj.width / 2, obj.y + obj.height / 2, 100);
        emitter.makeParticles(sprite);
        emitter.gravity = 700;
        emitter.minParticleSpeed.setTo(-200, -200);
        emitter.maxParticleSpeed.setTo(200, 200);
        emitter.start(true, 800, null, 16);
    },

    showText: function (message, fade) {
        var text = game.add.text(game.width / 2, game.height / 2, message, default_font_style);
        text.anchor.x = 0.5;
        text.anchor.y = 0.5;
        text.fixedToCamera = true;
        if (fade) {
            game.add.tween(text).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true);
        }
    },

    levelComplete: function () {
        current_level++;

        this.showText('LEVEL COMPLETE');
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        this.player.kill();
        game.time.events.add(
            1500,
            function () {
                if (current_level >= levels_count) {
                    window.location.href = '/exit';
                }
                game.state.start('main');
            },
            this
        );
    },

    gameOver: function () {
        this.player.kill();
        this.showText('GAME OVER');
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        this.explode('parts', this.player);
        game.time.events.add(
            1500, this.restart, this
        );
    },

    restart: function(level) {
        if (level !== undefined) {
            current_level = level;
        } else if (!restarted) {
            current_level--;
            restarted = true;
        }
        game.state.start('main');
    }

};


var game = new Phaser.Game(704, 224);
game.state.add('main', state);
game.state.start('main');