(function Game(){
    var BLOCK_WIDTH = 25;
    var BLOCK_HEIGHT = 25;
    var DIR = { RIGHT: 39, DOWN: 40, LEFT: 37, UP: 38};
    var SPACEBAR = 32;

    var STATE = {
        RUNNING: "running",
        PAUSED: "paused",
        TERMINATED: "terminated"
    };

    this.blockCoords = [];
    this.state = undefined;
    this.direction = undefined;

    this.init = function () {
        this.canvas = document.getElementById("appCanvas");
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.canvasCtx = this.canvas.getContext("2d");
        this.canvasBounds = {
            RIGHT: this.canvas.width/BLOCK_WIDTH - 1,
            BOTTOM: this.canvas.height/BLOCK_HEIGHT - 1,
            LEFT: 0,
            TOP: 0
        };
    }

    this.start = function () {
        this.state = STATE.RUNNING;
        this.direction = DIR.RIGHT;
        this.blockCoords = [{w: 4, l: 4}, {w: 4, l: 5}];
        this.placeFood();
        this.eventLoop();
    };

    this.togglePause = function () {
        switch (this.state) {
        case STATE.RUNNING: {
            this.state = STATE.PAUSED;
        } break;
        case STATE.PAUSED: {
            this.state = STATE.RUNNING;
            this.eventLoop();
        } break;
        };
    };

    this.isBlockInSnake = function (selBlock) {
        return this.blockCoords.some(function (block) {
            return (selBlock.l === block.l && selBlock.w === block.w);
        });
    };

    this.placeFood = function () {
        var food = {
            w: Math.floor(Math.random() * (this.canvasBounds.RIGHT + 1)),
            l: Math.floor(Math.random() * (this.canvasBounds.BOTTOM + 1))
        };
        if (isBlockInSnake(food)) {
            placeFood();
        }
        else {
            this.foodBlock = food;
        }
    };

    this.isFoodEaten = function () {
        var head = this.blockCoords[this.blockCoords.length - 1];
        return (this.foodBlock.l === head.l && this.foodBlock.w === head.w);
    };

    this.bindEvents = function () {
        this.canvas.onmouseup = function (e) {
            var rect = this.canvas.getBoundingClientRect();
            var x = Math.floor((e.clientX - rect.left) / BLOCK_WIDTH);
            var y = Math.floor((e.clientY - rect.top) / BLOCK_HEIGHT);
            var head = this.blockCoords[this.blockCoords.length - 1];
            switch (this.direction) {
            case DIR.LEFT:
            case DIR.RIGHT: {
                if (y < head.l) {
                    this.direction = DIR.UP;
                }
                else if (y > head.l) {
                    this.direction = DIR.DOWN;
                }
            } break;
            case DIR.UP:
            case DIR.DOWN: {
                if (x < head.w) {
                    this.direction = DIR.LEFT;
                }
                else if (x > head.w) {
                    this.direction = DIR.RIGHT;
                }
            } break;
            };
            e.preventDefault();
        }.bind(this);
        $(document).keydown(function (event) {
            var key = event.which;
            switch (key) {
            case DIR.RIGHT:
            case DIR.DOWN:
            case DIR.LEFT:
            case DIR.UP: {
                if (this.state === STATE.RUNNING) {
                    this.direction = key;
                }
                break;
            }
            case SPACEBAR: {
                if (this.state === STATE.TERMINATED) {
                    this.start();
                }
                else {
                    this.togglePause();
                }
                break;
            }
            }
        }.bind(this));
    }.bind(this);

    this.drawSnake = function () {
        this.blockCoords.forEach(function (block) {
            this.canvasCtx.fillStyle =
                (this.state === STATE.RUNNING) ? "#fe57a1"
                : ((this.state === STATE.PAUSED) ? "#a1fe57" : "#ff0000");
            this.canvasCtx.fillRect(block.w * BLOCK_WIDTH,
                                    block.l * BLOCK_HEIGHT,
                                    BLOCK_WIDTH,
                                    BLOCK_HEIGHT);
        }.bind(this));
    };

    this.drawFood = function () {
        this.canvasCtx.fillStyle = "#57fea1";
        this.canvasCtx.fillRect(this.foodBlock.w * BLOCK_WIDTH,
                                this.foodBlock.l * BLOCK_HEIGHT,
                                BLOCK_WIDTH,
                                BLOCK_HEIGHT);
    };

    var tickDuration = 200; // 0.2sec
    this.eventLoop = function () {
        if (this.state === STATE.RUNNING) {
            this.advance();
        }
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawSnake();
        this.drawFood();
        if (this.state === STATE.RUNNING) {
            setTimeout(this.eventLoop.bind(this), tickDuration);
        }
    }.bind(this);

    this.advance = function () {
        var curHead = this.blockCoords[this.blockCoords.length - 1];
        var newHead = {w: curHead.w, l: curHead.l};
        switch (this.direction) {
        case DIR.RIGHT: {
            newHead.w++;
        } break;
        case DIR.DOWN: {
            newHead.l++;
        } break;
        case DIR.LEFT: {
            newHead.w--;
        } break;
        case DIR.UP: {
            newHead.l--;
        } break;
        }

        if (this.isBlockInSnake(newHead)) {
            this.state = STATE.TERMINATED;
            this.eventLoop();
            throw new Error("Collision!");
        }
        if (newHead.w < this.canvasBounds.LEFT) {
            this.state = STATE.TERMINATED;
            this.eventLoop();
            throw new Error("Hit left wall!");
        }
        if (newHead.w > this.canvasBounds.RIGHT) {
            this.state = STATE.TERMINATED;
            this.eventLoop();
            throw new Error("Hit right wall!");
        }
        if (newHead.l < this.canvasBounds.TOP) {
            this.state = STATE.TERMINATED;
            this.eventLoop();
            throw new Error("Hit top wall!");
        }
        if (newHead.l > this.canvasBounds.BOTTOM) {
            this.state = STATE.TERMINATED;
            this.eventLoop();
            throw new Error("Hit bottom wall!");
        }
        this.blockCoords.push(newHead);
        if (this.isFoodEaten()) {
            this.placeFood();
        }
        else {
            this.blockCoords.shift();
        }
    }.bind(this);

    $(document).ready(function () {
        this.init();
        this.bindEvents();
        this.start();
    }.bind(this));
})();
