import createShader from "/js/utils/shader.js";
import Rect from "/js/utils/rect.js"
import { uploadImageData, loadImageFromSrc, createTextureFromImage, setTextureFilter } from "/js/utils/texture.js";
import { GL, initRenderContext, setRenderBufferSize } from "/js/utils/renderContext.js";
import { createFrameBuffer,setFrameBufferSize, getFrameBufferTexture } from "/js/utils/framebuffer.js";
import { nearest_checkbox, linear_checkbox, sliderR, sliderG, sliderB, reduced_file_size, file_size, image_file } from "/js/rgb-compression/settings.js";

nearest_checkbox.oninput = updateFilter;
linear_checkbox.oninput = updateFilter;

const labelR = sliderR.labels[0];
const labelG = sliderG.labels[0];
const labelB = sliderB.labels[0];

updateSliderText(sliderR, labelR);
updateSliderText(sliderG, labelG);
updateSliderText(sliderB, labelB);

let image = await loadImageFromSrc(document.querySelector("#image").src);

initRenderContext(image.width, image.height); 

const Texture = createTextureFromImage(image);

updateFileSize();

const SimpleShader = await createShader('/shaders/simple.vert', '/shaders/simple.frag');
const RGBCombineShader = await createShader('/shaders/rgb_combine.vert', '/shaders/rgb_combine.frag');

GL.useProgram(RGBCombineShader);
GL.uniform1i(GL.getUniformLocation(RGBCombineShader, "textureR"), 0);
GL.uniform1i(GL.getUniformLocation(RGBCombineShader, "textureG"), 1);
GL.uniform1i(GL.getUniformLocation(RGBCombineShader, "textureB"), 2);

const compressedImage = new Rect(RGBCombineShader, 1, 1, 1, 0, 0, 0);

let scaleR = sliderR.value / 100;
let scaleG = sliderG.value / 100;
let scaleB = sliderB.value / 100;

const framebufferR = createFrameBuffer(image.width * scaleR, image.height * scaleR);
const framebufferG = createFrameBuffer(image.width * scaleG, image.height * scaleG);
const framebufferB = createFrameBuffer(image.width * scaleB, image.height * scaleB);

const framebufferTexR = getFrameBufferTexture(framebufferR);
const framebufferTexG = getFrameBufferTexture(framebufferG);
const framebufferTexB = getFrameBufferTexture(framebufferB);

const rectR = new Rect(SimpleShader, scaleR, -scaleR, 1, scaleR - 1, scaleR - 1, 0)
const rectG = new Rect(SimpleShader, scaleG, -scaleG, 1, scaleG - 1, scaleG - 1, 0)
const rectB = new Rect(SimpleShader, scaleB, -scaleB, 1, scaleB - 1, scaleB - 1, 0)

setTextureFilter(framebufferTexR, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);
setTextureFilter(framebufferTexG, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);
setTextureFilter(framebufferTexB, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);

draw();

sliderR.oninput = () => {
	updateSliderText(sliderR, labelR);
	updateFrameBufferSize(sliderR, framebufferR, rectR);
	updateFileSize();
	draw();
};

sliderG.oninput = () => {
	updateSliderText(sliderG, labelG);
	updateFrameBufferSize(sliderG, framebufferG, rectG);
	updateFileSize();
	draw();
};

sliderB.oninput = () => {
	updateSliderText(sliderB, labelB);
	updateFrameBufferSize(sliderB, framebufferB, rectB);
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
	let factor = sliderR.value / 100 + sliderG.value / 100 + sliderB.value / 100;

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
	setTextureFilter(framebufferTexR, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);
	setTextureFilter(framebufferTexG, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);
	setTextureFilter(framebufferTexB, nearest_checkbox.checked ? GL.NEAREST : GL.LINEAR);

	draw();
};

async function updateImage(event) {
	let url =  URL.createObjectURL(event.currentTarget.files[0]);
	document.querySelector("#image").src = url;
	
	image = await loadImageFromSrc(url);
	
	uploadImageData(Texture, image); 
	setRenderBufferSize(image.width, image.height);
	
	updateFrameBufferSize(sliderR, framebufferR, rectR);
	updateFrameBufferSize(sliderG, framebufferG, rectG);
	updateFrameBufferSize(sliderB, framebufferB, rectB);

	compressedImage.setScale(1, image.height / image.width, 1);
	updateFileSize();
	
	draw();
}

function draw() 
{
	GL.activeTexture(GL.TEXTURE0);
	GL.bindTexture(GL.TEXTURE_2D, Texture);
	
	GL.bindFramebuffer(GL.FRAMEBUFFER, framebufferR);  
	rectR.draw();

	GL.bindFramebuffer(GL.FRAMEBUFFER, framebufferG);  
	rectG.draw();
	
	GL.bindFramebuffer(GL.FRAMEBUFFER, framebufferB);  
	rectB.draw();
	
	GL.bindFramebuffer(GL.FRAMEBUFFER, null);  

	GL.activeTexture(GL.TEXTURE0);
	GL.bindTexture(GL.TEXTURE_2D, framebufferTexR);
	GL.activeTexture(GL.TEXTURE1);
	GL.bindTexture(GL.TEXTURE_2D, framebufferTexG);
	GL.activeTexture(GL.TEXTURE2);
	GL.bindTexture(GL.TEXTURE_2D, framebufferTexB);

	compressedImage.draw();
}