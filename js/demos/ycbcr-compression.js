import createShader from "../utils/shader.js";
import Rect from "../utils/rect.js"
import { uploadImageData, loadImageFromSrc, createTextureFromImage, setTextureFilter } from "../utils/texture.js";
import { createFrameBuffer, setFrameBufferSize, getFrameBufferTexture } from "../utils/framebuffer.js";
import { create4x2Matrix } from "../utils/matrix.js";
import Shader from "../utils/shader.js";

let image = await loadImageFromSrc(document.querySelector("#image").src);

const YCbCrCombineFrag = await (await fetch(document.querySelector("#ycbcr-combine-frag").src)).text();
const YCbCrCombineVert = await (await fetch(document.querySelector("#ycbcr-combine-vert").src)).text();

const RGBToYCBCRVert = await (await fetch(document.querySelector("#rgb-to-ycbcr-vert").src)).text();
const RGBToYCBCRFrag = await (await fetch(document.querySelector("#rgb-to-ycbcr-frag").src)).text();

const canvas = document.querySelector("#glcanvas");
const GL = canvas.getContext("webgl2");

canvas.width = image.height;
canvas.height = image.height;

GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
GL.clearColor(0.135, 0.135, 0.135, 1.0);
GL.clear(GL.COLOR_BUFFER_BIT);

GL.enable(GL.BLEND)
GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA)

const rect = new Rect();

const RGBToYCBCRShader = new Shader(RGBToYCBCRVert, RGBToYCBCRFrag);
const YCbCrCombineShader = new Shader(YCbCrCombineVert, YCbCrCombineFrag);

GL.useProgram(YCbCrCombineShader.program);

GL.uniform1i(YCbCrCombineShader.getUniformLocation("textureY"), 0);
GL.uniform1i(YCbCrCombineShader.getUniformLocation("textureCb"), 1);
GL.uniform1i(YCbCrCombineShader.getUniformLocation("textureCr"), 2);

GL.uniformMatrix4x2fv(
	YCbCrCombineShader.getUniformLocation("modelView"), 
	false, 
	create4x2Matrix(
		0, 0,
		1, 1,
	),
	0
);

const sliderY = document.querySelector('#y_scale');
const sliderCb = document.querySelector('#cb_scale');
const sliderCr = document.querySelector('#cr_scale');

const labelY = sliderY.labels[0];
const labelCb = sliderCb.labels[0];
const labelCr = sliderCr.labels[0];

let scaleY = (sliderY.value / 100);
let scaleCb = (sliderCb.value / 100);
let scaleCr = (sliderCr.value / 100);

labelY.innerText = labelY.innerText.split(":")[0] + ": " + scaleY;
labelCb.innerText = labelCb.innerText.split(":")[0] + ": " + scaleCb;
labelCr.innerText = labelCr.innerText.split(":")[0] + ": " + scaleCr;

const YCbCrTexture = createTextureFromImage(image); 

const framebufferY = createFrameBuffer(image.width * scaleY, image.height * scaleY);
const framebufferCb = createFrameBuffer(image.width * scaleCb, image.height * scaleCb);
const framebufferCr = createFrameBuffer(image.width * scaleCr, image.height * scaleCr);

const framebufferTexY = getFrameBufferTexture(framebufferY);
const framebufferTexCb = getFrameBufferTexture(framebufferCb);
const framebufferTexCr = getFrameBufferTexture(framebufferCr);

sliderY.oninput = () => {
	scaleY = sliderY.value / 100;
	labelY.innerText = labelY.innerText.split(":")[0] + ": " + scaleY;
	setFrameBufferSize(framebufferY, image.width * scaleY, image.height * scaleY);
	updateFileSize();
	draw();
};

sliderCb.oninput = () => {
	scaleCb = sliderCb.value / 100;
	labelCb.innerText = labelCb.innerText.split(":")[0] + ": " + scaleCb;
	setFrameBufferSize(framebufferCb, image.width * scaleCb, image.height * scaleCb);
	updateFileSize();
	draw();
};

sliderCr.oninput = () => {
	scaleCr = sliderCr.value / 100;
	labelCr.innerText = labelCr.innerText.split(":")[0] + ": " + scaleCr;
	setFrameBufferSize(framebufferCr, image.width * scaleCr, image.height * scaleCr);
	updateFileSize();
	draw();
};

const nearest_checkbox = document.querySelector('#nearest');
const linear_checkbox = document.querySelector('#linear');

nearest_checkbox.oninput = updateFilter;
linear_checkbox.oninput = updateFilter;

updateFilter();

function updateFilter() {
	setTextureFilter(framebufferTexY, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);
	setTextureFilter(framebufferTexCb, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);
	setTextureFilter(framebufferTexCr, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);

	draw();
};

const image_file = document.querySelector("#imageFile");
image_file.oninput = updateImage;

async function updateImage(event) {
	let url =  URL.createObjectURL(event.currentTarget.files[0]);
	document.querySelector("#image").src = url;
	
	image = await loadImageFromSrc(url);
	
	uploadImageData(YCbCrTexture, image); 

	canvas.width = image.width;
	canvas.height = image.width;

	GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);

	setFrameBufferSize(framebufferY, image.width * scaleY, image.height * scaleY);
	setFrameBufferSize(framebufferCb, image.width * scaleCb, image.height * scaleCb);
	setFrameBufferSize(framebufferCr, image.width * scaleCr, image.height * scaleCr);

	GL.useProgram(YCbCrCombineShader.program);

	GL.uniformMatrix4x2fv(
		YCbCrCombineShader.getUniformLocation("modelView"), 
		false, 
		create4x2Matrix(
			0, 0,
			1, image.height / image.width,
		),
		0
	);

	updateFileSize();
	
	draw();
}


const file_size = document.querySelector('#file_size');
const reduced_file_size = document.querySelector('#reduced_file_size');

updateFileSize();

function updateFileSize() {
	let size = image.width * image.height / 1000;
	let factor = sliderY.value / 100 + sliderCb.value / 100 + sliderCr.value / 100;

	if (size > 1000) {
		reduced_file_size.innerText = Math.round(size * factor / 10) / 100 + "MB";
		file_size.innerText =  Math.round(size * 3 / 10) / 100 + "MB";
	} else {
		reduced_file_size.innerText = Math.round(size * factor) + "KB";
		file_size.innerText =  Math.round(size * 3) + "KB";
	}
}

function draw() 
{
	GL.activeTexture(GL.TEXTURE0);
	GL.bindTexture(GL.TEXTURE_2D, YCbCrTexture);

	GL.useProgram(RGBToYCBCRShader.program);
	
	GL.bindFramebuffer(GL.FRAMEBUFFER, framebufferY);  	

	GL.uniformMatrix4x2fv(
		RGBToYCBCRShader.getUniformLocation("modelView"), 
		false, 
		create4x2Matrix(
			scaleY - 1, scaleY - 1,
			scaleY, -scaleY,
		),
		0
	);

	rect.draw();

	
	GL.bindFramebuffer(GL.FRAMEBUFFER, framebufferCb);  	

	GL.uniformMatrix4x2fv(
		RGBToYCBCRShader.getUniformLocation("modelView"), 
		false, 
		create4x2Matrix(
			scaleCb - 1, scaleCb - 1,
			scaleCb, -scaleCb,
		),
		0
	);

	rect.draw();

	GL.bindFramebuffer(GL.FRAMEBUFFER, framebufferCr);  	

	GL.uniformMatrix4x2fv(
		RGBToYCBCRShader.getUniformLocation("modelView"), 
		false, 
		create4x2Matrix(
			scaleCr - 1, scaleCr - 1,
			scaleCr, -scaleCr,
		),
		0
	);

	rect.draw();

	GL.useProgram(YCbCrCombineShader.program);

	GL.bindFramebuffer(GL.FRAMEBUFFER, null);  

	GL.activeTexture(GL.TEXTURE0);
	GL.bindTexture(GL.TEXTURE_2D, framebufferTexY);
	GL.activeTexture(GL.TEXTURE1);
	GL.bindTexture(GL.TEXTURE_2D, framebufferTexCb);
	GL.activeTexture(GL.TEXTURE2);
	GL.bindTexture(GL.TEXTURE_2D, framebufferTexCr);

	rect.draw();
}

draw();