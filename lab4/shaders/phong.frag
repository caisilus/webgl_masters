#version 300 es

precision mediump float;

in vec3 position;
in vec3 color;
in vec3 normal;

uniform vec3 lightPosition;
uniform vec3 ambientLightColor;
uniform vec3 diffuseLightColor;
uniform vec3 specularLightColor;

uniform float constantAttenuation;
uniform float linearAttenuation;
uniform float quadraticAttenuation;

uniform int lightModel;

out vec4 fragColor;

const float shininess = 16.0;

void main() {
  vec3 lightDirection = normalize(lightPosition - position);

  float diffuseLightDot = max(dot(normal, lightDirection), 0.0);

  vec3 reflectionDirection = normalize(reflect(-lightDirection, normal));
  vec3 viewDirection = normalize(-position);
  float specularLightDot = max(dot(reflectionDirection, viewDirection), 0.0);
  float specularLightParam = pow(specularLightDot, shininess);

  float distanceToLight = length(lightDirection);
  float attenuation = 1.0 / (constantAttenuation + linearAttenuation * distanceToLight + quadraticAttenuation * distanceToLight * distanceToLight);

  vec3 illumination = vec3(0.0);
  // Lambert
  if (lightModel == 0) {
    illumination = ambientLightColor + diffuseLightColor * diffuseLightDot * attenuation;
  // Phong
  } else if (lightModel == 1) {
    illumination = (ambientLightColor + diffuseLightColor * diffuseLightDot + specularLightColor * specularLightParam) * attenuation;
  // Blinn-Phong
  } else if (lightModel == 2) {
    vec3 halfVector = normalize(lightDirection + viewDirection);
    float blinnPhong = max(dot(halfVector, normal), 0.0);
    float blinnPhongParam = pow(blinnPhong, shininess / 2.0);

    illumination = (ambientLightColor + diffuseLightColor * diffuseLightDot + specularLightColor * blinnPhongParam) * attenuation;
  // Toon shading
  } else if (lightModel == 3) {
    float numberOfShades = 16.0;
    vec3 ambientLightShade = ceil(ambientLightColor * numberOfShades) / numberOfShades;
    float diffuseLightShade = ceil(diffuseLightDot * numberOfShades) / numberOfShades;
    float specularLightShade = ceil(specularLightParam * numberOfShades) / numberOfShades;
    vec3 lightWeighting = ambientLightShade + diffuseLightShade + specularLightShade;

    illumination = lightWeighting * attenuation;

    // float numberOfShades = 16.0;
    // float shade = ceil(diffuseLightDot * numberOfShades) / numberOfShades;

    // illumination = vec3(shade);
  } 
  fragColor = vec4(illumination * color, 1.0);
  // color = vec3(diffuseLightDot, diffuseLightDot, diffuseLightDot);
  // color = vec3(1.0, 1.0, 1.0);
}