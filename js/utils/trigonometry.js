
const trigSteps = 256;
const sqrtSteps = 4096 * 4;

const sinTable = new Float32Array(trigSteps);
const cosTable = new Float32Array(trigSteps);
const sqrtTable = new Float32Array(sqrtSteps);

const trigStep = (Math.PI * 2) / trigSteps;
const sqrtStep = 1 / sqrtSteps;

async function init() 
{
    for (let i = 0; i < trigSteps; i++) {
        sinTable[i] = Math.sin(trigStep * i);
        cosTable[i] = Math.cos(trigStep * i);
    }

    for (let i = 0; i < sqrtSteps; i++) {
        sqrtTable[i] = Math.sqrt(sqrtStep * i);
    }
}

init();

export function fastSin(x) {
    const fraction = Math.abs(x) / (Math.PI * 2);
    const index = Math.round(fraction * trigSteps);
    return sinTable[index] * Math.sign(x);
}

export function fastCos(x) {
    const fraction = Math.abs(x) / (Math.PI * 2);
    const index = Math.round(fraction * trigSteps);
    return cosTable[index];
}

export function fastSqrt(x) {
    const index = Math.round(x * sqrtSteps);
    return sqrtTable[index];
}