var current_level = 0;
var default_font_style = { font: "bold 64px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };


var state = {
    preload: function() {
        // Here we preload the assets
        game.load.image('player', 'static/assets/player.png');
        game.load.image('wall', 'static/assets/wall.png');
        game.load.image('coin', 'static/assets/coin.png');
        game.load.image('lava', 'static/assets/lava.png');
        game.load.image('enemy', 'static/assets/enemy.png');
    },

    create: function() {
        // Here we create the game

        // Set the background color to blue
        game.stage.backgroundColor = '#8FC2FF';

        // Start the Arcade physics system (for movements and collisions)
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Add the physics engine to all game objects
        game.world.enableBody = true;

        // Variable to store the arrow key pressed
        this.cursor = game.input.keyboard.createCursorKeys();

        // Create the player in the middle of the game
        this.player = game.add.sprite(70, 100, 'player');

        // Add gravity to make it fall
        this.player.body.gravity.y = 600;

        this.create_map(levels[current_level]);
    },

    update: function() {
        // Here we update the game 60 times per second
        // Make the player and the walls collide
        game.physics.arcade.collide(this.player, this.walls);

        // Call the 'takeCoin' function when the player takes a coin
        game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this);

        // Call the 'restart' function when the player touches the enemy or lava
        game.physics.arcade.overlap(this.player, this.lavas, this.restart, null, this);

        game.physics.arcade.overlap(this.player, this.enemies, this.fight, null, this);

        game.physics.arcade.overlap(this.enemies, this.walls, this.enemyTurn, null, this);
        game.physics.arcade.overlap(this.enemies, this.lavas, this.enemyTurn, null, this);

        // Move the player when an arrow key is pressed
        if (this.cursor.left.isDown) {
            this.player.body.velocity.x = -200;
        } else if (this.cursor.right.isDown) {
            this.player.body.velocity.x = 200;
        } else {
            this.player.body.velocity.x = 0;
        }
        if (this.cursor.up.isDown && this.player.body.touching.down) {
            this.player.body.velocity.y = -250;
        }
    },

    enemyTurn: function (enemy) {
        enemy.body.velocity.x = -enemy.body.velocity.x;
    },

    fight: function (player, enemy) {
        if (enemy.position.y - player.position.y < 32) {
            this.restart();
        } else {
            player.body.velocity.y = -250;
            enemy.kill();
        }
    },

    create_map: function(level) {
        // Create the level by going through the array
        
        // Create 3 groups that will contain our objects
        this.walls = game.add.group();
        this.coins = game.add.group();
        this.lavas = game.add.group();
        this.enemies = game.add.group();
        
        game.world.setBounds(0, 0,
            level.size.x * 32,
            level.size.y * 32
        );
        
        for (var i = 0; i < level.body.length; i++) {
            for (var j = 0; j < level.body[i].length; j++) {

                // Create a wall and add it to the 'walls' group
                if (level.body[i][j] == 'x') {
                    var wall = game.add.sprite(32 * j,32 * i, 'wall');
                    wall.body.immovable = true;
                    this.walls.add(wall);
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
                }
                
                
                // Create a enemy and add it to the 'enemies' group
                else if (level.body[i][j] == '#') {
                    var enemy = game.add.sprite(32 * j,32 * i, 'enemy');
                    enemy.body.velocity.x = 50;
                    this.enemies.add(enemy);
                }
            }
        }

        this.showText('LEVEL ' + (current_level + 1), true);

        game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    },

    takeCoin: function(player, coin) {
        coin.kill();
        if (this.coins.total == 0) {
            this.levelComplete();
        }
    },

    levelComplete: function () {
        current_level += 1;

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

    showText: function (message, fade) {
        var text = game.add.text(game.width / 2, game.height / 2, message, default_font_style);
        text.anchor.x = 0.5;
        text.anchor.y = 0.5;
        text.fixedToCamera = true;
        if (fade) {
            game.add.tween(text).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true);
        }
    },

    restart: function(level) {
        current_level = (level - 1) | 0;
        game.state.start('main');
    }

};


var game = new Phaser.Game(704, 224);
game.state.add('main', state);
game.state.start('main');