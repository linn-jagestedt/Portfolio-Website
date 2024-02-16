export default function createMaterix(scaleX, scaleY, scaleZ, positionX, positionY, positionZ) 
{
	return [
        scaleX, 0, 0, positionX,
        0, scaleY, 0, positionY,
        0, 0, scaleZ, positionZ,
        0, 0, 0, 1
    ]
}