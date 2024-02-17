const canvas = document.querySelector("#glcanvas");
const GL = canvas.getContext("webgl2");

var drawingBufferSize;

export function getRenderContext() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!GL) {
        console.log("Failed. Your browser or device may not support WebGL.");
        return null;
    }

    addEventListener("resize", (event) => {
        if (drawingBufferSize == undefined) {   
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        } else {
            canvas.width = drawingBufferSize.x;
            canvas.height = drawingBufferSize.y;
        }
        GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
    });

    GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
    GL.clearColor(0.0, 0.0, 0.0, 1.0);
    GL.clear(GL.COLOR_BUFFER_BIT);

    return GL;
}

export function getDrawingBufferSize() {
    return drawingBufferSize == undefined ? { x : canvas.width, y : canvas.height } : drawingBufferSize;
}

export function setDrawingBufferSize(x, y) {
    drawingBufferSize = { x : x, y : y };
    canvas.width = drawingBufferSize.x;
    canvas.height = drawingBufferSize.y;

    canvas.style.marginLeft = "calc(50vw - " + drawingBufferSize.x / 2 + "px)";
    canvas.style.marginTop = "calc(50vh - " + drawingBufferSize.y / 2 + "px)";

    GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
}
