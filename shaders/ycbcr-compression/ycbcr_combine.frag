#version 300 es
precision highp float;

in vec2 Texcoord;

uniform sampler2D textureY;
uniform sampler2D textureCb;
uniform sampler2D textureCr;

out vec4 FragColor;

void main() 
{
    vec3 color;

    color.r = texture(textureY,  Texcoord).r;
    color.g = texture(textureCb, Texcoord).g - 0.5;
    color.b = texture(textureCr, Texcoord).b - 0.5;

    mat3 converstionMatrix = inverse(
        transpose(mat3(
            0.299, 0.587, 0.114, 
            -0.169, -0.331, 0.500, 
            0.500, -0.419, -0.081
        ))
    );

    color = converstionMatrix * color;

    FragColor = vec4(color, 1.0);
}