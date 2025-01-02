const matrix4x4 = new Float32Array(16);

export function create4x4Matrix(positionX, positionY, positionZ, scaleX, scaleY, scaleZ) 
{
  matrix4x4[0] = scaleX;     matrix4x4[1] = 0;          matrix4x4[2] = 0;           matrix4x4[3] = 0;
  matrix4x4[4] = 0;          matrix4x4[5] = scaleY;     matrix4x4[6] = 0;           matrix4x4[7] = 0;
  matrix4x4[8] = 0;          matrix4x4[9] = 0;          matrix4x4[10] = scaleZ;     matrix4x4[11] = 0;
  matrix4x4[12] = positionX; matrix4x4[13] = positionY; matrix4x4[14] = positionZ;  matrix4x4[15] = 1;

  return matrix4x4;
}

export function createMatrix4x4Rotation(positionX, positionY, positionZ, scaleX, scaleY, scaleZ, rotationX, rotationY, rotationZ) 
{
  const sinX = fastSin(rotationX); const cosX = fastCos(rotationX); 
  const sinY = fastSin(rotationY); const cosY = fastCos(rotationY); 
  const sinZ = fastSin(rotationZ); const cosZ = fastCos(rotationZ);

  const cosZsinY = cosZ * sinY;
  const sinZsinY  = sinZ * sinY;

  matrix4x4[0] = scaleX * (cosZ * cosY);  matrix4x4[1] = scaleX * (cosZsinY * sinX - sinZ * cosX);  matrix4x4[2] = scaleX * (cosZsinY * cosX + sinZ * sinX);  matrix4x4[3] = 0;
  matrix4x4[4] = scaleY * (sinZ * cosY);  matrix4x4[5] = scaleY * (sinZsinY * sinX + cosZ * cosX);  matrix4x4[6] = scaleY * (sinZsinY * cosX - cosZ * sinX);  matrix4x4[7] = 0;
  matrix4x4[8] = scaleZ * (-sinY);        matrix4x4[9] = scaleZ * (cosY * sinX);                    matrix4x4[10] = scaleZ * (cosY * cosX);                   matrix4x4[11] = 0;
  matrix4x4[12] = positionX;              matrix4x4[13] = positionY;                                matrix4x4[14] = positionZ;                                matrix4x4[15] = 1;

  return matrix4x4;
}

const matrix2x4 = new Float32Array(8);

export function create4x2Matrix(positionX, positionY, scaleX, scaleY) 
{
  matrix2x4[0] = scaleX;     matrix2x4[1] = 0;           
  matrix2x4[2] = 0;          matrix2x4[3] = scaleY; 
  matrix2x4[4] = 0;          matrix2x4[5] = 0;           
  matrix2x4[6] = positionX;  matrix2x4[7] = positionY;

  return matrix2x4;
}

export function set4x2Matrix(array, offset, positionX, positionY, scaleX, scaleY) 
{
  array[offset + 0] = scaleX;     array[offset + 1] = 0;
  array[offset + 2] = 0;          array[offset + 3] = scaleY; 
  array[offset + 4] = 0;          array[offset + 5] = 0;
  array[offset + 6] = positionX;  array[offset + 7] = positionY;
}

export function create4x2MatrixRotation(positionX, positionY, scaleX, scaleY, angle) 
{
  const sinZ = fastSin(angle); const cosZ = fastCos(angle);

  matrix2x4[0] = scaleX * cosZ;  matrix2x4[1] = scaleX * -sinZ;
  matrix2x4[2] = scaleY * sinZ;  matrix2x4[3] = scaleY * cosZ; 
  matrix2x4[4] = 0;              matrix2x4[5] = 0;
  matrix2x4[6] = positionX;      matrix2x4[7] = positionY;

  return matrix2x4;
}

export function set4x2MatrixRotation(array, offset, positionX, positionY, scaleX, scaleY, angle) 
{
  const sinZ = fastSin(angle); const cosZ = fastCos(angle);

  array[offset + 0] = scaleX * cosZ;  array[offset + 1] = scaleX * -sinZ;
  array[offset + 2] = scaleY * sinZ;  array[offset + 3] = scaleY * cosZ; 
  array[offset + 4] = 0;              array[offset + 5] = 0;
  array[offset + 6] = positionX;      array[offset + 7] = positionY;
}