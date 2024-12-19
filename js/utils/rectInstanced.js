import { createMatrixRotation } from "./matrix.js"
import { GL } from "./renderContext.js";

export default class RectInstanced
{
    constructor(shader) 
    {
        this.shader = shader;
        this.vertexArray = this.createVertexArray();
        this.modelViewLocation = GL.getUniformLocation(this.shader, "modelView");
    }

    free() 
    {
        GL.delteVertexArray(this.vertexArray);
    }

    draw(matrices, instances) 
    {
        GL.useProgram(this.shader);

        if (matrices != undefined) 
        {
            GL.uniformMatrix4fv(
                this.modelViewLocation, 
                false, 
                matrices, 
                0
            );
        }

        GL.drawElementsInstanced(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0, instances);
    }

    setModelView(matrices) 
    {
        GL.useProgram(this.shader);

        GL.uniformMatrix4fv(
            this.modelViewLocation, 
            false, 
            matrices, 
            0
        );
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