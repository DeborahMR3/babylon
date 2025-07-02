"use strict";
(self["webpackChunkbabylon"] = self["webpackChunkbabylon"] || []).push([[19],{

/***/ 242:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   passPixelShaderWGSL: () => (/* binding */ passPixelShaderWGSL)
/* harmony export */ });
/* harmony import */ var _Engines_shaderStore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(43);
// Do not edit.

const name = "passPixelShader";
const shader = `varying vUV: vec2f;var textureSamplerSampler: sampler;var textureSampler: texture_2d<f32>;
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {fragmentOutputs.color=textureSample(textureSampler,textureSamplerSampler,input.vUV);}`;
// Sideeffect
if (!_Engines_shaderStore_js__WEBPACK_IMPORTED_MODULE_0__.ShaderStore.ShadersStoreWGSL[name]) {
    _Engines_shaderStore_js__WEBPACK_IMPORTED_MODULE_0__.ShaderStore.ShadersStoreWGSL[name] = shader;
}
/** @internal */
const passPixelShaderWGSL = { name, shader };
//# sourceMappingURL=pass.fragment.js.map

/***/ })

}]);