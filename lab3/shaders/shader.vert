#version 300 es

precision mediump float;
        
in vec3 vertPosition;
in vec3 vertColor;
out vec3 color;

uniform mat4 mProj;  // projection matrix, e.g. perspective
uniform mat4 mView;  // 'camera' position
uniform mat4 mModel; // affine transformations

void main()
{
    gl_Position = mProj * mView * mModel * vec4(vertPosition, 1.0);
    color = vertColor;
}