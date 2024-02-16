
const canvas = document.querySelector("#glcanvas");

export function getRenderContext() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let gl = canvas.getContext("webgl2");

    if (!gl) {
        console.log("Failed. Your browser or device may not support WebGL.");
        return null;
    }

    addEventListener("resize", (event) => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    });

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return gl;
}

export function getScreenSize() {
    return { x : canvas.width, y : canvas.height };
}
