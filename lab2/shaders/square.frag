#version 300 es

precision mediump float;

in vec2 position;
out vec4 fragColor;
        
void main()
{
    float k = 15.0;
    float sum = position.x * k;
    if (sum < 0.0){
        sum = 1.0-sum;
    }
    int sumInt = int(sum);
    if ( (sumInt - (sumInt / 2 * 2)) == 0 ) {
        fragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    else {
        fragColor = vec4(0.0, 1.0, 1.0, 1.0);
    }
}