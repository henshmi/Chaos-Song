let myScale;

let cellWidth;
let toTranslate = 10;

let vertices = [];
let points = [];
let current;
let prev;

let synthsAmount = 32;
let synths = []
let synthIndex = 0;

let clearBtn;

// Settings
let n = 3;
let allowVertexRepeat = false;
let ppf = 1;
let sound = true;
let notClicked = true;


function setup() {

    for(let i = 0 ; i < synthsAmount ; i++ ){
        synths.push(createSynth());
    }

    myScale = ["C3", "D3", "E3", "G3", "A3",
               "C4", "D4", "E4", "G4", "A4",
               "C5", "D5", "E5", "G5", "A5", "C6" ];

    let myCanvas = createCanvas(600,600);
    myCanvas.parent("canvasContainer");

    myCanvas.mousePressed(canvasMousePress);

    cellWidth = width/myScale.length;
    width = 580;
    height = 580;

    clearBtn = document.getElementById('clear');
    clearBtn.addEventListener('click', reset);
}

function reset(){

    points = [];
    vertices = [];
    for(let i = 0 ; i < n ; i++) {
        let angle = i * TWO_PI / n - PI/2;
        let v = p5.Vector.fromAngle(angle);
        v.mult(width / 2);
        v.add(width / 2, height / 2);
        vertices.push(v)
    }
}

function draw() {

    drawBackground();
    translate(toTranslate, toTranslate);

    if(notClicked){
        showStartScreen();
        return;
    }
    else{
        updateSettings();
    }

    drawVertices();
    drawPoints(points);

    for(let i = 0 ; i < ppf ; i++ ){
        let next = random(vertices);

        if(next && allowVertexRepeat || prev !== next) {
    
            if(!current) {
                current = new p5.Vector(random(width), random(height), random(width));
            }
            else{
                let vx = lerp(current.x, next.x, 0.5);
                let vy = lerp(current.y, next.y, 0.5);
                current = new p5.Vector(vx, vy);
            }
    
            drawPoint(current, "#F76B66");
    
            if(sound){
                play(current.y);
            }
    
            points.push(current);
            prev = next;
        }
    }
}

function drawBackground() {
    background("#2A2E38");

    for(let i = 0 ; i < myScale.length ; i++ ){
        stroke(255, 255, 255, 10);
        strokeWeight(1);
        noFill();
        let pos = floor(map(i,0,myScale.length-1,height,0));
        line(0, pos + toTranslate, width, pos + toTranslate);
    }
}

function updateSettings(){
    let pace = document.getElementById('pace').value;
    frameRate(Number(pace));
    let vertices = document.getElementById('vertices').value;
    if(n != vertices){
        n = Number(vertices);
        current = null;
        reset();
    }
    sound = document.getElementById('soundOn').checked;
    allowVertexRepeat = document.getElementById('vertexRepeat').checked;
    ppf = document.getElementById('ppf').value;
}

function showStartScreen(){
    fill(255);
    noStroke();
    textSize(50);
    textAlign(CENTER, CENTER);
    text("Click anywhere to start...", width / 2, height / 2);
}

function drawVertices(){
    for(let i = 0 ; i < n ; i++) {
        stroke(255,255,255,63);
        strokeWeight(10);
        point(vertices[i].x, vertices[i].y);

        stroke('#F6D55C');
        strokeWeight(5);
        point(vertices[i].x, vertices[i].y);
    }
}

function drawPoints(points){
    for(let i = 0 ; i < points.length ; i++ ){
        drawPoint(points[i], "#ffffff", false);
    }
}

function drawPoint(p, color, background = true, size = 3) {

    if(background){
        stroke(255, 255, 255, 63);
        strokeWeight(7);
        point(p.x, p.y);
    }

    stroke(color);
    strokeWeight(size);
    point(p.x, p.y);
}

function createSynth() {
    return new Tone.Synth({
        oscillator: {
            type: 'sine',
            modulationType: 'sine',
            modulationIndex: 3,
            harmonicity: 3.4
        },
        envelope: {
            attack: 0.2,
            decay: 0.1,
            sustain: 0.5,
            release: 10
        }
    }).toMaster();
}

function play(y) {

    let synth = synths[synthIndex++ % synthsAmount];

    let pos = floor(map(y,height,0,0,myScale.length-1));
    let note = myScale[pos];
    synth.triggerAttackRelease(note, 0.01);
    synth.volume.value = 1;
}

function drawMouse(){
    push();
    translate(-toTranslate,-toTranslate);
    drawPoint({x: mouseX, y: mouseY}, "#F76B66", true, 5);
    pop();
}

function canvasMousePress(){
    if(notClicked){
        notClicked = false;
        reset();
    }
    else {
        drawMouse();
        play(mouseY - toTranslate);
    }
}


