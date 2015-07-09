(function Game(){
    var BLOCK_WIDTH = 25;
    var BLOCK_HEIGHT = 25;
    var DIR = { RIGHT: 39, DOWN: 40, LEFT: 37, UP: 38};

    this.blockCoords = [];
    this.running = undefined;
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

	this.running = false;
	this.direction = DIR.RIGHT;
	this.blockCoords = [{w: 4, l: 4}, {w: 4, l: 5}];
	this.placeFood();
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
	$(document).keydown(function (event) {
	    var key = event.which;
	    switch (key) {
	    case DIR.RIGHT: 
	    case DIR.DOWN: 
	    case DIR.LEFT: 
	    case DIR.UP: {
		this.direction = key;
		break;
	    }
	    }
        }.bind(this));
    }.bind(this);

    this.drawSnake = function () {
	this.blockCoords.forEach(function (block) {
	    this.canvasCtx.fillStyle = "#fe57a1";
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

    var tickDuration = 250; // 0.25sec
    this.eventLoop = function () {
	this.advance();
	this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.drawSnake();
	this.drawFood();
	setTimeout(this.eventLoop.bind(this), tickDuration);
    }.bind(this);

    this.advance = function () {
	var tail = this.blockCoords.shift();
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
	if (newHead.w < this.canvasBounds.LEFT) {
	    throw new Error ("Hit left wall!");
	}
	if (newHead.w > this.canvasBounds.RIGHT) {
	    throw new Error ("Hit right wall!");
	}
	if (newHead.l < this.canvasBounds.TOP) {
	    throw new Error ("Hit top wall!");
	}
	if (newHead.l > this.canvasBounds.BOTTOM) {
	    throw new Error ("Hit bottom wall!");
	}
	this.blockCoords.push(newHead);
	if (this.isFoodEaten()) {
	    this.blockCoords.unshift(tail);
	    this.placeFood();
	    this.advance();
	}
    }.bind(this);

    this.unpause = function () {
	this.running = true;
	this.eventLoop();
    }.bind(this);

    $(document).ready(function () {
        this.init();
	this.bindEvents();
	this.unpause();
    }.bind(this));
})();
