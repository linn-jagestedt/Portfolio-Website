export async function loadImage(imageSrc) {
	return new Promise((resolve, reject) => {
		let image = new Image();
		image.src = imageSrc;
		image.onload = () => { 
			resolve(image);
		}
	});
}	
export function setTextureFilter(GL, id, filer) {
	GL.bindTexture(GL.TEXTURE_2D, id);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, filer);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, filer);
}

export function createTextureFromImage(GL, image) 
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

export function createTexture(GL, size) 
{
	let id = GL.createTexture();

	GL.bindTexture(GL.TEXTURE_2D, id);
	
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
	
	GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, size.x, size.y, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);

	return id;
}