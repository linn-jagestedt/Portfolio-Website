import { createTexture } from "/js/utils/texture.js";

export class Framebuffer {
    constructor(GL, size) {
        this.GL = GL;
        this.size = { x : size.x, y : size.y };
        this.framebuffer = this.GL.createFramebuffer();
        this.texture = createTexture(this.GL, size);
    
        this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, this.framebuffer);  
        this.GL.framebufferTexture2D(this.GL.FRAMEBUFFER, this.GL.COLOR_ATTACHMENT0, this.GL.TEXTURE_2D, this.texture, 0);  
        this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, null);
    }

    setSize(size) {
        this.GL.deleteFramebuffer(this.framebuffer);
        this.framebuffer = this.GL.createFramebuffer();

        this.GL.bindTexture(this.GL.TEXTURE_2D, this.texture);
        this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, size.x, size.y, 0, this.GL.RGBA, this.GL.UNSIGNED_BYTE, null);

        this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, this.framebuffer);  
        this.GL.framebufferTexture2D(this.GL.FRAMEBUFFER, this.GL.COLOR_ATTACHMENT0, this.GL.TEXTURE_2D, this.texture, 0); 
        this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, null); 
    }

    bind(){
        this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, this.framebuffer);  
    }

    unbind() {
        this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, null);
    }
}