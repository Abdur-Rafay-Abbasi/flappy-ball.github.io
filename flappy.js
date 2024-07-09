const canvas = document.getElementById("canvas");
const scoreE = document.getElementById("score")
canvas.width = innerWidth - 30;
canvas.height = innerHeight - 20;
let score = 0;
const ctx = canvas.getContext("2d");
let end = false;

const percH = (size) => {
    return (size / 100) * canvas.height
}

const percW = (size) => {
    return (size / 100) * canvas.width
}

class Bird {
    constructor() {
        this.position = {
            x: 100,
            y: 200
        };
        this.velocity = {
            y: 0
        };
        this.gravity = 0.5;
        this.lift = -10;
        this.width = percH(7);
        this.height = percH(7);        
    }
        
    draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    
    update() {
        this.velocity.y += this.gravity;
        this.position.y += this.velocity.y;
        
        if (this.position.y + this.height > canvas.height) {
            this.position.y = canvas.height - this.height;
            this.velocity.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y = 0;
        }
        
        this.draw();
    }
    
    flap() {
        this.velocity.y = this.lift;
    }

    stop() {
        this.gravity = 0;
        this.velocity.y = 0;
    }

    reset() {
        this.position = { x: 100, y: 200 };
        this.velocity = { y: 0 };
        this.gravity = 0.5;
    }
}

const obstopHeights = [percH(15), percH(70), percH(30), percH(25)];
const obsdownHeights = [percH(60), percH(5), percH(45), percH(50)];

const initial = 700;
const space = 400;

const obstopDimensions = obstopHeights.map((height, index) => ({
    x: initial + index * space,
    height: height
}));

const obsdownDimensions = obsdownHeights.map((height, index) => ({
    x: initial + index * space,
    height: height
}));

class Obstop {
    constructor(pos, height) {
        this.position = {
            x: pos,
            y: 0
        };
        this.height = height;
        this.width = percH(15);
        this.speed = 2; 
        this.passed = false;       
    }
    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.position.x -= this.speed;
        if (this.position.x + this.width < 0) {
            this.position.x =  obstopHeights.length * space; 
        }
        this.draw();        
        this.passed = false;
    }

    stop() {
        this.speed = 0
    }

    reset(index) {
        this.position.x = initial + index * space;
        this.speed = 2;
    }
} 

class Obsdown {
    constructor(pos, height) {  
        this.height = height;
        this.width = percH(15);
        this.speed = 2;
        this.position = {
            x: pos,
            y : canvas.height - this.height
        };
        this.passed = false;
    }
    draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.position.x -= this.speed;
        if (this.position.x + this.width < 0) {
            this.position.x = obsdownHeights.length * space; 
        }
        this.draw();
        this.passed = false;
    }   

    stop() {
        this.speed = 0
        end = true;
    }

    reset(index) {
        this.position.x = initial + index * space;
        this.position.y = canvas.height - this.height;
        this.speed = 2;
    }
} 

const stopObs = () => {
    topObs.forEach(obstacle => obstacle.stop());
    downObs.forEach(obstacle => obstacle.stop());
}

const topObs = obstopDimensions.map(
    (topOb) => new Obstop(topOb.x, topOb.height)
);

const downObs = obsdownDimensions.map(
    (downOb) => new Obsdown(downOb.x, downOb.height)
);

const bird = new Bird();

const animate = () => {
    requestAnimationFrame(animate);
    collision()
    increase()
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bird.update();

    topObs.forEach(topOb => {
        topOb.update();
    });

    downObs.forEach(downOb => {
        downOb.update();
    });
}
 
const collision = () => {
    if (bird.position.y + bird.height === canvas.height) {
       stopObs()
       bird.stop() 
    } 
    if (bird.position.y == 0) {
       stopObs()
       bird.stop()  
    }
    
        const isColliding = (bird, obstacle) => {
            return (
                bird.position.x < obstacle.position.x + obstacle.width &&
                bird.position.x + bird.width > obstacle.position.x &&
                bird.position.y < obstacle.position.y + obstacle.height &&
                bird.position.y + bird.height > obstacle.position.y
            );
        };
    
        topObs.forEach(obstacle => {
            if (isColliding(bird, obstacle)) {
                stopObs()
                bird.stop()
            }
        });
    
        downObs.forEach(obstacle => {
            if (isColliding(bird, obstacle)) {
               stopObs()
               bird.stop()
            }
        });
    };

const capturePositions = () => {
    const positionsT = topObs.map(obstacle => ({
        x: obstacle.position.x,
        y: obstacle.position.y,
    }));
    const positionsD = downObs.map(obstacle => ({
        x: obstacle.position.x,
        y: obstacle.position.y,
    }));
}

const increase = () => {
    topObs.forEach(obs => {
        if (!end && bird.position.x  > (obs.position.x + obs.width)) { 
                    
            score++
            scoreE.textContent = `${Math.ceil(score / 50)}`            
        }
    })    
}

const resetGame = () => {
    bird.reset();
    topObs.forEach((obs, index) => obs.reset(index));
    downObs.forEach((obs, index) => obs.reset(index));
    score = 0;
    scoreE.textContent = '0';
}

window.addEventListener("keydown", ({ key }) => {
    if (key === " " || key === "ArrowUp") {
        bird.flap();
    }
    if (key === "r") {
        resetGame()
    }  
});

window.addEventListener("touchstart", ()=> {
    bird.flap()
})

animate();
