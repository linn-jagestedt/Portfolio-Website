import createShader from "../utils/shader.js"
import { create4x2Matrix, create4x2MatrixRotation, set4x2Matrix, set4x2MatrixRotation } from "../utils/matrix.js"
import RectInstanced from "../utils/rectInstanced.js"
import Rect from "../utils/rect.js"
import { fastCos, fastSin, fastSqrt } from "../utils/trigonometry.js";

const rowsInput = document.getElementById("rows");
const colsInput = document.getElementById("cols");

const springForceInput = document.getElementById("springForce");
const dampingInput = document.getElementById("damping");
const maxSpringLengthInput = document.getElementById("maxSpringLength");
const resistanceInput = document.getElementById("resistance");

const toggleInput = document.getElementById("toggle-simulation");

const springForceFactor = 4000;
const dampingFactor = 40;

let rows = parseInt(rowsInput.value);
let cols = parseInt(colsInput.value);

let springForce = springForceFactor * parseFloat(springForceInput.value);
let damping = dampingFactor * parseFloat(dampingInput.value);

let maxSpringLength = parseFloat(maxSpringLengthInput.value);

let isRunning = false;

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

resistanceInput.oninput = (e) => {
    resistance = resistanceFactor * parseFloat(e.target.value);
    resistanceInput.labels[0].innerText = "Resistance: " + parseFloat(e.target.value).toFixed(2);
}

let intervalID = 0;

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

const mass = 1;
const timeStep = 0.004;

let nodeRadius = 0;
let lineWidth = 0;

let step = 0;
let maxLength = 0;
let minLength = 0;

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
    minLength = 1.0 * step;

    nodeRadius = 0.7 / (rows + cols);
    lineWidth = 0.15 / (rows + cols);

    lineVAO.useProgram();

    GL.uniform1f(
        lineWidthLocation,
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

    nodeRows = new Float32Array(nodeCount);
    nodeCols = new Float32Array(nodeCount);

    nodeIsSelected = new Array(nodeCount);

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

            nodeIsSelected[index] = false;
                        
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
let frameTimeIndex = 0;

let startTime = 0;

function physicsLoop() 
{
    if (!isRunning) return;

    updateForces();    
    updatePositions();    
    limitSpringLength();

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
    if (mouseDeltaX != 0 || mouseDeltaY != 0) 
    { 
        for (let i = 0; i < nodeCount; i++) 
        {
            if (!nodeIsSelected[i]) {
                continue;
            }

            nodePositionsX[i] += mouseDeltaX;
            nodePositionsY[i] += mouseDeltaY;
            nodeLastPositionsX[i] += mouseDeltaX;
            nodeLastPositionsY[i] += mouseDeltaY;
        }
        
        mouseDeltaX = 0;
        mouseDeltaY = 0;

    }

    if (!isRunning) {
        limitSpringLength();
    }

    requestAnimationFrame(mouseLoop);
}

/*
 * Physics 
 */

// Smaller timesteps produce more stable results
const MassInverse = 1.0 / mass;
const timeStepSquaredTimesMassInverse = timeStep * timeStep * (1.0 / mass);
const twoTimestimeStepInverse = (1 / (2 * timeStep));

function updatePositions() 
{
    for (let i = 0; i < nodeCount; i++) 
    {
        if (nodeIsSelected[i]) {
            continue;
        }

        const currentPosX = nodePositionsX[i];
        const currentPosY = nodePositionsY[i];

        // Update positions & velocity Verlet

        const deltaX = nodePositionsX[i] - nodeLastPositionsX[i];
        const deltaY = nodePositionsY[i] - nodeLastPositionsY[i];
    
        nodePositionsX[i] += (deltaX + nodeForcesX[i] * timeStepSquaredTimesMassInverse);
        nodePositionsY[i] += (deltaY + nodeForcesY[i] * timeStepSquaredTimesMassInverse);
    
        nodeVelocitiesX[i] = (twoTimestimeStepInverse * deltaX);
        nodeVelocitiesY[i] = (twoTimestimeStepInverse * deltaY);

        /* Update positions & veolocity Euler 

        nodePositionsX[i] += timeStep * nodeVelocitiesX[i] * selected;
        nodePositionsY[i] += timeStep * nodeVelocitiesY[i] * selected;

        nodeVelocitiesX[i] += timeStep * (nodeForces[i][0] * MassInverse) * selected;
        nodeVelocitiesY[i] += timeStep * (nodeForces[i][1] * MassInverse) * selected; */

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

function limitSpringLength() 
{
    for (let i = 0; i < nodeLinkCount; i++) 
    {
        const sourceIndex = nodeLinks[i][0];
        const targetIndex = nodeLinks[i][1];

        const diffX = nodePositionsX[targetIndex] - nodePositionsX[sourceIndex];
        const diffY = nodePositionsY[targetIndex] - nodePositionsY[sourceIndex];
    
        const distance = fastSqrt(diffX * diffX + diffY * diffY);
    
        if (distance < maxLength) {
            continue;
        }

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

const GL = canvas.getContext("webgl2");

GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
GL.clearColor(0.135, 0.135, 0.135, 1.0);
GL.clear(GL.COLOR_BUFFER_BIT);

GL.enable(GL.BLEND)
GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

const circleVert = await (await fetch(document.querySelector("#circle-vert").src)).text();
const circleFrag = await (await fetch(document.querySelector("#circle-frag").src)).text();

const circleShader = await createShader(circleVert, circleFrag);

const lineVert = await (await fetch(document.querySelector("#line-vert").src)).text();
const lineFrag = await (await fetch(document.querySelector("#line-frag").src)).text();

const lineShader = await createShader(lineVert, lineFrag);

const cursorVert = await (await fetch(document.querySelector("#cursor-vert").src)).text();
const cursorFrag = await (await fetch(document.querySelector("#cursor-frag").src)).text();

const cursorShader = await createShader(cursorVert, cursorFrag);

const circleVAO = new RectInstanced(circleShader);
const lineVAO = new RectInstanced(lineShader);
const cursorVAO = new Rect(cursorShader);

lineVAO.useProgram();

const lineWidthLocation = GL.getUniformLocation(lineVAO.shader, "lineWidth");
const sourcePosLocation = GL.getUniformLocation(lineVAO.shader, "sourcePositions");
const targetPosLocation = GL.getUniformLocation(lineVAO.shader, "targetPositions");

const INSTANCES_PER_DRAWCALL = 200;

const matrices = new Float32Array(INSTANCES_PER_DRAWCALL * 8);

function drawCircles() 
{
    const drawcalls = Math.ceil(nodeCount / INSTANCES_PER_DRAWCALL);

    circleVAO.useProgram();

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

        circleVAO.set4x2ModelView(matrices)
        circleVAO.draw(INSTANCES_PER_DRAWCALL);
    }
}

const sourcePositions = new Float32Array(INSTANCES_PER_DRAWCALL * 2);
const targetPositions = new Float32Array(INSTANCES_PER_DRAWCALL * 2);

function drawLines() 
{
    const drawcalls = Math.ceil(nodeLinkCount / INSTANCES_PER_DRAWCALL)

    lineVAO.useProgram();

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
            sourcePosLocation,
            sourcePositions
        );

        GL.uniform2fv(
            targetPosLocation,
            targetPositions
        );

        lineVAO.draw(INSTANCES_PER_DRAWCALL);
    }
}

function drawCursor() 
{
    cursorVAO.useProgram();

    cursorVAO.set4x2ModelView(
        create4x2Matrix(
            mousePosX,
            mousePosY,
            cursorRadius,
            cursorRadius
        )
    );

    cursorVAO.draw();
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

canvas.addEventListener("mousedown", (e) => 
{
    const mouse = getMousePos(e);

    mouseDeltaX = 0;
    mouseDeltaY = 0;

    for (let i = 0; i < nodeCount; i++) 
    {
        const mouseDiffX = mouse[0] - nodePositionsX[i];
        const mouseDiffY = mouse[1] - nodePositionsY[i];

        const distance = fastSqrt(mouseDiffX * mouseDiffX + mouseDiffY * mouseDiffY)

        if (distance < nodeRadius + cursorRadius) {
            nodeIsSelected[i] = true;
        }
    } 
});

let mouseDeltaX = 0;
let mouseDeltaY = 0;

let mousePosX = 0;
let mousePosY = 0;

document.addEventListener("mousemove", (e) => 
{
    const mouse = getMousePos(e);

    mousePosX = mouse[0];
    mousePosY = mouse[1];

    if (nodeIsSelected.includes(true)) 
    {
        const delta = getMouseDelta(e);

        mouseDeltaX += delta[0];
        mouseDeltaY += delta[1];
    } 
});

document.addEventListener("wheel", (e) => 
{
    cursorRadius += -0.001 * e.deltaY;

    cursorRadius = 
        cursorRadius > 0.5 ? 0.5 : 
        cursorRadius < 0.01 ? 0.01 : 
        cursorRadius
    ;
});

canvas.addEventListener("mouseleave", (e) => nodeIsSelected.fill(false));
canvas.addEventListener("mouseup", (e) => nodeIsSelected.fill(false));

initialize();
renderLoop();
mouseLoop();
