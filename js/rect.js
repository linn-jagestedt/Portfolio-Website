export default class Rect 
{
    constructor(GL) {
        this.GL = GL;
        this.vertexArray = this.createVertexArray();
    }

    free() {
        this.GL.delteVertexArray(this.vertexArray);
    }

    bind() {
        this.GL.bindVertexArray(this.vertexArray);
    }

    draw() {
        this.GL.drawElements(this.GL.TRIANGLES, 6, this.GL.UNSIGNED_BYTE, 0);
    }

    drawInstanced(instances) {
        this.GL.drawElementsInstanced(this.GL.TRIANGLES, 6, this.GL.UNSIGNED_BYTE, 0, instances);
    }

    createVertexArray() {	
        const indecies = new Uint8Array([
            0, 1, 3,
            3, 2, 1,
        ]);

        const position = new Int8Array([
            -127, -127, 0,
             127, -127, 0,
             127,  127, 0,
            -127,  127, 0,
        ]);

        const texcoords = new Uint8Array([
            0,  255,
            255,  255,
            255,  0,
            0,  0,
        ]);
        
        const id = this.GL.createVertexArray();
        this.GL.bindVertexArray(id);

        const indexBuffer = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, indecies,  this.GL.STATIC_DRAW);

        this.GL.enableVertexAttribArray(0);
        
        const positionBuffer = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, positionBuffer);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, position, this.GL.STATIC_DRAW);
        this.GL.vertexAttribPointer(0, 3, this.GL.BYTE, true, 0, 0);
        
        this.GL.enableVertexAttribArray(1);
        
        const texcoordBuffer = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, texcoordBuffer);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, texcoords,  this.GL.STATIC_DRAW);
        this.GL.vertexAttribPointer(1, 2,  this.GL.UNSIGNED_BYTE, true, 0, 0);

        return id;
    }
}