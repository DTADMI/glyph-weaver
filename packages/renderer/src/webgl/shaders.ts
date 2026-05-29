export const VERTEX_SHADER_PASSTHROUGH = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_texcoord;
out vec2 v_texcoord;
void main() {
  v_texcoord = a_texcoord;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

export const FRAGMENT_SHADER_FIRE = `#version 300 es
precision highp float;
in vec2 v_texcoord;
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_particleTexture;
out vec4 fragColor;

void main() {
  vec2 uv = v_texcoord;
  vec4 texColor = texture(u_particleTexture, uv);
  float brightness = texColor.r * 1.5;
  vec3 fireColor = mix(vec3(1.0, 1.0, 0.9), vec3(1.0, 0.3, 0.05), texColor.g);
  fragColor = vec4(fireColor * brightness, texColor.a);
}
`

export const FRAGMENT_SHADER_WATER = `#version 300 es
precision highp float;
in vec2 v_texcoord;
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_particleTexture;
out vec4 fragColor;

void main() {
  vec2 uv = v_texcoord;
  vec4 texColor = texture(u_particleTexture, uv);
  vec3 waterColor = mix(vec3(0.3, 0.8, 1.0), vec3(0.05, 0.2, 0.6), texColor.g);
  float ripple = sin(uv.x * 30.0 + u_time) * cos(uv.y * 30.0 + u_time) * 0.3;
  fragColor = vec4(waterColor * (1.0 + ripple), texColor.a);
}
`

export const FRAGMENT_SHADER_WIND = `#version 300 es
precision highp float;
in vec2 v_texcoord;
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_particleTexture;
out vec4 fragColor;

void main() {
  vec2 uv = v_texcoord;
  vec4 texColor = texture(u_particleTexture, uv);
  vec3 windColor = mix(vec3(0.7, 1.0, 0.7), vec3(1.0, 1.0, 1.0), texColor.g);
  fragColor = vec4(windColor * texColor.r * 1.2, texColor.a);
}
`

export const FRAGMENT_SHADER_EARTH = `#version 300 es
precision highp float;
in vec2 v_texcoord;
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_particleTexture;
out vec4 fragColor;

void main() {
  vec2 uv = v_texcoord;
  vec4 texColor = texture(u_particleTexture, uv);
  vec3 earthColor = mix(vec3(0.5, 0.3, 0.1), vec3(0.3, 0.3, 0.3), texColor.g);
  fragColor = vec4(earthColor * texColor.r * 0.9, texColor.a);
}
`

export const FRAGMENT_SHADER_LIGHT = `#version 300 es
precision highp float;
in vec2 v_texcoord;
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_particleTexture;
out vec4 fragColor;

void main() {
  vec2 uv = v_texcoord;
  vec4 texColor = texture(u_particleTexture, uv);
  vec3 lightColor = mix(vec3(1.0, 0.95, 0.7), vec3(1.0, 1.0, 0.9), texColor.g);
  float glow = texColor.r * 2.0;
  fragColor = vec4(lightColor * glow, texColor.a * 0.85);
}
`

export const FRAGMENT_SHADER_DARK = `#version 300 es
precision highp float;
in vec2 v_texcoord;
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_particleTexture;
out vec4 fragColor;

void main() {
  vec2 uv = v_texcoord;
  vec4 texColor = texture(u_particleTexture, uv);
  float darkness = 1.0 - texColor.r;
  vec3 darkColor = mix(vec3(0.2, 0.0, 0.4), vec3(0.05, 0.0, 0.1), texColor.g);
  fragColor = vec4(darkColor * darkness, texColor.a * 0.7);
}
`

export const FRAGMENT_SHADER_LIGHTNING = `#version 300 es
precision highp float;
in vec2 v_texcoord;
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_particleTexture;
out vec4 fragColor;

void main() {
  vec2 uv = v_texcoord;
  vec4 texColor = texture(u_particleTexture, uv);
  vec3 lightningColor = mix(vec3(0.7, 0.8, 1.0), vec3(1.0, 1.0, 1.0), texColor.r);
  float flash = texColor.r * 3.0;
  fragColor = vec4(lightningColor * flash, texColor.a);
}
`

export const FRAGMENT_SHADER_ICE = `#version 300 es
precision highp float;
in vec2 v_texcoord;
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_particleTexture;
out vec4 fragColor;

void main() {
  vec2 uv = v_texcoord;
  vec4 texColor = texture(u_particleTexture, uv);
  vec3 iceColor = mix(vec3(0.7, 0.9, 1.0), vec3(1.0, 1.0, 1.0), texColor.g);
  float crystal = texColor.r * 1.8;
  fragColor = vec4(iceColor * crystal, texColor.a * 0.9);
}
`

export const FRAGMENT_SHADER_NATURE = `#version 300 es
precision highp float;
in vec2 v_texcoord;
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_particleTexture;
out vec4 fragColor;

void main() {
  vec2 uv = v_texcoord;
  vec4 texColor = texture(u_particleTexture, uv);
  vec3 natureColor = mix(vec3(0.2, 0.7, 0.2), vec3(0.4, 1.0, 0.3), texColor.g);
  fragColor = vec4(natureColor * texColor.r * 1.1, texColor.a);
}
`

export const FRAGMENT_SHADER_ARCANE = `#version 300 es
precision highp float;
in vec2 v_texcoord;
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_particleTexture;
out vec4 fragColor;

void main() {
  vec2 uv = v_texcoord;
  vec4 texColor = texture(u_particleTexture, uv);
  vec3 arcaneColor = mix(vec3(0.6, 0.1, 0.8), vec3(1.0, 0.3, 1.0), texColor.g);
  float ethereal = texColor.r * 2.0;
  fragColor = vec4(arcaneColor * ethereal, texColor.a * 0.8);
}
`

export const ELEMENT_FRAGMENT_SHADERS: Record<string, string> = {
  fire: FRAGMENT_SHADER_FIRE,
  water: FRAGMENT_SHADER_WATER,
  wind: FRAGMENT_SHADER_WIND,
  earth: FRAGMENT_SHADER_EARTH,
  light: FRAGMENT_SHADER_LIGHT,
  dark: FRAGMENT_SHADER_DARK,
  lightning: FRAGMENT_SHADER_LIGHTNING,
  ice: FRAGMENT_SHADER_ICE,
  nature: FRAGMENT_SHADER_NATURE,
  arcane: FRAGMENT_SHADER_ARCANE,
}
