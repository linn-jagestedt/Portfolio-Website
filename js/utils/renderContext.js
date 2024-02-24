const canvas = document.querySelector("#glcanvas");
const GL = canvas.getContext("webgl2");

function initRenderContext(width, height) {
    if (!GL) {
        console.log("Failed. Your browser or device may not support WebGL.");
        return null;
    }

    canvas.width = width;
    canvas.height = height;
    
    GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
    GL.clearColor(0.135, 0.135, 0.135, 1.0);
    GL.clear(GL.COLOR_BUFFER_BIT);
    
    return GL;
}

function getRenderBufferSize() {
    return { x : canvas.width, y : canvas.height };
}

function setRenderBufferSize(width, height) {
    canvas.width = width;
    canvas.height = height;
    GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
}

export { GL, initRenderContext, getRenderBufferSize, setRenderBufferSize };