export default class Shader 
{
    constructor(GL, vertexSrc, fragmentSrc) 
    {
		this.GL = GL;
		const vertexShader = this.GL.createShader(this.GL.VERTEX_SHADER);
		this.GL.shaderSource(vertexShader, vertexSrc);
		this.GL.compileShader(vertexShader);

		if (!this.GL.getShaderParameter(vertexShader, this.GL.COMPILE_STATUS)) {
			console.log(this.GL.getShaderInfoLog(vertexShader));
		}	

		const fragmentShader = this.GL.createShader(this.GL.FRAGMENT_SHADER);
		this.GL.shaderSource(fragmentShader, fragmentSrc);
		this.GL.compileShader(fragmentShader);

		if (!this.GL.getShaderParameter(fragmentShader, this.GL.COMPILE_STATUS)) {
			console.log(this.GL.getShaderInfoLog(fragmentShader));
		}

		const program = this.GL.createProgram();
		this.GL.attachShader(program, vertexShader);
		this.GL.attachShader(program, fragmentShader);

		this.GL.linkProgram(program);
		
		if (!this.GL.getProgramParameter(program, this.GL.LINK_STATUS)) {
			console.log(this.GL.getProgramInfoLog(program));
		}	

		this.GL.detachShader(program, vertexShader);
		this.GL.detachShader(program, fragmentShader);

		this.GL.deleteShader(vertexShader);
		this.GL.deleteShader(fragmentShader);

		this.program = program;
		this.uniformLocations = new Map();
	}

	getUniformLocation(name) 
	{
		if (this.uniformLocations.has(name)) {
			return this.uniformLocations.get(name);
		}

		const location = this.GL.getUniformLocation(this.program, name);
		this.uniformLocations.set(name, location);
		
		return location;
	}
}