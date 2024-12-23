const canvas = document.querySelector("#glcanvas");
const GL = canvas.getContext("webgl2");

export default class Shader 
{
    constructor(vertexSrc, fragmentSrc) 
    {
		const vertexShader = GL.createShader(GL.VERTEX_SHADER);
		GL.shaderSource(vertexShader, vertexSrc);
		GL.compileShader(vertexShader);

		if (!GL.getShaderParameter(vertexShader, GL.COMPILE_STATUS)) {
			console.log(GL.getShaderInfoLog(vertexShader));
		}	

		const fragmentShader = GL.createShader(GL.FRAGMENT_SHADER);
		GL.shaderSource(fragmentShader, fragmentSrc);
		GL.compileShader(fragmentShader);

		if (!GL.getShaderParameter(fragmentShader, GL.COMPILE_STATUS)) {
			console.log(GL.getShaderInfoLog(fragmentShader));
		}

		const program = GL.createProgram();
		GL.attachShader(program, vertexShader);
		GL.attachShader(program, fragmentShader);

		GL.linkProgram(program);
		
		if (!GL.getProgramParameter(program, GL.LINK_STATUS)) {
			console.log(GL.getProgramInfoLog(program));
		}	

		GL.detachShader(program, vertexShader);
		GL.detachShader(program, fragmentShader);

		GL.deleteShader(vertexShader);
		GL.deleteShader(fragmentShader);

		this.program = program;
		this.uniformLocations = new Map();
	}

	getUniformLocation(name) 
	{
		if (this.uniformLocations.has(name)) {
			return this.uniformLocations.get(name);
		}

		const location = GL.getUniformLocation(this.program, name);
		this.uniformLocations.set(name, location);
		
		return location;
	}
}