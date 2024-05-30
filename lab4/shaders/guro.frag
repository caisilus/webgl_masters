#version 300 es

precision mediump float;

in vec3 color;
in vec3 illumination;
out vec4 fragColor;
        
void main()
{
    fragColor = vec4(illumination * color, 1.0);
}