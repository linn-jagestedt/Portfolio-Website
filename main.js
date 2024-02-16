import createShader from "/shader.js";
import Rect from "/rect.js"
import { loadImage, pushImageData } from "/texture.js";
import createMaterix from "/matrix.js";

const GL = getRenderingContext();

const texture = GL.createTexture();
const image = await loadImage("/public/textures/t005.png");
pushImageData(GL, texture, image);

/* Rect 1 */

let vertexSource = await (await fetch('public/shaders/simple.vert')).text();
let fragmentSource = await (await fetch('public/shaders/simple.frag')).text();

const SimpleShader = createShader(GL, vertexSource, fragmentSource);
GL.useProgram(SimpleShader);
GL.uniformMatrix4fv(
	GL.getUniformLocation(SimpleShader, "modelView"), 
	true, 
	createMaterix(0.5, 0.5, 1, -0.5, 0, 0)
);

const rect1 = new Rect(GL, SimpleShader, texture);

/* Rect 2 */

vertexSource = await (await fetch('public/shaders/color_compression.vert')).text();
fragmentSource = await (await fetch('public/shaders/color_compression.frag')).text();

const CompressionShader = createShader(GL, vertexSource, fragmentSource);

GL.useProgram(CompressionShader);
GL.uniform2f(GL.getUniformLocation(CompressionShader, "textureSize"), 512, 512);
GL.uniform3f(GL.getUniformLocation(CompressionShader, "rgbScale"), 1, 1, 1);
GL.uniformMatrix4fv(
	GL.getUniformLocation(CompressionShader, "modelView"), 
	true, 
	createMaterix(0.5, 0.5, 1, 0.5, 0, 0)
);

const rect2 = new Rect(GL, CompressionShader, texture);

draw();

/* Set up sliders */

const sliders = document.querySelectorAll('#sliders input');
const sliderLabels = document.querySelectorAll('#sliders label span');

document.getElementById('file_size').innerText = calculateSize([1, 1, 1]);
updateSliders();

sliders.forEach((slider, index) => {
	slider.oninput = updateSliders;
});

function updateSliders(event) {
	let values = [];

	sliders.forEach((slider, index) => {
		values[index] = calculateSlide(slider.value);
		sliderLabels[index].innerText = calculateSlide(slider.value);
	});

	GL.useProgram(CompressionShader);
	GL.uniform3f(GL.getUniformLocation(CompressionShader, "rgbScale"), values[0], values[1], values[2]);
	document.getElementById('reduced_file_size').innerText = calculateSize(values);

	draw();
}

function calculateSlide(x) {
	return x == 100 ? 1 :  Math.round((2.05 - Math.log10(110 - x) / 1.01) * 100) / 100;
}

function calculateSize(values) {
	return Math.round(512 * 512 * (values[0] + values[1] + values[2]) / 1000);
}    

/* RenderContext */

function draw() {
	rect1.draw();
	rect2.draw();
}

addEventListener("resize", (event) => {
	let canvas = document.querySelector("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
	draw();
});

function getRenderingContext() 
{
	let canvas = document.querySelector("#glcanvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	let gl = canvas.getContext("webgl2");

	if (!gl) {
	  console.log("Failed. Your browser or device may not support WebGL.");
	  return null;
	}

	console.log(gl.getParameter(gl.SHADING_LANGUAGE_VERSION));

	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	return gl;
}