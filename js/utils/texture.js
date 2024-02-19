import { GL } from "/js/utils/renderContext.js"

export async function loadImage(imageSrc) {
	return new Promise((resolve, reject) => {
		let image = new Image();
		image.src = imageSrc;
		image.onload = () => { 
			resolve(image);
		}
	});
}

const virtualcanvas = document.querySelector("#virtualcanvas"); 
const ctx = virtualcanvas.getContext("2d");

export async function transformImageData(image, transform) 
{
	virtualcanvas.width = image.width;
	virtualcanvas.height = image.height;

	ctx.drawImage(image, 0, 0);

	const imageData = ctx.getImageData(0, 0, image.width, image.height);

	for (let i = 0; i < imageData.data.length; i += 4) {
		const data = transform(imageData.data.slice(i, i + 3));

		imageData.data[i + 0] = data[0]; 
		imageData.data[i + 1] = data[1];
  		imageData.data[i + 2] = data[2]; 
	}
	
	ctx.putImageData(imageData, 0, 0);

	return await loadImage(virtualcanvas.toDataURL());
}

export async function scaleImageData(image, scale) 
{
	virtualcanvas.width = image.width * scale;
	virtualcanvas.height = image.width * scale;

	ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width * scale, image.width * scale);

	return await loadImage(virtualcanvas.toDataURL());
}

export function setTextureFilter(id, filter) {
	GL.bindTexture(GL.TEXTURE_2D, id);

	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, filter);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, filter);
}

export function createTextureFromImage(image) 
{
	let id = GL.createTexture();

	GL.bindTexture(GL.TEXTURE_2D, id);
	
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);

	GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);

	return id;
}

export function uploadImageData(id, image) 
{
	GL.bindTexture(GL.TEXTURE_2D, id);	
	GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
	return id;
}

export function createTexture(width, height) 
{
	let id = GL.createTexture();

	GL.bindTexture(GL.TEXTURE_2D, id);
	
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
	
	GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);

	return id;
}