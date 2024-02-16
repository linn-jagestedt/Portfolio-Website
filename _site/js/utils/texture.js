export async function loadImage(imageSrc) {
	return new Promise((resolve, reject) => {
		let image = new Image();
		image.src = imageSrc;
		image.onload = () => { 
			resolve(image);
		}
	});
}	

export function pushImageData(GL, id, image) 
{
	GL.bindTexture(GL.TEXTURE_2D, id);
	
	// Set the parameters so we can render any size image.
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
	
	// Upload the image into the texture.
	GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
}