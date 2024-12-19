import createShader from "../utils/shader.js"
import { createMatrix2D, createMatrix2Drotation } from "../utils/matrix.js"
import RectInstanced from "../utils/rectInstanced.js"
import Rect from "../utils/rect.js"
import { fastCos, fastSin } from "../utils/trigonometry.js";

const rowsInput = document.getElementById("rows");
const colsInput = document.getElementById("cols");

const springForceInput = document.getElementById("springForce");
const dampingInput = document.getElementById("damping");
const maxSpringLengthInput = document.getElementById("maxSpringLength");
const updatesPerFrameInput = document.getElementById("updatesPerFrame");

const toggleInput = document.getElementById("toggle-simulation");

let rows = parseInt(rowsInput.value);
let cols = parseInt(colsInput.value);

let springForce = 200 * parseFloat(springForceInput.value);
let damping = 20 * parseFloat(dampingInput.value);

let maxSpringLength = parseFloat(maxSpringLengthInput.value);

let updatesPerFrame = parseInt(updatesPerFrameInput.value);

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
    springForce = 200 * parseFloat(e.target.value);
    springForceInput.labels[0].innerText = "Spring Force: " + parseFloat(e.target.value).toFixed(2);
}

dampingInput.oninput = (e) => {
    damping = 20 * parseFloat(e.target.value);
    dampingInput.labels[0].innerText = "Damping: " + parseFloat(e.target.value).toFixed(2);
}

maxSpringLengthInput.oninput = (e) => {
    maxSpringLength = parseFloat(e.target.value);
    maxLength = maxSpringLength * step;
    maxSpringLengthInput.labels[0].innerText = "Max Spring Length: " + parseFloat(e.target.value).toFixed(2);
}

updatesPerFrameInput.oninput = (e) => {
    updatesPerFrame = parseInt(e.target.value);
    updatesPerFrameInput.labels[0].innerText = "Physics updates per frame: " + parseInt(e.target.value);
}

toggleInput.onclick = (e) => {
    isRunning = !isRunning;
    toggleInput.innerText = isRunning ? "Stop Simulation" : "Start Simulation";
    physicsLoop();
};

const mass = 1;
const timeStep = 0.016;

let nodeRadius = 0;
let lineWidth = 0;

let step = 0;
let maxLength = 0;

let nodes = [];
let lines = [];

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
    nodes = [];
    lines = new Array((rows - 1) * cols + (cols - 1) * rows);

    for (let i = 0; i < lines.length; i++) 
    {        
        lines[i] = {
            position: [0, 0],
            scale: [0, 0],
            angle: 0
        };
    }

    step = (2 - 0.5) / ((cols > rows ? cols : rows) - 1);
    maxLength = maxSpringLength * step;

    nodeRadius = 0.7 / (rows + cols);
    lineWidth = 0.15 / (rows + cols);

    for (let i = 0; i < rows; i++) 
    {
        for (let j = 0; j < cols; j++) 
        {
            nodes.push({
                position: [
                    (-1 + 0.25 + (cols < rows ? (rows - cols) * step * 0.5 : 0)) + step * j, 
                    (-1 + 0.25 + (rows < cols ? (cols - rows) * step * 0.5 : 0)) + step * i
                ],
                lastPosition: [
                    (-1 + 0.25 + (cols < rows ? (rows - cols) * step * 0.5 : 0)) + step * j, 
                    (-1 + 0.25 + (rows < cols ? (cols - rows) * step * 0.5 : 0)) + step * i
                ],
                delta: [0, 0],                
                velocity: [0, 0],
                force: [0, 0],
                row: i,
                col: j,
                links: [],
                linksRender: []
            });
        }
    } 

    for (let i = 0; i < rows; i++) 
    {
        for (let j = 0; j < cols; j++) 
        {
            const links = [];
            const linksRender = [];

            if (j < cols - 1) {
                links.push(nodes[(i * cols) + j + 1]);
                linksRender.push(nodes[(i * cols) + j + 1]);
            }

            if (i < rows - 1) {
                links.push(nodes[((i + 1) * cols) + j]);
                linksRender.push(nodes[((i + 1) * cols) + j]);
            }

            if (j > 0) {
                links.push(nodes[(i * cols) + j - 1]);
            }

            if (i > 0) {
                links.push(nodes[((i - 1) * cols) + j]);
            }

            nodes[(i * cols) + j].links = links;
            nodes[(i * cols) + j].linksRender = linksRender;
        }
    }
}

function physicsLoop() 
{
    if (!isRunning) return;

    for (let i = 0; i < updatesPerFrame; i++) {   
        physicsUpdate();    
    }

    requestAnimationFrame(physicsLoop);
}

function renderLoop() 
{
    updateLineData();
    drawLines();
    drawCircles();
    drawCursor();

    requestAnimationFrame(renderLoop);
}

function mouseLoop() 
{
    if (mouseDelta[0] != 0 || mouseDelta[1] != 0) 
    {
        const selectedNodesLength = selectedNodes.length;
        const nodesLength = nodes.length;
 
        for (let i = 0; i < selectedNodesLength; i++) 
        {
            const node = selectedNodes[i];

            node.position[0] += mouseDelta[0];
            node.position[1] += mouseDelta[1];
            node.lastPosition[0] += mouseDelta[0];
            node.lastPosition[1] += mouseDelta[1];
        }

        for (let i = 0; i < nodesLength; i++) 
        {
            limitSpringLength(nodes[i]);
        }
    
        for (let i = nodesLength - 1; i > 0; i--) 
        {
            limitSpringLength(nodes[i]);
        }
        
        mouseDelta[0] = 0;
        mouseDelta[1] = 0;
    }

    requestAnimationFrame(mouseLoop);
}

const frametimeText = document.getElementById("frametime");

const frametimeList = new Array(20);
let frameTimeIndex = 0;

let startTime = Date.now();

function frameTimeLoop() 
{
    if (frameTimeIndex < frametimeList.length) 
    {   
        frametimeList[frameTimeIndex] = (Date.now() - startTime);
        startTime = Date.now();
    } 
    else 
    {
        frametimeText.innerText = (frametimeList.reduce((partialSum, a) => partialSum + a, 0) / frametimeList.length).toFixed(1);
        frameTimeIndex = 0;
        frametimeList.fill(0);
    }

    frameTimeIndex++;
    
    requestAnimationFrame(frameTimeLoop);
}

/*
 * Physics 
 */

const currentPos = [0, 0];

function physicsUpdate() 
{
    const nodesLength = nodes.length;

    for (let i = 0; i < nodesLength; i++) 
    {
        const node = nodes[i];

        if (!selectedNodes.includes(node)) 
        {
            currentPos[0] = node.position[0];
            currentPos[1] = node.position[1];

            node.delta[0] = node.position[0] - node.lastPosition[0];
            node.delta[1] = node.position[1] - node.lastPosition[1];

            //updateVelocityEuler(node);
            //updatePositionEuler(node);

            updateVelocityVerlet(node);
            updatePositionVerlet(node);

            updateForces(node);
    
            node.lastPosition[0] = currentPos[0];
            node.lastPosition[1] = currentPos[1];
        }
    }
}

// Smaller timesteps produce more stable results
const timeStepMultiplier = 0.5;

const actualTimeStep = timeStepMultiplier * timeStep;

function updatePositionEuler(node) 
{ 
    node.position[0] += actualTimeStep * node.velocity[0];
    node.position[1] += actualTimeStep * node.velocity[1];
}

const MassInverse = 1.0 / mass;

function updateVelocityEuler(node) 
{
    node.velocity[0] += actualTimeStep * (node.force[0] * MassInverse);
    node.velocity[1] += actualTimeStep * (node.force[1] * MassInverse);
}

const timeStepSquaredTimesMassInverse = actualTimeStep * actualTimeStep * (1.0 / mass);

function updatePositionVerlet(node) 
{         
    node.position[0] += node.delta[0] + node.force[0] * timeStepSquaredTimesMassInverse,
    node.position[1] += node.delta[1] + node.force[1] * timeStepSquaredTimesMassInverse
}

const twoTimestimeStepInverse = (1 / (2 * actualTimeStep));

function updateVelocityVerlet(node) 
{         
    node.velocity[0] = twoTimestimeStepInverse * node.delta[0];
    node.velocity[1] = twoTimestimeStepInverse * node.delta[1];
}

const diff = [0, 0];
const sum = [0, 0];
const len = [0, 0];

function updateForces(sourceNode) 
{
    sum[0] = 0;
    sum[1] = 0;

    const nodeLinksLength = sourceNode.links.length;

    for (let i = 0; i < nodeLinksLength; i++) 
    {
        const targetNode = sourceNode.links[i];

        len[0] = step * Math.abs(targetNode.col - sourceNode.col);
        len[1] = step * Math.abs(targetNode.row - sourceNode.row);

        // Calculate spring force

        diff[0] = sourceNode.position[0] - targetNode.position[0];
        diff[1] = sourceNode.position[1] - targetNode.position[1];
    
        sum[0] += -springForce * (Math.abs(diff[0]) - len[0]) * Math.sign(diff[0]);
        sum[1] += -springForce * (Math.abs(diff[1]) - len[1]) * Math.sign(diff[1]);

        // Calculate damping force

        sum[0] += -damping * (sourceNode.velocity[0] - targetNode.velocity[0]);
        sum[1] += -damping * (sourceNode.velocity[1] - targetNode.velocity[1]);
    }  

    sourceNode.force[0] = sum[0];
    sourceNode.force[1] = sum[1];
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

const INSTANCES_PER_DRAWCALL = 200;

const matrixArray = new Float32Array(INSTANCES_PER_DRAWCALL * 16);

function drawCircles() 
{
    const nodesLength = nodes.length;
    const drawcalls = Math.ceil(nodesLength / INSTANCES_PER_DRAWCALL);

    const scale = [nodeRadius, nodeRadius];

    for (let drawcall = 0; drawcall < drawcalls; drawcall++) 
    {
        matrixArray.fill(0);

        const offset = drawcall * INSTANCES_PER_DRAWCALL;

        for (let index = 0; index < INSTANCES_PER_DRAWCALL && offset + index < nodesLength; index++) 
        {
            const node = nodes[offset + index];

            const matrix = createMatrix2D(
                node.position,
                scale                
            );

            matrixArray.set(matrix, index * 16);
        }

        circleVAO.draw(matrixArray, INSTANCES_PER_DRAWCALL);
    }
}

function drawLines() 
{
    const linesLength = lines.length;
    const drawcalls = Math.ceil(linesLength / INSTANCES_PER_DRAWCALL)

    for (let drawcall = 0; drawcall < drawcalls; drawcall++) 
    {
        matrixArray.fill(0);

        const offset = drawcall * INSTANCES_PER_DRAWCALL;

        for (let index = 0; index < INSTANCES_PER_DRAWCALL && offset + index < linesLength; index++) 
        {
            const line = lines[offset + index];

            const matrix = createMatrix2Drotation(
                line.position,
                line.scale,
                line.angle
            );

            matrixArray.set(matrix, index * 16);
        }

        lineVAO.draw(matrixArray, INSTANCES_PER_DRAWCALL);
    }
}

function drawCursor() 
{
    cursorVAO.draw();
}

function updateLineData() 
{    
    let index = 0;

    const nodesLength = nodes.length;

    for (let i = 0; i < nodesLength; i++) 
    {
        const sourceNode = nodes[i];
        const linksRenderLength = sourceNode.linksRender.length;

        for (let j = 0; j < linksRenderLength; j++, index++) 
        {
            const targetNode = sourceNode.linksRender[j];

            diff[0] = targetNode.position[0] - sourceNode.position[0];
            diff[1] = targetNode.position[1] - sourceNode.position[1];
        
            const line = lines[index];
            
            line.position[0] = sourceNode.position[0] + 0.5 * diff[0];
            line.position[1] = sourceNode.position[1] + 0.5 * diff[1];

            const length = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);

            line.scale[0] = length * 0.5;
            line.scale[1] = lineWidth * Math.min(Math.max(step / length, 0), 1);

            line.angle = -Math.atan(diff[1] / diff[0]);
        }
    }
}

/*
 * Mouse events
 */

let cursorRadius = 0.1;
let selectedNodes = [];

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

const mouseDiff = [0, 0];

canvas.addEventListener("mousedown", (e) => 
{
    const mouse = getMousePos(e);

    const nodesLength = nodes.length;

    for (let i = 0; i < nodesLength; i++) 
    {
        const node = nodes[i];

        mouseDiff[0] = mouse[0] - node.position[0];
        mouseDiff[1] = mouse[1] - node.position[1];

        const distance = Math.sqrt(mouseDiff[0] * mouseDiff[0] + mouseDiff[1] * mouseDiff[1])

        if (distance < nodeRadius + cursorRadius) {
            selectedNodes.push(node);
        }
    } 
});

const mouseDelta = [0, 0];
const cursorScale = [cursorRadius, cursorRadius];

document.addEventListener("mousemove", (e) => 
{
    const mouse = getMousePos(e);

    cursorVAO.setModelView(
        createMatrix2D(
            mouse,
            cursorScale
        )
    );

    if (selectedNodes.length > 0) 
    {
        const delta = getMouseDelta(e);

        mouseDelta[0] += delta[0];
        mouseDelta[1] += delta[1];
    } 
    else
    {
        mouseDelta[0] = 0;
        mouseDelta[1] = 0;
    }
});

document.addEventListener("wheel", (e) => 
{
    cursorRadius += -0.001 * e.deltaY;

    if (cursorRadius > 0.5) cursorRadius = 0.5;
    if (cursorRadius < 0.01) cursorRadius = 0.01;

    cursorScale[0] = cursorRadius;
    cursorScale[1] = cursorRadius;

    const mouse = getMousePos(e);

    cursorVAO.setModelView(
        createMatrix2D(
            mouse,
            cursorScale
        )
    );
});

canvas.addEventListener("mouseleave", (e) => selectedNodes = []);
canvas.addEventListener("mouseup", (e) => selectedNodes = []);

function limitSpringLength(node) 
{
    const nodeLinksLength = node.links.length;

    for (let i = 0; i < nodeLinksLength; i++) 
    {
        const targetNode = node.links[i];

        diff[0] = targetNode.position[0] - node.position[0];
        diff[1] = targetNode.position[1] - node.position[1];
    
        const distance = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
    
        if (distance > maxLength && !selectedNodes.includes(targetNode))   
        {
            const angle = Math.atan2(diff[1], diff[0]);   
            const length = distance - maxLength;

            targetNode.position[0] -= fastCos(angle) * length;
            targetNode.position[1] -= fastSin(angle) * length; 
            targetNode.lastPosition[0] -= fastCos(angle) * length;
            targetNode.lastPosition[1] -= fastSin(angle) * length;
        }
    }
}

initialize();
renderLoop();
mouseLoop();
frameTimeLoop();
