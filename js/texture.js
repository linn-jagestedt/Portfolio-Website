export async function loadImageFromSrc(imageSrc) {
	return new Promise((resolve, reject) => {
		let image = new Image();
		image.src = imageSrc;
		image.onload = () => { 
			resolve(image);
		}
	});
}

export class Texture 
{
	constructor(GL) 
	{
		this.GL = GL;
		this.textureID = this.GL.createTexture();

		this.GL.bindTexture(this.GL.TEXTURE_2D, this.textureID);
		
		this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_S, this.GL.CLAMP_TO_EDGE);
		this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_T, this.GL.CLAMP_TO_EDGE);
		this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MIN_FILTER, this.GL.LINEAR);
		this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MAG_FILTER, this.GL.LINEAR);
	}

	setTextureFilter(filter) 
	{
		this.GL.bindTexture(this.GL.TEXTURE_2D, this.textureID);
	
		this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MIN_FILTER, filter);
		this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MAG_FILTER, filter);
	
	}

	uploadImageData(image) {
		this.GL.bindTexture(this.GL.TEXTURE_2D, this.textureID);
		this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, this.GL.RGBA, this.GL.UNSIGNED_BYTE, image);
	}

	freeTexture() {
		this.GL.deleteTexture(this.textureID);
	}
}

export class Framebuffer 
{
	constructor(GL) 
	{
		this.GL = GL;
		this.framebufferID = this.GL.createFramebuffer();
		this.texture = new Texture(GL);
	
		this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, this.framebufferID);  
		this.GL.framebufferTexture2D(this.GL.FRAMEBUFFER, this.GL.COLOR_ATTACHMENT0, this.GL.TEXTURE_2D, this.texture.textureID, 0);  
		this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, null);
	
	}

	setFrameBufferSize(width, height) 
	{	
		this.GL.bindTexture(this.GL.TEXTURE_2D, this.texture.textureID);
		this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, width, height, 0, this.GL.RGBA, this.GL.UNSIGNED_BYTE, null);
	
		this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, this.framebufferID);  
		this.GL.framebufferTexture2D(this.GL.FRAMEBUFFER, this.GL.COLOR_ATTACHMENT0, this.GL.TEXTURE_2D, this.texture.textureID, 0); 
		this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, null); 
	}	

	freeFrameBuffer() {
		this.GL.deleteTexture(this.texture.textureID);
		this.GL.deleteFramebuffer(this.framebufferID);
	}
}