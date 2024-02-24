#version 300 es
precision highp float;

in vec2 Texcoord;
uniform sampler2D colorTexture;

out vec4 FragColor;

void main() 
{
    vec3 color = texture(colorTexture, Texcoord).rgb;
    
    mat3 converstionMatrix = transpose(
        mat3(
            0.299, 0.587, 0.114, 
            -0.169, -0.331, 0.500, 
            0.500, -0.419, -0.081
        )
    );

    color = converstionMatrix * color;

    color.g += 0.5;
    color.b += 0.5;

    FragColor = vec4(color, 1.0);
}