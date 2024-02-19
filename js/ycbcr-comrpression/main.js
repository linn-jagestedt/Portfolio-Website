import createShader from "/js/utils/shader.js";
import Rect from "/js/utils/rect.js"
import { loadImage, createTextureFromImage, transformImageData, setTextureFilter } from "/js/utils/texture.js";
import { GL, initRenderContext, getBufferSize, setBufferSize } from "/js/utils/renderContext.js";
import { createFrameBuffer,setFrameBufferSize, getFrameBufferTexture } from "/js/utils/framebuffer.js";
import { sliders, nearest_checkbox, linear_checkbox, sliderLabels, reduced_file_size } from "/js/ycbcr-compression/settings.js";

initRenderContext();

const image = await loadImage("/textures/noise-free/t001.png");

const YCbCrTransform = [
	 0.299,  0.587,  0.114,
	-0.169, -0.331,  0.500,
	 0.500, -0.419, -0.081,
];

const YCbCrImage = await transformImageData(image, (data) => {
		return new Uint8ClampedArray([
			data[0] * YCbCrTransform[0] + data[1] * YCbCrTransform[1] + data[2] * YCbCrTransform[2],
			128 + data[0] * YCbCrTransform[3] + data[1] * YCbCrTransform[4] + data[2] * YCbCrTransform[5],
			128 + data[0] * YCbCrTransform[6] + data[1] * YCbCrTransform[7] + data[2] * YCbCrTransform[8]
		]);
	}
);

setBufferSize(image.width * 2, image.height * 2);

const texture = createTextureFromImage(image);
const YCbCrTexture = createTextureFromImage(YCbCrImage); 

const ScaleToScreenShader = await createShader('/shaders/scaled_to_screen.vert', '/shaders/scaled_to_screen.frag');

GL.useProgram(ScaleToScreenShader);
GL.uniform2f(GL.getUniformLocation(ScaleToScreenShader, "textureSize"), image.width, image.height);

const YCbCrCombineShader = await createShader('/shaders/ycbcr_combine.vert', '/shaders/ycbcr_combine.frag');

GL.useProgram(YCbCrCombineShader);
GL.uniform2f(GL.getUniformLocation(YCbCrCombineShader, "textureSize"), image.width, image.height);
GL.uniform1i(GL.getUniformLocation(YCbCrCombineShader, "textureY"), 0);
GL.uniform1i(GL.getUniformLocation(YCbCrCombineShader, "textureCb"), 1);
GL.uniform1i(GL.getUniformLocation(YCbCrCombineShader, "textureCr"), 2);

const uncompressedImage = new Rect(ScaleToScreenShader, 0.5, 0.5, 1, -0.5, 0, 0);
const compressedImage = new Rect(YCbCrCombineShader, 0.5, 0.5, 1, 0.5, 0, 0);

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

	GL.bindTexture(GL.TEXTURE_2D, YCbCrTexture);

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

	GL.useProgram(YCbCrCombineShader);
	GL.uniform2f(GL.getUniformLocation(YCbCrCombineShader, "bufferSize"), bufferSize.x, bufferSize.y);
	
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