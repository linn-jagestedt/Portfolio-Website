import { createMatrix } from "/js/utils/matrix.js"
import { GL } from "/js/utils/renderContext.js";

export default class Rect 
{
    constructor(shader, scale_x, scale_y, scale_z, position_x, position_y, position_z) {
        this.shader = shader;
        this.position = { x : position_x, y : position_y, z : position_z };
        this.scale = { x : scale_x, y : scale_y, z : scale_z };
        this.vertexArray = this.createVertexArray();
    }

    setPosition(position_x, position_y, position_z) {
        this.position = { x : position_x, y : position_y, z : position_z };
    }

    setScale(scale_x, scale_y, scale_z) {
        this.scale = { x : scale_x, y : scale_y, z : scale_z };
    }

    free() {
        GL.delteVertexArray(this.vertexArray);
    }

    draw() {
        GL.useProgram(this.shader);

        GL.uniformMatrix4fv(
            GL.getUniformLocation(this.shader, "modelView"), 
            true, 
            createMatrix(
                this.scale.x, 
                this.scale.y, 
                this.scale.z, 
                this.position.x, 
                this.position.y, 
                this.position.z
            )
        );

        GL.drawElements(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0);
    }

    createVertexArray() {	
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
        
        let id = GL.createVertexArray();
        GL.bindVertexArray(id);

        let indexBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, indecies,  GL.STATIC_DRAW);

        GL.enableVertexAttribArray(0);
        
        let positionBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, positionBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, position, GL.STATIC_DRAW);
        GL.vertexAttribPointer(0, 3, GL.FLOAT, false, 0, 0);
        
        GL.enableVertexAttribArray(1);
        
        let texcoordBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, texcoordBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, texcoords,  GL.STATIC_DRAW);
        GL.vertexAttribPointer(1, 2,  GL.FLOAT, false, 0, 0);

        return id;
    }
}