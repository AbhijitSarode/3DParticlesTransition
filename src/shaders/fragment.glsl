varying lowp vec3 vPosition;

uniform lowp vec3 uColor1;
uniform lowp vec3 uColor2;

void main() {
    vec3 color = vec3(1.0, 0.0, 0.0);
    vec3 color1 = vec3(1.0, 0.0, 0.0);
    vec3 color2 = vec3(1.0, 0.0, 0.0);

    float depth = vPosition.z * 0.5 + 0.5;
    color.r = 0.0;
    
    color = mix(uColor1, uColor2, depth);
    gl_FragColor = vec4(color, depth * 0.3 + 0.2);
}
