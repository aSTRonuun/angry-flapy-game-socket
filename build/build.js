var bird;
var pipes = [];
var bird_img;
var pipe_img_bottom;
var pipe_img_top;
var background_img;
let playerBird = []


let socket = io();
let start = false;
let isLife = true;
let topPipe = 0;
let bottomPipe = 0;
let team;
let end = false;
let win = false;
let gameover = false;

socket.on("start", () => {
    start = true;
})

socket.on("newPlayer", (id) => {
    playerBird.push({
        id: id,
        bird: new Bird(other_player)
    });
})

socket.on("up", (id) => {
    for(let player of playerBird) {
        if(player.id === id) {
            player.bird.up();
        }
    }
})

socket.on("randomPipeTop", (value) => {
    topPipe = value;
});

socket.on("randomPipeBottom", (value) => {
    bottomPipe = value;
});

socket.on("team", (id, team) => {
    if (id === socket.id) {
        console.log(team);
        this.team = team;
    }
})

socket.on("restart", () => {
    start = true;
} )

socket.on("end", (team) => {
    end = true;
    start = false;
    win = team === this.team;
    playerBird = [];
})

function handleHit() {
    console.log("hit");
    socket.emit("hit", socket.id)
}



function randomPipeTopServer() {
    socket.emit("randomPipeTop");
    
}

function randomPipeBottomServer() {
    let bottom = 0;
    socket.emit("randomPipeBottom");
    return bottom;
}

randomPipeTopServer()
randomPipeBottomServer()



function loadImg(path) {
    return loadImage(path, function () { return console.log("Loading " + path + " ok"); }, function () { return console.log("Loading " + path + " error"); });
}
function preload() {
    bird_img = loadImg("../assets/bird1.png");
    other_player = loadImg("../assets/bird2.png");
    pipe_img_bottom = loadImg("../assets/pipe_bottom.png");
    pipe_img_top = loadImg("../assets/pipe_top.png");
    background_img = loadImg("../assets/paisagem.jpg");
}
function setup() {
    createCanvas(windowWidth, windowHeight);
    bird = new Bird(bird_img);
    pipes.push(new Pipe(pipe_img_top, pipe_img_bottom));
}

console.log(playerBird.length);

function draw() {
    print_background();
    bird.draw();
    bird.update();

    for(let player of playerBird) {
        player.bird.draw();
        player.bird.update();
    }
    

    if(start) {
        addPipe();
        for (var i = pipes.length - 1; i >= 0; i--) {
            pipes[i].draw();
            pipes[i].update();
            if (pipes[i].hit(bird)) {
                handleHit();
            }
            if (pipes[i].offescreen()) {
                pipes.splice(i, 1);
            }
        }
    } else if (end) {

        if (win) {
            textSize(100);
            text("Your team wins", 100, 100);
        } else {
            textSize(100);
            text("Your team lose", 100, 100);
        }

        textSize(80);
        text("Press R to restart", 100, 200);
    } else if (gameover) {
        textSize(100);
        text("Game Over", 100, 100);
    }
    else {
        textSize(100);
        text("Wating others players", 100, 100);
    }
}
function print_background() {
    image(background_img, 0, 0, windowWidth, windowHeight);
}
function addPipe() {
    if (frameCount % 100 === 0) {
        pipes.push(new Pipe(pipe_img_top, pipe_img_bottom));
    }
}
function keyPressed() {
    if (key === ' ') {
        socket.emit("up", socket.id);
        bird.up();
    } 

    if (key === 'r') {
        socket.emit("restart");
        end = false;
    }

    if (key === 'd') {
        console.log("d");
        gameover = true;
        end = true;
        socket.disconnect();
    }
}
var Bird = (function () {
    function Bird(img) {
        this.img = img;
        this._x = 65;
        this._y = height / 2;
        this.gravity = 0.3;
        this.lift = -10;
        this.velocity = 0;
    }
    Object.defineProperty(Bird.prototype, "x", {
        get: function () {
            return this._x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bird.prototype, "y", {
        get: function () {
            return this._y;
        },
        enumerable: true,
        configurable: true
    });
    Bird.prototype.draw = function () {
        fill(255);
        image(this.img, this._x, this._y, 50, 50);
    };
    Bird.prototype.update = function () {
        this.velocity += this.gravity;
        this._y += this.velocity;
        this.velocity *= 0.9;
        if (this._y > height) {
            this._y = height;
            this.velocity = 0;
        }
        if (this._y < 0) {
            this._y = 0;
            this.velocity = 0;
        }
    };
    Bird.prototype.up = function () {
        this.velocity += this.lift;
    };
    return Bird;
}());
var Pipe = (function () {
    function Pipe(pipe_top, pipe_bottom) {
        randomPipeBottomServer();
        randomPipeTopServer();
        this.pipe_top = pipe_top;
        this.pipe_bottom = pipe_bottom;
        this.top = topPipe;
        this.bottom = bottomPipe;
        this.x = width;
        this.y = 20;
        this.speed = 4;
        this.hightligt = false;
    }
    Pipe.prototype.draw = function () {
        fill(255);
        if (this.hightligt)
            fill(255, 0, 0);
        image(this.pipe_top, this.x, 0, this.y + 10, this.top + 10);
        image(this.pipe_bottom, this.x, height - this.bottom, this.y + 10, this.bottom + 10);
    };
    Pipe.prototype.update = function () {
        this.x -= this.speed;
    };
    Pipe.prototype.offescreen = function () {
        if (this.x < -this.y) {
            return true;
        }
        return false;
    };
    Pipe.prototype.hit = function (bird) {
        if (bird.y + 10 < this.top || bird.y + 10 > height - this.bottom + 10) {
            if (bird.x > this.x && bird.x < this.x + this.y) {
                this.hightligt = true;
                return true;
            }
        }
        this.hightligt = false;
        return false;
    };
    return Pipe;
}());
//# sourceMappingURL=build.js.map