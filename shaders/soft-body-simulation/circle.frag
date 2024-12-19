#version 300 es
precision highp float;

in vec2 Texcoord;

out vec4 FragColor;

void main() 
{
    float distanceCenter = 1.0 - length(Texcoord - 0.5);
    distanceCenter = step(0.5, distanceCenter);

    float distance = 1.0 - length(Texcoord - 0.3);
    distance = pow(distance, 2.0);

    vec3 color1 = vec3(0.0, 0.05, 0.3);
    vec3 color2 = vec3(0.25, 0.64, 0.95);

    vec3 color = mix(color1, color2, distance);

    FragColor = vec4(color * distanceCenter, distanceCenter);
}