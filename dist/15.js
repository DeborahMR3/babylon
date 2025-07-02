"use strict";
(self["webpackChunkbabylon"] = self["webpackChunkbabylon"] || []).push([[15],{

/***/ 238:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   lodPixelShader: () => (/* binding */ lodPixelShader)
/* harmony export */ });
/* harmony import */ var _Engines_shaderStore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(43);
// Do not edit.

const name = "lodPixelShader";
const shader = `#extension GL_EXT_shader_texture_lod : enable
precision highp float;const float GammaEncodePowerApprox=1.0/2.2;varying vec2 vUV;uniform sampler2D textureSampler;uniform float lod;uniform vec2 texSize;uniform int gamma;void main(void)
{gl_FragColor=texture2DLodEXT(textureSampler,vUV,lod);if (gamma==0) {gl_FragColor.rgb=pow(gl_FragColor.rgb,vec3(GammaEncodePowerApprox));}}
`;
// Sideeffect
if (!_Engines_shaderStore_js__WEBPACK_IMPORTED_MODULE_0__.ShaderStore.ShadersStore[name]) {
    _Engines_shaderStore_js__WEBPACK_IMPORTED_MODULE_0__.ShaderStore.ShadersStore[name] = shader;
}
/** @internal */
const lodPixelShader = { name, shader };
//# sourceMappingURL=lod.fragment.js.map

/***/ })

}]);