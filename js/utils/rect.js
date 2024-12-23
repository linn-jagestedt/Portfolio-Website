
const canvas = document.querySelector("#glcanvas");
const GL = canvas.getContext("webgl2");

export default class Rect 
{
    constructor() 
    {
        this.vertexArray = this.createVertexArray();
    }

    free() 
    {
        GL.delteVertexArray(this.vertexArray);
    }

    bind() {
        GL.bindVertexArray(this.vertexArray);
    }

    draw() 
    {
        GL.drawElements(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0);
    }

    drawInstanced(instances) 
    {
        GL.drawElementsInstanced(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0, instances);
    }

    createVertexArray() 
    {	
        const indecies = new Uint16Array([
            0, 1, 3,
            3, 2, 1,
        ]);

        const position = new Float32Array([
            -1, -1, 0,
             1, -1, 0,
             1,  1, 0,
            -1,  1, 0,
        ]);

        const texcoords = new Float32Array([
            0,  1,
            1,  1,
            1,  0,
            0,  0,
        ]);
        
        const id = GL.createVertexArray();
        GL.bindVertexArray(id);

        const indexBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, indecies,  GL.STATIC_DRAW);

        GL.enableVertexAttribArray(0);
        
        const positionBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, positionBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, position, GL.STATIC_DRAW);
        GL.vertexAttribPointer(0, 3, GL.FLOAT, false, 0, 0);
        
        GL.enableVertexAttribArray(1);
        
        const texcoordBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, texcoordBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, texcoords,  GL.STATIC_DRAW);
        GL.vertexAttribPointer(1, 2,  GL.FLOAT, false, 0, 0);

        return id;
    }
}