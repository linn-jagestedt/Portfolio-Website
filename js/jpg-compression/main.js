import createShader from "../utils/shader.js";
import Rect from "../utils/rect.js"
import { uploadImageData, loadImageFromSrc, createTextureFromImage, setTextureFilter, fourierTransform } from "../utils/texture.js";
import { GL, initRenderContext, setRenderBufferSize } from "../utils/renderContext.js";
import { getFrameBufferTexture, createFrameBuffer, setFrameBufferSize } from "../utils/framebuffer.js";

const compression = document.querySelector('#compression');
compression.labels[0].innerText = compression.labels[0].innerText.split(":")[0] + ": " + (compression.value) + "%";

const file_size = document.querySelector('#file_size');
const reduced_file_size = document.querySelector('#reduced_file_size');
const image_file = document.querySelector("#imageFile");

let image = await loadImageFromSrc(document.querySelector("#image").src);

image = fourierTransform(image);

initRenderContext(image.width, image.height); 

const Texture = createTextureFromImage(image);

const SimpleVert = await (await fetch(document.querySelector("#simple-vert").src)).text();
const SimpleFrag = await (await fetch(document.querySelector("#simple-frag").src)).text();

const SimpleShader = await createShader(SimpleVert, SimpleFrag);

const rect = new Rect(SimpleShader, 1, 1, 1, 0, 0, 0);

draw();

compression.oninput = () => {
	draw();
	compression.labels[0].innerText = compression.labels[0].innerText.split(":")[0] + ": " + (compression.value) + "%";
};

image_file.oninput = updateImage;

async function updateImage(event) 
{
	let url =  URL.createObjectURL(event.currentTarget.files[0]);
	document.querySelector("#image").src = url;
	
	image = await loadImageFromSrc(url);
	
	uploadImageData(Texture, image); 
	setRenderBufferSize(image.width, image.height);

	draw();
}

function draw() 
{
	GL.activeTexture(GL.TEXTURE0);
	GL.bindTexture(GL.TEXTURE_2D, Texture);
	rect.draw();
}