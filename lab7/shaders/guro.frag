#version 300 es

#ifdef GL_ES 
precision highp float;
#endif

uniform int numPointLights;
uniform vec3[10] pointLightPositions;
uniform vec3[10] pointLightAmbientColors;
uniform vec3[10] pointLightDiffuseColors;
uniform vec3[10] pointLightSpecularColors;

uniform bool useAmbientLight;
uniform bool usePointLight;
// uniform bool useSpotLight;

uniform float constantAttenuation;
uniform float linearAttenuation;
uniform float quadraticAttenuation;

uniform sampler2D u_texture;

in vec2 texCoord;
in vec3 color;
in vec3 normal;
in vec3 position;

out vec4 fragColor;

void main() { 
  vec4 textColor = texture(u_texture, texCoord);

  vec3 sumAmbient = vec3(0.0, 0.0, 0.0);
  vec3 sumDiffuse = vec3(0.0, 0.0, 0.0);
  vec3 sumSpecular = vec3(0.0, 0.0, 0.0);

  if (usePointLight) {
    for (int i = 0; i < numPointLights; i++) {
      // ambient
      sumAmbient = sumAmbient + pointLightAmbientColors[i];

      float d = distance(pointLightPositions[i], position);
      vec3 dirToLight = normalize(pointLightPositions[i] - position); // l
      vec3 reflVec = normalize(reflect(-dirToLight, normal)); // r
      vec3 dirToView = normalize(0.0 - position); // v

      float attenuation = 1.0 / (constantAttenuation + linearAttenuation * d + quadraticAttenuation * d * d);

      // diffuse
      float diffLightDot = max(dot(normal, dirToLight),0.0);
      sumDiffuse += attenuation * pointLightDiffuseColors[i] * diffLightDot;

      // specular
      float specLightDot = max(dot(reflVec, dirToView),0.0);
      float specLightParam = pow(specLightDot, 16.0);
      sumSpecular += attenuation * pointLightSpecularColors[i] * specLightParam;
    }
  }

  // sumAmbient = sumAmbient / float(numPointLights);
  sumDiffuse = clamp(sumDiffuse, 0.0, 1.0);
  sumSpecular = clamp(sumSpecular, 0.0, 1.0);

  vec3 illumination = vec3(0.0, 0.0, 0.0);
  if (useAmbientLight) {
    illumination += sumAmbient;
  }
  illumination += sumDiffuse + sumSpecular; 

  fragColor = textColor;
  fragColor.xyz = illumination * fragColor.xyz;
}