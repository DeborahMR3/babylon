"use strict";
(self["webpackChunkbabylon"] = self["webpackChunkbabylon"] || []).push([[18],{

/***/ 241:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   postprocessVertexShaderWGSL: () => (/* binding */ postprocessVertexShaderWGSL)
/* harmony export */ });
/* harmony import */ var _Engines_shaderStore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(43);
// Do not edit.

const name = "postprocessVertexShader";
const shader = `attribute position: vec2<f32>;uniform scale: vec2<f32>;varying vUV: vec2<f32>;const madd=vec2(0.5,0.5);
#define CUSTOM_VERTEX_DEFINITIONS
@vertex
fn main(input : VertexInputs)->FragmentInputs {
#define CUSTOM_VERTEX_MAIN_BEGIN
vertexOutputs.vUV=(vertexInputs.position*madd+madd)*uniforms.scale;vertexOutputs.position=vec4(vertexInputs.position,0.0,1.0);
#define CUSTOM_VERTEX_MAIN_END
}
`;
// Sideeffect
if (!_Engines_shaderStore_js__WEBPACK_IMPORTED_MODULE_0__.ShaderStore.ShadersStoreWGSL[name]) {
    _Engines_shaderStore_js__WEBPACK_IMPORTED_MODULE_0__.ShaderStore.ShadersStoreWGSL[name] = shader;
}
/** @internal */
const postprocessVertexShaderWGSL = { name, shader };
//# sourceMappingURL=postprocess.vertex.js.map

/***/ })

}]);