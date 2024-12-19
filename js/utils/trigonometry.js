
const steps = 256;

const sinTable = new Array(steps);
const cosTable = new Array(steps);

const angleStep = (Math.PI * 2) / steps;

for (let i = 0; i < steps; i++) {
    sinTable[i] = Math.sin(angleStep * i);
    cosTable[i] = Math.cos(angleStep * i);
}

export function fastSin(x) {
    const fraction = Math.abs(x) / (Math.PI * 2);
    const index = Math.round(fraction * steps);
    return sinTable[index] * Math.sign(x);
}

export function fastCos(x) {
    const fraction = Math.abs(x) / (Math.PI * 2);
    const index = Math.round(fraction * steps);
    return cosTable[index];
}

