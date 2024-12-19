#version 300 es
precision highp float;

in vec2 Texcoord;

out vec4 FragColor;

void main() 
{
    float distanceCenter = 1.0 - length(Texcoord - 0.5);
    float distanceStep = step(0.5, distanceCenter);

    FragColor = vec4(1.0, 0, 0, 0.5) * distanceStep;
}