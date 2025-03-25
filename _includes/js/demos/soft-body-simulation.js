import Shader from "/js/shader.js"
import { create4x2Matrix, set4x2Matrix } from "/js/matrix.js"
import Rect from "/js/rect.js"
import { fastSqrt } from "/js/fastMath.js";

const rowsInput = document.getElementById("rows");
const colsInput = document.getElementById("cols");

rowsInput.labels[0].innerText = "Rows: " + parseInt(rowsInput.value);
colsInput.labels[0].innerText = "Cols: " + parseInt(colsInput.value);

const springForceInput = document.getElementById("springForce");
const dampingInput = document.getElementById("damping");
const maxSpringLengthInput = document.getElementById("maxSpringLength");

const toggleInput = document.getElementById("toggle-simulation");

const springForceFactor = 2000;
const dampingFactor = 40;

const mass = 1;
const timeStep = 0.004;

let isRunning = false;

let rows = parseInt(rowsInput.value);
let cols = parseInt(colsInput.value);

let springForce = springForceFactor * parseFloat(springForceInput.value);
let damping = dampingFactor * parseFloat(dampingInput.value);
let maxSpringLength = parseFloat(maxSpringLengthInput.value);

let intervalID = 0;

let nodeRadius = 0;
let lineWidth = 0;

let step = 0;
let maxLength = 0;

let nodeCount = 0;

let nodePositionsX = [];
let nodePositionsY = [];

let nodeLastPositionsX = [];
let nodeLastPositionsY = [];

let nodeVelocitiesX = [];
let nodeVelocitiesY = [];

let nodeForcesX = [];
let nodeForcesY = [];

let nodeIsSelected = [];

let mouseRelativePosX = [];
let mouseRelativePosY = [];

let nodeRows = [];
let nodeCols = [];

let nodeLinks = [];

let nodeLinkCount = 0;

const canvas = document.querySelector("#glcanvas");

let width = canvas.width = canvas.clientHeight;
let height = canvas.height = canvas.clientHeight;

document.onresize = (e) => {
    width = canvas.width;
    height = canvas.height;
    GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
}

function initialize() 
{
    step = (2 - 0.5) / ((cols > rows ? cols : rows) - 1);
    maxLength = maxSpringLength * step;

    nodeRadius = 0.7 / (rows + cols);
    lineWidth = 0.15 / (rows + cols);

    GL.useProgram(lineShader.program);

    GL.uniform1f(
        lineShader.getUniformLocation("lineWidth"),
        lineWidth
    );

    const marginX = 0.25 + (cols < rows ? (rows - cols) * step * 0.5 : 0);
    const marginY = 0.25 + (rows < cols ? (cols - rows) * step * 0.5 : 0);

    nodeCount = rows * cols;

    nodePositionsX = new Float32Array(nodeCount);
    nodePositionsY = new Float32Array(nodeCount);

    nodeLastPositionsX = new Float32Array(nodeCount);
    nodeLastPositionsY = new Float32Array(nodeCount);

    nodeVelocitiesX = new Float32Array(nodeCount);
    nodeVelocitiesY = new Float32Array(nodeCount);
    
    nodeForcesX = new Float32Array(nodeCount);
    nodeForcesY = new Float32Array(nodeCount);

    nodeRows = new Uint8Array(nodeCount);
    nodeCols = new Uint8Array(nodeCount);

    nodeIsSelected = new Uint8Array(nodeCount);

    mouseRelativePosX = new Float32Array(nodeCount);
    mouseRelativePosY = new Float32Array(nodeCount);

    nodeLinkCount = (rows - 1) * cols + (cols - 1) * rows;
    
    nodeLinks = new Array(nodeLinkCount);

    let nodeLinkIndex = 0;

    for (let i = 0; i < rows; i++) 
    {
        for (let j = 0; j < cols; j++) 
        {
            const index = i * cols + j;

            nodePositionsX[index] = -1 + marginX + step * j;
            nodePositionsY[index] = -(-1 + marginY + step * i);

            nodeLastPositionsX[index] = -1 + marginX + step * j;
            nodeLastPositionsY[index] = -(-1 + marginY+ step * i);

            nodeVelocitiesX[index] = 0;
            nodeVelocitiesY[index] = 0;

            nodeForcesX[index] = 0;
            nodeForcesY[index] = 0;

            nodeRows[index] = i; 
            nodeCols[index] = j

            nodeIsSelected[index] = 0;
                        
            if (j < cols - 1) {          
                nodeLinks[nodeLinkIndex] = [index, index + 1];
                nodeLinkIndex++;
            }

            if (i < rows - 1) {            
                nodeLinks[nodeLinkIndex] = [index, index + cols];
                nodeLinkIndex++;
            }
        }
    }
}

const frametimeText = document.getElementById("frametime");

const frametimeList = [];

let startTime = 0;

function physicsLoop() 
{
    if (!isRunning) return;

    updateForces();    
    updatePositions();    

    if (frametimeList.length > 100) {   
        frametimeList.shift();
    } 

    frametimeList.push(Date.now() - startTime);
    startTime = Date.now();
}

function renderLoop() 
{
    drawLines();
    drawCircles();
    drawCursor();

    frametimeText.innerText = (frametimeList.reduce((partialSum, a) => partialSum + a, 0) / frametimeList.length).toFixed(1);

    requestAnimationFrame(renderLoop);
}

function mouseLoop() 
{
    for (let i = 0; i < nodeCount; i++) 
    {
        if (nodeIsSelected[i] == 0) {
            continue;
        }

        nodePositionsX[i] = mouseRelativePosX[i] + mousePosX;
        nodePositionsY[i] = mouseRelativePosY[i] + mousePosY;
        nodeLastPositionsX[i] = mouseRelativePosX[i] + mousePosX;
        nodeLastPositionsY[i] = mouseRelativePosY[i] + mousePosY;
    }

    requestAnimationFrame(mouseLoop);
}

/*
 * Physics 
 */

// Smaller timesteps produce more stable results
const MassInverse = 1.0 / mass;
const timeStepSquaredTimesMassInverse = timeStep * timeStep * (1.0 / mass);
const twoTimeStepInverse = (1 / (2 * timeStep));

function updatePositions() 
{
    for (let i = 0; i < nodeCount; i++) 
    {
        if (nodeIsSelected[i] == 1) {
            continue;
        }

        const currentPosX = nodePositionsX[i];
        const currentPosY = nodePositionsY[i];

        // Update positions & velocity Verlet

        const deltaX = nodePositionsX[i] - nodeLastPositionsX[i];
        const deltaY = nodePositionsY[i] - nodeLastPositionsY[i];
    
        nodePositionsX[i] += (deltaX + nodeForcesX[i] * timeStepSquaredTimesMassInverse);
        nodePositionsY[i] += (deltaY + nodeForcesY[i] * timeStepSquaredTimesMassInverse);
    
        nodeVelocitiesX[i] = (twoTimeStepInverse * deltaX);
        nodeVelocitiesY[i] = (twoTimeStepInverse * deltaY);

        // Update positions & veolocity Euler 

        //nodePositionsX[i] += timeStep * nodeVelocitiesX[i];
        //nodePositionsY[i] += timeStep * nodeVelocitiesY[i];

        //nodeVelocitiesX[i] += timeStep * (nodeForcesX[i] * MassInverse);
        //nodeVelocitiesY[i] += timeStep * (nodeForcesY[i] * MassInverse); 

        // Update last position

        nodeLastPositionsX[i] = currentPosX;
        nodeLastPositionsY[i] = currentPosY;
    }
}

function updateForces() 
{
    // Reset forces
    nodeForcesX.fill(0);
    nodeForcesY.fill(0);
 
    for (let i = 0; i < nodeLinkCount; i++) 
    {
        const [sourceIndex, targetIndex] = nodeLinks[i];

        const lenX = step * Math.abs(nodeCols[targetIndex] - nodeCols[sourceIndex]);
        const lenY = step * Math.abs(nodeRows[targetIndex] - nodeRows[sourceIndex]);

        // Calculate spring force

        const diffX = nodePositionsX[sourceIndex] - nodePositionsX[targetIndex];
        const diffY = nodePositionsY[sourceIndex] - nodePositionsY[targetIndex];

        const springForceX = -springForce * (Math.abs(diffX) - lenX) * Math.sign(diffX);
        const springForceY = -springForce * (Math.abs(diffY) - lenY) * Math.sign(diffY);

        // Calculate damping force

        const dampingForceX = -damping * (nodeVelocitiesX[sourceIndex] - nodeVelocitiesX[targetIndex]);
        const dampingForceY = -damping * (nodeVelocitiesY[sourceIndex] - nodeVelocitiesY[targetIndex]);

        // Add forces

        const TotalForceX = springForceX + dampingForceX;
        const TotalForceY = springForceY + dampingForceY;

        nodeForcesX[sourceIndex] += TotalForceX;
        nodeForcesY[sourceIndex] += TotalForceY;

        nodeForcesX[targetIndex] -= TotalForceX;
        nodeForcesY[targetIndex] -= TotalForceY;
    }   

    for (let i = 0; i < nodeCount; i++) 
    {
        nodeForcesX[i] -= nodeVelocitiesX[i] * damping;
        nodeForcesY[i] -= nodeVelocitiesY[i] * damping;
    }
}

function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  }  

function limitSpringLength() 
{    
    if (!isRunning) {
        return;
    }

    for (let i = 0; i < nodeLinkCount; i++) 
    {
        const [sourceIndex, targetIndex] = nodeLinks[i];

        const diffX = nodePositionsX[targetIndex] - nodePositionsX[sourceIndex];
        const diffY = nodePositionsY[targetIndex] - nodePositionsY[sourceIndex];
    
        //const distance = Math.sqrt(diffX * diffX + diffY * diffY);
        const distance = fastSqrt(diffX * diffX + diffY * diffY);
    
        if (distance < maxLength) {
            continue;
        }

        //const length = fastSqrt(distance - maxLength);    
        const length = distance - maxLength;    

        nodePositionsX[sourceIndex] += length * diffX;
        nodePositionsY[sourceIndex] += length * diffY; 
        
        nodeLastPositionsX[sourceIndex] += length * diffX;
        nodeLastPositionsY[sourceIndex] += length * diffY;

        nodePositionsX[targetIndex] -= length * diffX;
        nodePositionsY[targetIndex] -= length * diffY; 

        nodeLastPositionsX[targetIndex] -= length * diffX;
        nodeLastPositionsY[targetIndex] -= length * diffY;
    }
}

/*
 * Rendering
 */

const circleVert = document.getElementById("circle-vert").innerText;
const circleFrag = document.getElementById("circle-frag").innerText;

const lineVert = document.getElementById("line-vert").innerText;
const lineFrag = document.getElementById("line-frag").innerText;

const cursorVert = document.getElementById("cursor-vert").innerText;
const cursorFrag = document.getElementById("cursor-frag").innerText;

const GL = canvas.getContext("webgl2");

GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
GL.clearColor(0.135, 0.135, 0.135, 1.0);
GL.clear(GL.COLOR_BUFFER_BIT);

GL.enable(GL.BLEND)
GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

const rect = new Rect(GL);

const circleShader = new Shader(GL, circleVert, circleFrag);
const lineShader = new Shader(GL, lineVert, lineFrag);
const cursorShader = new Shader(GL, cursorVert, cursorFrag);

const INSTANCES_PER_DRAWCALL = 200;

const matrices = new Float32Array(INSTANCES_PER_DRAWCALL * 8);

function drawCircles() 
{
    const drawcalls = Math.ceil(nodeCount / INSTANCES_PER_DRAWCALL);

    GL.useProgram(circleShader.program);
    rect.bind();

    for (let drawcall = 0; drawcall < drawcalls; drawcall++) 
    {
        if(drawcall == drawcalls - 1) { 
            matrices.fill(0); 
        }

        const offset = drawcall * INSTANCES_PER_DRAWCALL;

        for (let i = 0; i < INSTANCES_PER_DRAWCALL && offset + i < nodeCount; i++) 
        {
            const index = offset + i;

            set4x2Matrix(
                matrices,
                i * 8,
                nodePositionsX[index],
                nodePositionsY[index], 
                nodeRadius,
                nodeRadius
            );
        }

        GL.uniformMatrix4x2fv(
            circleShader.getUniformLocation("modelView"), 
            false, 
            matrices,
            0
        );

        rect.drawInstanced(INSTANCES_PER_DRAWCALL);
    }
}

const sourcePositions = new Float32Array(INSTANCES_PER_DRAWCALL * 2);
const targetPositions = new Float32Array(INSTANCES_PER_DRAWCALL * 2);

function drawLines() 
{
    const drawcalls = Math.ceil(nodeLinkCount / INSTANCES_PER_DRAWCALL)

    GL.useProgram(lineShader.program);
    rect.bind();

    for (let drawcall = 0; drawcall < drawcalls; drawcall++) 
    {
        if(drawcall == drawcalls - 1) { 
            sourcePositions.fill(0); 
            targetPositions.fill(0); 
        }

        const offset = drawcall * INSTANCES_PER_DRAWCALL;

        for (let i = 0; i < INSTANCES_PER_DRAWCALL && offset + i < nodeLinkCount; i++) 
        {
            const index = offset + i;

            const [sourceIndex, targetIndex] = nodeLinks[index];

            sourcePositions[i * 2 + 0] = nodePositionsX[sourceIndex];
            sourcePositions[i * 2 + 1] = nodePositionsY[sourceIndex];
            
            targetPositions[i * 2 + 0] = nodePositionsX[targetIndex];
            targetPositions[i * 2 + 1] = nodePositionsY[targetIndex];
        }

        GL.uniform2fv(
            lineShader.getUniformLocation("sourcePositions"),
            sourcePositions
        );

        GL.uniform2fv(
            lineShader.getUniformLocation("targetPositions"),
            targetPositions
        );

        rect.drawInstanced(INSTANCES_PER_DRAWCALL);
    }
}

function drawCursor() 
{
    GL.useProgram(cursorShader.program);
    rect.bind();

    GL.uniformMatrix4x2fv(
        cursorShader.getUniformLocation("modelView"), 
        false, 
        create4x2Matrix(
            mousePosX,
            mousePosY,
            cursorRadius,
            cursorRadius
        ),
        0
    );

    rect.draw();
}

/*
 * Mouse events
 */

let cursorRadius = 0.1;

function getMousePos(e) {
    var rect = canvas.getBoundingClientRect();
    return [
        2 * (e.clientX - rect.left) / width - 1,
        -(2 * (e.clientY - rect.top) / height - 1)
    ];
}

function getMouseDelta(e) {
    return [
        2 * e.movementX / width,
        -(2 * e.movementY / height)
    ];
}

let mousePosX = 0;
let mousePosY = 0;


canvas.addEventListener("mousedown", (e) => 
{
    [mousePosX, mousePosY] = getMousePos(e);

    for (let i = 0; i < nodeCount; i++) 
    {
        const mouseDiffX = nodePositionsX[i] - mousePosX;
        const mouseDiffY = nodePositionsY[i] - mousePosY;

        const distance = fastSqrt(mouseDiffX * mouseDiffX + mouseDiffY * mouseDiffY);

        if (distance < nodeRadius + cursorRadius) {
            nodeIsSelected[i] = 1;
            mouseRelativePosX[i] = mouseDiffX; 
            mouseRelativePosY[i] = mouseDiffY; 
        }
    } 
});

document.addEventListener("mousemove", (e) => 
{
    [mousePosX, mousePosY] = getMousePos(e);
});

canvas.addEventListener("wheel", (e) => 
{
    e.preventDefault();
    e.stopPropagation();

    if (canvas.matches(':hover')) {
        cursorRadius += -0.0002 * e.deltaY;
        cursorRadius = Math.max(Math.min(cursorRadius, 0.5), 0.0225);
    }
});

canvas.addEventListener("mouseleave", (e) => nodeIsSelected.fill(0));
canvas.addEventListener("mouseup", (e) => nodeIsSelected.fill(0));

/*
 * Input Events
 */


toggleInput.onclick = (e) => {
    startTime = Date.now();
    isRunning = !isRunning;
    toggleInput.innerText = isRunning ? "Stop Simulation" : "Start Simulation";
    if (isRunning) {
        intervalID = setInterval(physicsLoop, 0 );
    } else {
        clearInterval(intervalID);
    }
};

rowsInput.oninput = (e) => { 
    rows = parseInt(e.target.value); 
    rowsInput.labels[0].innerText = "Rows: " + parseInt(e.target.value);
    initialize(); 
};

colsInput.oninput = (e) => { 
    cols = parseInt(e.target.value); 
    colsInput.labels[0].innerText = "Cols: " + parseInt(e.target.value);
    initialize(); 
};

springForceInput.oninput = (e) => {
    springForce = springForceFactor * parseFloat(e.target.value);
    springForceInput.labels[0].innerText = "Spring Force: " + parseFloat(e.target.value).toFixed(2);
}

dampingInput.oninput = (e) => {
    damping = dampingFactor * parseFloat(e.target.value);
    dampingInput.labels[0].innerText = "Damping: " + parseFloat(e.target.value).toFixed(2);
}

maxSpringLengthInput.oninput = (e) => {
    maxSpringLength = parseFloat(e.target.value);
    maxLength = maxSpringLength * step;
    maxSpringLengthInput.labels[0].innerText = "Max Spring Length: " + parseFloat(e.target.value).toFixed(2);
}

/*
 * Entry point
 */

initialize();
renderLoop();
mouseLoop();
setInterval(limitSpringLength, 0);