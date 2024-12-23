import { createTexture } from "../utils/texture.js";

const canvas = document.querySelector("#glcanvas");
const GL = canvas.getContext("webgl2");

const framebufferTextures = new Map();

export function createFrameBuffer(width, height) {
    let framebuffer = GL.createFramebuffer();
    let texture = createTexture(width, height);

    GL.bindFramebuffer(GL.FRAMEBUFFER, framebuffer);  
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture, 0);  
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);

    framebufferTextures.set(framebuffer, texture);
    
    return framebuffer;
}

export function setFrameBufferSize(framebuffer, width, height) {
    let texture = framebufferTextures.get(framebuffer);

    GL.bindTexture(GL.TEXTURE_2D, texture);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);

    GL.bindFramebuffer(GL.FRAMEBUFFER, framebuffer);  
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture, 0); 
    GL.bindFramebuffer(GL.FRAMEBUFFER, null); 
}

export function getFrameBufferTexture(framebuffer) {
    return framebufferTextures.get(framebuffer);
}

export function freeFrameBuffer() {
    let texture = framebufferTextures.get(framebuffer);
    GL.deleteTexture(texture);
    GL.deleteFramebuffer(framebuffer);
}