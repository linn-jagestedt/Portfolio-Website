import createShader from "/js/utils/shader.js";
import Rect from "/js/utils/rect.js"
import { loadImage, createTextureFromImage, transformImageData, setTextureFilter } from "/js/utils/texture.js";
import { GL, initRenderContext, getBufferSize, setBufferSize } from "/js/utils/renderContext.js";
import { createFrameBuffer,setFrameBufferSize, getFrameBufferTexture } from "/js/utils/framebuffer.js";
import { sliders, nearest_checkbox, linear_checkbox, sliderLabels, reduced_file_size } from "/js/rgb-compression/settings.js";

initRenderContext();

const image = await loadImage("/textures/noise-free/t001.png");

setBufferSize(image.width * 2, image.height * 2);

const texture = createTextureFromImage(image);

const ScaleToScreenShader = await createShader('/shaders/scaled_to_screen.vert', '/shaders/scaled_to_screen.frag');

GL.useProgram(ScaleToScreenShader);
GL.uniform2f(GL.getUniformLocation(ScaleToScreenShader, "textureSize"), image.width, image.height);

const RGBCombineShader = await createShader('/shaders/rgb_combine.vert', '/shaders/rgb_combine.frag');

GL.useProgram(RGBCombineShader);
GL.uniform2f(GL.getUniformLocation(RGBCombineShader, "textureSize"), image.width, image.height);
GL.uniform1i(GL.getUniformLocation(RGBCombineShader, "textureR"), 0);
GL.uniform1i(GL.getUniformLocation(RGBCombineShader, "textureG"), 1);
GL.uniform1i(GL.getUniformLocation(RGBCombineShader, "textureB"), 2);

const uncompressedImage = new Rect(ScaleToScreenShader, 0.5, 0.5, 1, -0.5, 0, 0);
const compressedImage = new Rect(RGBCombineShader, 0.5, 0.5, 1, 0.5, 0, 0);

const SimpleShader = await createShader('/shaders/simple.vert', '/shaders/simple.frag');

const scale = [sliders[0].value / 100, sliders[1].value / 100, sliders[2].value / 100];
const framebuffers = [];
const rects = [];

for (var i = 0; i < 3; i++) 
{	
	framebuffers.push(
		createFrameBuffer(
			image.width * scale[i], 
			image.height * scale[i]
		)
	);
	
	setTextureFilter(
		getFrameBufferTexture(framebuffers[i]), 
		nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR
	)

	rects.push(
		new Rect(
			SimpleShader, 
			scale[i] / 2, -scale[i] / 2, 1, 
			scale[i] / 2 - 1, scale[i] / 2 - 1, 0
		)
	);
}

addEventListener("resize", updateFrameBufferSize);

document.querySelector('input[name="filter"]:checked').value;

nearest_checkbox.oninput = updateFilter;
linear_checkbox.oninput = updateFilter;

sliders.forEach((slider) => {
	slider.oninput = updateSliders;
});

updateFrameBufferSize();
draw();

function draw() 
{
	GL.activeTexture(GL.TEXTURE0);
	GL.bindTexture(GL.TEXTURE_2D, texture);

	uncompressedImage.draw();

	GL.bindTexture(GL.TEXTURE_2D, texture);

	for (var i = 0; i < 3; i++) {
		GL.bindFramebuffer(GL.FRAMEBUFFER, framebuffers[i]);  
		rects[i].draw();
	}
	
	GL.bindFramebuffer(GL.FRAMEBUFFER, null);  

	for (var i = 0; i < 3; i++) {
		GL.activeTexture(GL.TEXTURE0 + i);
		let fbTex = getFrameBufferTexture(framebuffers[i]);
		GL.bindTexture(GL.TEXTURE_2D, fbTex);
	}

	compressedImage.draw();
}

function updateFrameBufferSize() {
	let bufferSize = getBufferSize();

	GL.useProgram(RGBCombineShader);
	GL.uniform2f(GL.getUniformLocation(RGBCombineShader, "bufferSize"), bufferSize.x, bufferSize.y);
	
	GL.useProgram(ScaleToScreenShader);
	GL.uniform2f(GL.getUniformLocation(ScaleToScreenShader, "bufferSize"), bufferSize.x, bufferSize.y);
	
	draw();
}

function updateFilter(event) 
{
	for (var i = 0; i < 3; i++) {
		setTextureFilter(
			getFrameBufferTexture(framebuffers[i]), 
			nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR
		)
	}

	draw();
};

function updateSliders() {	
	const scale = [];

	sliders.forEach((slider, index) => {
		scale[index] = slider.value / 100;
		sliderLabels[index].innerText = scale[index];
	});
	
	reduced_file_size.innerText = calculateSize(scale);

	for (var i = 0; i < 3; i++) {
		setFrameBufferSize(framebuffers[i], image.width * scale[i], image.height * scale[i]);
		rects[i].setScale(scale[i] / 2, -scale[i] / 2, 1)
		rects[i].setPosition(scale[i] / 2 - 1, scale[i] / 2 - 1, 0);
	}

	draw();
}

function calculateSize(values) {
	return Math.round(512 * 512 * (values[0] + values[1] + values[2]) / 1000);
}    