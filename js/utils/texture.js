import { GL } from "../utils/renderContext.js"

export async function loadImageFromSrc(imageSrc) {
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

function getFrequencyStrength(data, k, N) {
	let reR = 0;
	//let reG = 0;
	//let reB = 0;

	let imR = 0;
	//let imG = 0;
	//let imB = 0;

	for (let n = 0; n < N; n++) {
		let expIm = Math.sin(-(2 * Math.PI * k * n) / N);
		let expRe = Math.sqrt(1 - expIm * expIm);

		reR += data[n * 4] * expRe;
		imR +=  data[n * 4] * expIm;

		//reG += data[n * 4 + 1] * expRe;
		//imG += data[n * 4 + 1] * expIm;
		
		//reB += data[n * 4 + 2] * expRe;
		//imB +=  data[n * 4 + 2] * expIm;
	}
	
	return Math.sqrt((reR * reR) + (imR * imR));
}

export async function fourierTransform(image) 
{
	virtualcanvas.width = image.width;
	virtualcanvas.height = image.height;

	ctx.drawImage(image, 0, 0);

	const imageData = ctx.getImageData(0, 0, image.width, image.height);

	const fourierTransform = [];

	let N = imageData.data.length / 4;

	for (let i = 0; i < N; i++) {

		fourierTransform.push(getFrequencyStrength(imageData.data, i, N));
	}

	for (let i = 0; i < fourierTransform.length; i++) {

		imageData.data[i * 4 + 0] = fourierTransform[i];
		imageData.data[i * 4 + 1] = fourierTransform[i];
		imageData.data[i * 4 + 2] = fourierTransform[i];

	}

	return imageData;
}

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
	
	return imageData;
}

const YCbCrTransform = [
	0.299,  0.587,  0.114,
   -0.169, -0.331,  0.500,
	0.500, -0.419, -0.081,
];

export async function convertToYCbCr(image) 
{
	console.log("starting convertion");

	virtualcanvas.width = image.width;
	virtualcanvas.height = image.height;

	ctx.drawImage(image, 0, 0);

	const imageData = ctx.getImageData(0, 0, image.width, image.height);

	let r, g, b;

	for (let i = 0; i < imageData.data.length; i += 4) {
		r = 	  imageData.data[i] * YCbCrTransform[0] + imageData.data[i + 1] * YCbCrTransform[1] + imageData.data[i + 2] * YCbCrTransform[2];
		g = 128 + imageData.data[i] * YCbCrTransform[3] + imageData.data[i + 1] * YCbCrTransform[4] + imageData.data[i + 2] * YCbCrTransform[5];
		b = 128 + imageData.data[i] * YCbCrTransform[6] + imageData.data[i + 1] * YCbCrTransform[7] + imageData.data[i + 2] * YCbCrTransform[8]
	
		imageData.data[i + 0] = r;
		imageData.data[i + 1] = g;
		imageData.data[i + 2] = b;
	}

	console.log("convertion done!");
	
	return imageData;
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