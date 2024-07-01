#version 300 es

in vec3 vertPosition;
in vec3 vertColor;

uniform mat4 mProj;
uniform mat4 mView;
uniform mat4 mModel;

out vec3 color;

void main() {
    color = vertColor;

    gl_Position = mProj * mView * mModel * vec4(vertPosition, 1.0);

    gl_PointSize = 32.0;
}