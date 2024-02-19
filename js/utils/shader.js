import { GL } from "/js/utils/renderContext.js";

export default async function createShader(vertexFile, fragmentFile) 
{
	let vertexSource = await (await fetch(vertexFile)).text();
	let fragmentSource = await (await fetch(fragmentFile)).text();

	let vertexShader = GL.createShader(GL.VERTEX_SHADER);
	GL.shaderSource(vertexShader, vertexSource);
	GL.compileShader(vertexShader);

	let fragmentShader = GL.createShader(GL.FRAGMENT_SHADER);
	GL.shaderSource(fragmentShader, fragmentSource);
	GL.compileShader(fragmentShader);

	let program = GL.createProgram();
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

	return program;
}
