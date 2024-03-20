#version 300 es

precision mediump float;
        
in vec2 vertPosition;
out vec2 position;

void main()
{
    gl_Position = vec4(vertPosition, 0.0, 1.0);
    position = vertPosition;
}