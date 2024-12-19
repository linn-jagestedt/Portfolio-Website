import createShader from "../utils/shader.js";
import Rect from "../utils/rect.js"
import { uploadImageData, loadImageFromSrc, createTextureFromImage, setTextureFilter } from "../utils/texture.js";
import { GL, initRenderContext, setRenderBufferSize } from "../utils/renderContext.js";
import { createFrameBuffer,setFrameBufferSize, getFrameBufferTexture } from "../utils/framebuffer.js";
import { nearest_checkbox, linear_checkbox, sliderY, sliderCb, sliderCr, reduced_file_size, file_size, image_file } from "../ycbcr-compression/settings.js";

nearest_checkbox.oninput = updateFilter;
linear_checkbox.oninput = updateFilter;

const labelY = sliderY.labels[0];
const labelCb = sliderCb.labels[0];
const labelCr = sliderCr.labels[0];

updateSliderText(sliderY, labelY);
updateSliderText(sliderCb, labelCb);
updateSliderText(sliderCr, labelCr);

let image = await loadImageFromSrc(document.querySelector("#image").src);

initRenderContext(image.width, image.height); 

const YCbCrTexture = createTextureFromImage(image);

updateFileSize();

const RGBToYCBCRVert = await (await fetch(document.querySelector("#rgb-to-ycbcr-vert").src)).text();
const RGBToYCBCRFrag = await (await fetch(document.querySelector("#rgb-to-ycbcr-frag").src)).text();
const YCbCrCombineVert = await (await fetch(document.querySelector("#ycbcr-combine-vert").src)).text();
const YCbCrCombineFrag = await (await fetch(document.querySelector("#ycbcr-combine-frag").src)).text();

const RGBToYCBCRShader = await createShader(RGBToYCBCRVert, RGBToYCBCRFrag);
const YCbCrCombineShader = await createShader(YCbCrCombineVert, YCbCrCombineFrag);

GL.useProgram(YCbCrCombineShader);
GL.uniform1i(GL.getUniformLocation(YCbCrCombineShader, "textureY"), 0);
GL.uniform1i(GL.getUniformLocation(YCbCrCombineShader, "textureCb"), 1);
GL.uniform1i(GL.getUniformLocation(YCbCrCombineShader, "textureCr"), 2);

const compressedImage = new Rect(YCbCrCombineShader, 1, 1, 1, 0, 0, 0);

let scaleY = sliderY.value / 100;
let scaleCb = sliderCb.value / 100;
let scaleCr = sliderCr.value / 100;

const framebufferY = createFrameBuffer(image.width * scaleY, image.height * scaleY);
const framebufferCb = createFrameBuffer(image.width * scaleCb, image.height * scaleCb);
const framebufferCr = createFrameBuffer(image.width * scaleCr, image.height * scaleCr);

const framebufferTexY = getFrameBufferTexture(framebufferY);
const framebufferTexCb = getFrameBufferTexture(framebufferCb);
const framebufferTexCr = getFrameBufferTexture(framebufferCr);

const rectY = new Rect(RGBToYCBCRShader, scaleY, -scaleY, 1, scaleY - 1, scaleY - 1, 0)
const rectCb = new Rect(RGBToYCBCRShader, scaleCb, -scaleCb, 1, scaleCb - 1, scaleCb - 1, 0)
const rectCr = new Rect(RGBToYCBCRShader, scaleCr, -scaleCr, 1, scaleCr - 1, scaleCr - 1, 0)

setTextureFilter(framebufferTexY, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);
setTextureFilter(framebufferTexCb, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);
setTextureFilter(framebufferTexCr, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);

draw();

sliderY.oninput = () => {
	updateSliderText(sliderY, labelY);
	updateFrameBufferSize(sliderY, framebufferY, rectY);
	updateFileSize();
	draw();
};

sliderCb.oninput = () => {
	updateSliderText(sliderCb, labelCb);
	updateFrameBufferSize(sliderCb, framebufferCb, rectCb);
	updateFileSize();
	draw();
};

sliderCr.oninput = () => {
	updateSliderText(sliderCr, labelCr);
	updateFrameBufferSize(sliderCr, framebufferCr, rectCr);
	updateFileSize();
	draw();
};

image_file.oninput = updateImage;

function updateSliderText(slider, label) 
{
	label.innerText = label.innerText.split(":")[0] + ": " + (slider.value / 100);
}

function updateFrameBufferSize(slider, framebuffer, rect) 
{	
	let scale = slider.value / 100;

	setFrameBufferSize(framebuffer, image.width * scale, image.height * scale);

	rect.setScale(scale, -scale, 1);
	rect.setPosition(scale - 1, scale - 1, 1);
}

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

function updateFilter() 
{
	setTextureFilter(framebufferTexY, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);
	setTextureFilter(framebufferTexCb, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);
	setTextureFilter(framebufferTexCr, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);

	draw();
};

async function updateImage(event) {
	let url =  URL.createObjectURL(event.currentTarget.files[0]);
	document.querySelector("#image").src = url;
	
	image = await loadImageFromSrc(url);
	
	uploadImageData(YCbCrTexture, image); 
	setRenderBufferSize(image.width, image.height);
	
	updateFrameBufferSize(sliderY, framebufferY, rectY);
	updateFrameBufferSize(sliderCb, framebufferCb, rectCb);
	updateFrameBufferSize(sliderCr, framebufferCr, rectCr);

	compressedImage.setScale(1, image.height / image.width, 1);
	updateFileSize();
	
	draw();
}

function draw() 
{
	GL.activeTexture(GL.TEXTURE0);
	GL.bindTexture(GL.TEXTURE_2D, YCbCrTexture);

	GL.bindFramebuffer(GL.FRAMEBUFFER, framebufferY);  
	rectY.draw();

	GL.bindFramebuffer(GL.FRAMEBUFFER, framebufferCb);  
	rectCb.draw();
	
	GL.bindFramebuffer(GL.FRAMEBUFFER, framebufferCr);  
	rectCr.draw();

	GL.bindFramebuffer(GL.FRAMEBUFFER, null);  

	GL.activeTexture(GL.TEXTURE0);
	GL.bindTexture(GL.TEXTURE_2D, framebufferTexY);
	GL.activeTexture(GL.TEXTURE1);
	GL.bindTexture(GL.TEXTURE_2D, framebufferTexCb);
	GL.activeTexture(GL.TEXTURE2);
	GL.bindTexture(GL.TEXTURE_2D, framebufferTexCr);

	compressedImage.draw();
}