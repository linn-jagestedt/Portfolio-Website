import createShader from "/js/utils/shader.js";
import Rect from "/js/utils/rect.js"
import { loadImage, createTextureFromImage, setTextureFilter } from "/js/utils/texture.js";
import { getRenderContext, getDrawingBufferSize, setDrawingBufferSize } from "/js/utils/renderContext.js";
import { Framebuffer } from "/js/utils/framebuffer.js";

const GL = getRenderContext();

const image = await loadImage("/textures/noise-free/t011.png");
const texture = createTextureFromImage(GL, image);

setDrawingBufferSize(image.width * 2, image.height * 2);
var drawingBufferSize = getDrawingBufferSize();

// Setup shaders

let simpleVS = await (await fetch('/shaders/simple.vert')).text();
let simpleFS = await (await fetch('/shaders/simple.frag')).text();

const SimpleShader = createShader(GL, simpleVS, simpleFS);

let scaledToScreenVS = await (await fetch('/shaders/scaled_to_screen.vert')).text();
let scaledToScreenFS = await (await fetch('/shaders/scaled_to_screen.frag')).text();

const ScaledToScreenShader = createShader(GL, scaledToScreenVS, scaledToScreenFS);

GL.useProgram(ScaledToScreenShader);
GL.uniform2f(GL.getUniformLocation(ScaledToScreenShader, "textureSize"), image.width, image.height);
GL.uniform2f(GL.getUniformLocation(ScaledToScreenShader, "drawingBufferSize"), drawingBufferSize.x, drawingBufferSize.y);

let rgbVS = await (await fetch('/shaders/rgb_combine.vert')).text();
let rgbFS = await (await fetch('/shaders/rgb_combine.frag')).text();

const rgbCombineShader = createShader(GL, rgbVS, rgbFS);

GL.useProgram(rgbCombineShader);
GL.uniform2f(GL.getUniformLocation(rgbCombineShader, "textureSize"), image.width, image.height);
GL.uniform2f(GL.getUniformLocation(rgbCombineShader, "drawingBufferSize"), drawingBufferSize.x, drawingBufferSize.y);
GL.uniform1i(GL.getUniformLocation(rgbCombineShader, "textureR"), 0);
GL.uniform1i(GL.getUniformLocation(rgbCombineShader, "textureG"), 1);
GL.uniform1i(GL.getUniformLocation(rgbCombineShader, "textureB"), 2);

var scale = [1, 1, 1];

var framebuffers = [];
var rects = [];

for (var i = 0; i < 3; i++) 
{
	framebuffers.push(
		new Framebuffer(
			GL, 
			{ x : image.width * scale[i], y : image.height * scale[i] }
		)
	);
	
	rects.push(
		new Rect(
			GL, 
			SimpleShader, 
			{ x : scale[i] * 0.5, y : -scale[i] * 0.5, z : 1 }, 
			{ x : scale[i] / 2.0 - 1.0, y : scale[i] / 2.0 - 1.0, z : 0 }
		)
	);
}

const rect1 = new Rect(GL, rgbCombineShader, { x : 0.5, y : 0.5, z : 1 },  { x : 0.5, y : 0, z : 0 });
const rect2 = new Rect(GL, ScaledToScreenShader, { x : 0.5, y : 0.5, z : 1 },  { x : -0.5, y : 0, z : 0 });

/* set up buttons */

const nearest_checkbox = document.querySelector('#nearest');
const linear_checkbox = document.querySelector('#linear');

nearest_checkbox.oninput = updateFilter;
linear_checkbox.oninput = updateFilter;

for (var i = 0; i < 3; i++) {
	setTextureFilter(
		GL, 
		framebuffers[i].texture, 
		nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR
	)
}

function updateFilter(event) {
	if (event.currentTarget.id == "nearest") {
		linear_checkbox.checked = !nearest_checkbox.checked;

	} else {
		nearest_checkbox.checked = !linear_checkbox.checked;
	}

	for (var i = 0; i < 3; i++) {
		setTextureFilter(
			GL, 
			framebuffers[i].texture, 
			nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR
		)
	}

	draw();
};

/* Set up sliders */

const sliders = document.querySelectorAll('#sliders input');
const sliderLabels = document.querySelectorAll('#sliders label span');

document.getElementById('file_size').innerText = calculateSize([1, 1, 1]);

sliders.forEach((slider) => {
	slider.oninput = updateSliders;
});

function updateSliders(event) {
	let values = [];
	
	sliders.forEach((slider, index) => {
		scale[index] = slider.value / 100;
		sliderLabels[index].innerText = scale[index];
	});
	
	document.getElementById('reduced_file_size').innerText = calculateSize(scale);

	for (var i = 0; i < 3; i++) {
		framebuffers[i].setSize({ x : image.width * scale[i], y : image.height * scale[i] });
		rects[i].setScale({ x : scale[i] * 0.5, y : -scale[i] * 0.5, z : 1 })
		rects[i].setPosition({ x : scale[i] / 2.0 - 1.0, y : scale[i] / 2.0 - 1.0, z : 0 });
	}

	draw();
}

updateSliders();

function calculateSize(values) {
	return Math.round(512 * 512 * (values[0] + values[1] + values[2]) / 1000);
}    

/* RenderContext */

function draw() {
	GL.activeTexture(GL.TEXTURE0);
	GL.bindTexture(GL.TEXTURE_2D, texture);

	rect2.draw();
	
	for (var i = 0; i < 3; i++) {
		framebuffers[i].bind();
		rects[i].draw();
		framebuffers[i].unbind();
	}
	
	for (var i = 0; i < 3; i++) {
		GL.activeTexture(GL.TEXTURE0 + i);
		GL.bindTexture(GL.TEXTURE_2D, framebuffers[i].texture);
	}

	rect1.draw();
}

addEventListener("resize", (event) => {
	drawingBufferSize = getDrawingBufferSize();
	GL.useProgram(SimpleShader);
	GL.uniform2f(GL.getUniformLocation(SimpleShader, "drawingBufferSize"), drawingBufferSize.x, drawingBufferSize.y);
	
	draw();
});