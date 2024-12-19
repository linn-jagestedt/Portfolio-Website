import { fastSin, fastCos } from "./trigonometry.js";

const matrix = new Float32Array(16);

export function createMatrix(position, scale) 
{
  matrix[0] = scale[0];     matrix[1] = 0;            matrix[2] = 0;             matrix[3] = 0;
  matrix[4] = 0;            matrix[5] = scale[1];     matrix[6] = 0;             matrix[7] = 0;
  matrix[8] = 0;            matrix[9] = 0;            matrix[10] = scale[2];     matrix[11] = 0;
  matrix[12] = position[0]; matrix[13] = position[1]; matrix[14] = position[2];  matrix[15] = 1;

  return matrix;
}

export function createMatrixRotation(position, scale, rotation) 
{
  const sinX = fastSin(rotation[0]); const cosX = fastCos(rotation[0]); 
  const sinY = fastSin(rotation[1]); const cosY = fastCos(rotation[1]); 
  const sinZ = fastSin(rotation[2]); const cosZ = fastCos(rotation[2]);

  const cosZsinY = cosZ * sinY;
  const sinZsinY  = sinZ * sinY;

  matrix[0] = scale[0] * (cosZ * cosY);  matrix[1] = scale[0] * (cosZsinY * sinX - sinZ * cosX);  matrix[2] = scale[0] * (cosZsinY * cosX + sinZ * sinX);  matrix[3] = 0;
  matrix[4] = scale[1] * (sinZ * cosY);  matrix[5] = scale[1] * (sinZsinY * sinX + cosZ * cosX);  matrix[6] = scale[1] * (sinZsinY * cosX - cosZ * sinX);  matrix[7] = 0;
  matrix[8] = scale[2] * (-sinY);        matrix[9] = scale[2] * (cosY * sinX);                    matrix[10] = scale[2] * (cosY * cosX);                   matrix[11] = 0;
  matrix[12] = position[0];              matrix[13] = position[1];                                matrix[14] = position[2];                                matrix[15] = 1;

  return matrix;
}

export function createMatrix2D(position, scale) 
{
  matrix[0] = scale[0];     matrix[1] = 0;            matrix[2] = 0;             matrix[3] = 0;
  matrix[4] = 0;            matrix[5] = scale[1];     matrix[6] = 0;             matrix[7] = 0;
  matrix[8] = 0;            matrix[9] = 0;            matrix[10] = 0;            matrix[11] = 0;
  matrix[12] = position[0]; matrix[13] = position[1]; matrix[14] = 0;            matrix[15] = 1;

  return matrix;
}

export function createMatrix2Drotation(position, scale, angle) 
{
  const sinZ = fastSin(angle); const cosZ = fastCos(angle);

  matrix[0] = scale[0] * cosZ;  matrix[1] = scale[0] * -sinZ;  matrix[2] = 0;             matrix[3] = 0;
  matrix[4] = scale[1] * sinZ;  matrix[5] = scale[1] * cosZ;   matrix[6] = 0;             matrix[7] = 0;
  matrix[8] = 0;                matrix[9] = 0;                 matrix[10] = 0;            matrix[11] = 0;
  matrix[12] = position[0];     matrix[13] = position[1];      matrix[14] = 0;            matrix[15] = 1;

  return matrix;
}