#version 300 es

precision mediump float;
        
in vec2 vertPosition;
in vec3 vertColor;
out vec3 color;


void main()
{
    gl_Position = vec4(vertPosition, 0.0, 1.0);
    color = vertColor;
}