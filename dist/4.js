"use strict";
(self["webpackChunkbabylon"] = self["webpackChunkbabylon"] || []).push([[4],{

/***/ 194:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CubeMapToSphericalPolynomialTools: () => (/* binding */ CubeMapToSphericalPolynomialTools)
/* harmony export */ });
/* harmony import */ var _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
/* harmony import */ var _Maths_sphericalPolynomial_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(98);
/* harmony import */ var _Maths_math_constants_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6);
/* harmony import */ var _Maths_math_color_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(61);






class FileFaceOrientation {
    constructor(name, worldAxisForNormal, worldAxisForFileX, worldAxisForFileY) {
        this.name = name;
        this.worldAxisForNormal = worldAxisForNormal;
        this.worldAxisForFileX = worldAxisForFileX;
        this.worldAxisForFileY = worldAxisForFileY;
    }
}
/**
 * Helper class dealing with the extraction of spherical polynomial dataArray
 * from a cube map.
 */
class CubeMapToSphericalPolynomialTools {
    /**
     * Converts a texture to the according Spherical Polynomial data.
     * This extracts the first 3 orders only as they are the only one used in the lighting.
     *
     * @param texture The texture to extract the information from.
     * @returns The Spherical Polynomial data.
     */
    static ConvertCubeMapTextureToSphericalPolynomial(texture) {
        if (!texture.isCube) {
            // Only supports cube Textures currently.
            return null;
        }
        texture.getScene()?.getEngine().flushFramebuffer();
        const size = texture.getSize().width;
        const rightPromise = texture.readPixels(0, undefined, undefined, false);
        const leftPromise = texture.readPixels(1, undefined, undefined, false);
        let upPromise;
        let downPromise;
        if (texture.isRenderTarget) {
            upPromise = texture.readPixels(3, undefined, undefined, false);
            downPromise = texture.readPixels(2, undefined, undefined, false);
        }
        else {
            upPromise = texture.readPixels(2, undefined, undefined, false);
            downPromise = texture.readPixels(3, undefined, undefined, false);
        }
        const frontPromise = texture.readPixels(4, undefined, undefined, false);
        const backPromise = texture.readPixels(5, undefined, undefined, false);
        const gammaSpace = texture.gammaSpace;
        // Always read as RGBA.
        const format = 5;
        let type = 0;
        if (texture.textureType == 1 || texture.textureType == 2) {
            type = 1;
        }
        return new Promise((resolve) => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises, github/no-then
            Promise.all([leftPromise, rightPromise, upPromise, downPromise, frontPromise, backPromise]).then(([left, right, up, down, front, back]) => {
                const cubeInfo = {
                    size,
                    right,
                    left,
                    up,
                    down,
                    front,
                    back,
                    format,
                    type,
                    gammaSpace,
                };
                resolve(this.ConvertCubeMapToSphericalPolynomial(cubeInfo));
            });
        });
    }
    /**
     * Compute the area on the unit sphere of the rectangle defined by (x,y) and the origin
     * See https://www.rorydriscoll.com/2012/01/15/cubemap-texel-solid-angle/
     * @param x
     * @param y
     * @returns the area
     */
    static _AreaElement(x, y) {
        return Math.atan2(x * y, Math.sqrt(x * x + y * y + 1));
    }
    /**
     * Converts a cubemap to the according Spherical Polynomial data.
     * This extracts the first 3 orders only as they are the only one used in the lighting.
     *
     * @param cubeInfo The Cube map to extract the information from.
     * @returns The Spherical Polynomial data.
     */
    static ConvertCubeMapToSphericalPolynomial(cubeInfo) {
        const sphericalHarmonics = new _Maths_sphericalPolynomial_js__WEBPACK_IMPORTED_MODULE_2__.SphericalHarmonics();
        let totalSolidAngle = 0.0;
        // The (u,v) range is [-1,+1], so the distance between each texel is 2/Size.
        const du = 2.0 / cubeInfo.size;
        const dv = du;
        const halfTexel = 0.5 * du;
        // The (u,v) of the first texel is half a texel from the corner (-1,-1).
        const minUV = halfTexel - 1.0;
        for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
            const fileFace = this._FileFaces[faceIndex];
            const dataArray = cubeInfo[fileFace.name];
            let v = minUV;
            // TODO: we could perform the summation directly into a SphericalPolynomial (SP), which is more efficient than SphericalHarmonic (SH).
            // This is possible because during the summation we do not need the SH-specific properties, e.g. orthogonality.
            // Because SP is still linear, so summation is fine in that basis.
            const stride = cubeInfo.format === 5 ? 4 : 3;
            for (let y = 0; y < cubeInfo.size; y++) {
                let u = minUV;
                for (let x = 0; x < cubeInfo.size; x++) {
                    // World direction (not normalised)
                    const worldDirection = fileFace.worldAxisForFileX.scale(u).add(fileFace.worldAxisForFileY.scale(v)).add(fileFace.worldAxisForNormal);
                    worldDirection.normalize();
                    const deltaSolidAngle = this._AreaElement(u - halfTexel, v - halfTexel) -
                        this._AreaElement(u - halfTexel, v + halfTexel) -
                        this._AreaElement(u + halfTexel, v - halfTexel) +
                        this._AreaElement(u + halfTexel, v + halfTexel);
                    let r = dataArray[y * cubeInfo.size * stride + x * stride + 0];
                    let g = dataArray[y * cubeInfo.size * stride + x * stride + 1];
                    let b = dataArray[y * cubeInfo.size * stride + x * stride + 2];
                    // Prevent NaN harmonics with extreme HDRI data.
                    if (isNaN(r)) {
                        r = 0;
                    }
                    if (isNaN(g)) {
                        g = 0;
                    }
                    if (isNaN(b)) {
                        b = 0;
                    }
                    // Handle Integer types.
                    if (cubeInfo.type === 0) {
                        r /= 255;
                        g /= 255;
                        b /= 255;
                    }
                    // Handle Gamma space textures.
                    if (cubeInfo.gammaSpace) {
                        r = Math.pow((0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_1__.Clamp)(r), _Maths_math_constants_js__WEBPACK_IMPORTED_MODULE_3__.ToLinearSpace);
                        g = Math.pow((0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_1__.Clamp)(g), _Maths_math_constants_js__WEBPACK_IMPORTED_MODULE_3__.ToLinearSpace);
                        b = Math.pow((0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_1__.Clamp)(b), _Maths_math_constants_js__WEBPACK_IMPORTED_MODULE_3__.ToLinearSpace);
                    }
                    // Prevent to explode in case of really high dynamic ranges.
                    // sh 3 would not be enough to accurately represent it.
                    const max = this.MAX_HDRI_VALUE;
                    if (this.PRESERVE_CLAMPED_COLORS) {
                        const currentMax = Math.max(r, g, b);
                        if (currentMax > max) {
                            const factor = max / currentMax;
                            r *= factor;
                            g *= factor;
                            b *= factor;
                        }
                    }
                    else {
                        r = (0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_1__.Clamp)(r, 0, max);
                        g = (0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_1__.Clamp)(g, 0, max);
                        b = (0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_1__.Clamp)(b, 0, max);
                    }
                    const color = new _Maths_math_color_js__WEBPACK_IMPORTED_MODULE_4__.Color3(r, g, b);
                    sphericalHarmonics.addLight(worldDirection, color, deltaSolidAngle);
                    totalSolidAngle += deltaSolidAngle;
                    u += du;
                }
                v += dv;
            }
        }
        // Solid angle for entire sphere is 4*pi
        const sphereSolidAngle = 4.0 * Math.PI;
        // Adjust the solid angle to allow for how many faces we processed.
        const facesProcessed = 6.0;
        const expectedSolidAngle = (sphereSolidAngle * facesProcessed) / 6.0;
        // Adjust the harmonics so that the accumulated solid angle matches the expected solid angle.
        // This is needed because the numerical integration over the cube uses a
        // small angle approximation of solid angle for each texel (see deltaSolidAngle),
        // and also to compensate for accumulative error due to float precision in the summation.
        const correctionFactor = expectedSolidAngle / totalSolidAngle;
        sphericalHarmonics.scaleInPlace(correctionFactor);
        sphericalHarmonics.convertIncidentRadianceToIrradiance();
        sphericalHarmonics.convertIrradianceToLambertianRadiance();
        return _Maths_sphericalPolynomial_js__WEBPACK_IMPORTED_MODULE_2__.SphericalPolynomial.FromHarmonics(sphericalHarmonics);
    }
}
CubeMapToSphericalPolynomialTools._FileFaces = [
    new FileFaceOrientation("right", new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(1, 0, 0), new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 0, -1), new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, -1, 0)), // +X east
    new FileFaceOrientation("left", new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(-1, 0, 0), new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 0, 1), new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, -1, 0)), // -X west
    new FileFaceOrientation("up", new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 1, 0), new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(1, 0, 0), new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 0, 1)), // +Y north
    new FileFaceOrientation("down", new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, -1, 0), new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(1, 0, 0), new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 0, -1)), // -Y south
    new FileFaceOrientation("front", new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 0, 1), new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(1, 0, 0), new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, -1, 0)), // +Z top
    new FileFaceOrientation("back", new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 0, -1), new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(-1, 0, 0), new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, -1, 0)), // -Z bottom
];
/** @internal */
CubeMapToSphericalPolynomialTools.MAX_HDRI_VALUE = 4096;
/** @internal */
CubeMapToSphericalPolynomialTools.PRESERVE_CLAMPED_COLORS = false;
//# sourceMappingURL=cubemapToSphericalPolynomial.js.map

/***/ }),

/***/ 195:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ApplyPostProcess: () => (/* binding */ ApplyPostProcess),
/* harmony export */   CreateResizedCopy: () => (/* binding */ CreateResizedCopy),
/* harmony export */   FromHalfFloat: () => (/* binding */ FromHalfFloat),
/* harmony export */   GetTextureDataAsync: () => (/* binding */ GetTextureDataAsync),
/* harmony export */   TextureTools: () => (/* binding */ TextureTools),
/* harmony export */   ToHalfFloat: () => (/* binding */ ToHalfFloat)
/* harmony export */ });
/* harmony import */ var _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(196);
/* harmony import */ var _Materials_Textures_renderTargetTexture_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(198);
/* harmony import */ var _PostProcesses_passPostProcess_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(200);
/* harmony import */ var _PostProcesses_postProcess_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(201);





/**
 * Uses the GPU to create a copy texture rescaled at a given size
 * @param texture Texture to copy from
 * @param width defines the desired width
 * @param height defines the desired height
 * @param useBilinearMode defines if bilinear mode has to be used
 * @returns the generated texture
 */
function CreateResizedCopy(texture, width, height, useBilinearMode = true) {
    const scene = texture.getScene();
    const engine = scene.getEngine();
    const rtt = new _Materials_Textures_renderTargetTexture_js__WEBPACK_IMPORTED_MODULE_1__.RenderTargetTexture("resized" + texture.name, { width: width, height: height }, scene, !texture.noMipmap, true, texture._texture.type, false, texture.samplingMode, false);
    rtt.wrapU = texture.wrapU;
    rtt.wrapV = texture.wrapV;
    rtt.uOffset = texture.uOffset;
    rtt.vOffset = texture.vOffset;
    rtt.uScale = texture.uScale;
    rtt.vScale = texture.vScale;
    rtt.uAng = texture.uAng;
    rtt.vAng = texture.vAng;
    rtt.wAng = texture.wAng;
    rtt.coordinatesIndex = texture.coordinatesIndex;
    rtt.level = texture.level;
    rtt.anisotropicFilteringLevel = texture.anisotropicFilteringLevel;
    rtt._texture.isReady = false;
    texture.wrapU = _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_0__.Texture.CLAMP_ADDRESSMODE;
    texture.wrapV = _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_0__.Texture.CLAMP_ADDRESSMODE;
    const passPostProcess = new _PostProcesses_passPostProcess_js__WEBPACK_IMPORTED_MODULE_2__.PassPostProcess("pass", 1, null, useBilinearMode ? _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_0__.Texture.BILINEAR_SAMPLINGMODE : _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_0__.Texture.NEAREST_SAMPLINGMODE, engine, false, 0);
    passPostProcess.externalTextureSamplerBinding = true;
    passPostProcess.onEffectCreatedObservable.addOnce((e) => {
        e.executeWhenCompiled(() => {
            passPostProcess.onApply = function (effect) {
                effect.setTexture("textureSampler", texture);
            };
            const internalTexture = rtt.renderTarget;
            if (internalTexture) {
                scene.postProcessManager.directRender([passPostProcess], internalTexture);
                engine.unBindFramebuffer(internalTexture);
                rtt.disposeFramebufferObjects();
                passPostProcess.dispose();
                rtt.getInternalTexture().isReady = true;
            }
        });
    });
    return rtt;
}
/**
 * Apply a post process to a texture
 * @param postProcessName name of the fragment post process
 * @param internalTexture the texture to encode
 * @param scene the scene hosting the texture
 * @param type type of the output texture. If not provided, use the one from internalTexture
 * @param samplingMode sampling mode to use to sample the source texture. If not provided, use the one from internalTexture
 * @param format format of the output texture. If not provided, use the one from internalTexture
 * @param width width of the output texture. If not provided, use the one from internalTexture
 * @param height height of the output texture. If not provided, use the one from internalTexture
 * @returns a promise with the internalTexture having its texture replaced by the result of the processing
 */
// eslint-disable-next-line @typescript-eslint/promise-function-async
function ApplyPostProcess(postProcessName, internalTexture, scene, type, samplingMode, format, width, height) {
    // Gets everything ready.
    const engine = internalTexture.getEngine();
    internalTexture.isReady = false;
    samplingMode = samplingMode ?? internalTexture.samplingMode;
    type = type ?? internalTexture.type;
    format = format ?? internalTexture.format;
    width = width ?? internalTexture.width;
    height = height ?? internalTexture.height;
    if (type === -1) {
        type = 0;
    }
    return new Promise((resolve) => {
        // Create the post process
        const postProcess = new _PostProcesses_postProcess_js__WEBPACK_IMPORTED_MODULE_3__.PostProcess("postprocess", postProcessName, null, null, 1, null, samplingMode, engine, false, undefined, type, undefined, null, false, format);
        postProcess.externalTextureSamplerBinding = true;
        // Hold the output of the decoding.
        const encodedTexture = engine.createRenderTargetTexture({ width: width, height: height }, {
            generateDepthBuffer: false,
            generateMipMaps: false,
            generateStencilBuffer: false,
            samplingMode,
            type,
            format,
        });
        postProcess.onEffectCreatedObservable.addOnce((e) => {
            e.executeWhenCompiled(() => {
                // PP Render Pass
                postProcess.onApply = (effect) => {
                    effect._bindTexture("textureSampler", internalTexture);
                    effect.setFloat2("scale", 1, 1);
                };
                scene.postProcessManager.directRender([postProcess], encodedTexture, true);
                // Cleanup
                engine.restoreDefaultFramebuffer();
                engine._releaseTexture(internalTexture);
                if (postProcess) {
                    postProcess.dispose();
                }
                // Internal Swap
                encodedTexture._swapAndDie(internalTexture);
                // Ready to get rolling again.
                internalTexture.type = type;
                internalTexture.format = 5;
                internalTexture.isReady = true;
                resolve(internalTexture);
            });
        });
    });
}
// ref: http://stackoverflow.com/questions/32633585/how-do-you-convert-to-half-floats-in-javascript
let floatView;
let int32View;
/**
 * Converts a number to half float
 * @param value number to convert
 * @returns converted number
 */
function ToHalfFloat(value) {
    if (!floatView) {
        floatView = new Float32Array(1);
        int32View = new Int32Array(floatView.buffer);
    }
    floatView[0] = value;
    const x = int32View[0];
    let bits = (x >> 16) & 0x8000; /* Get the sign */
    let m = (x >> 12) & 0x07ff; /* Keep one extra bit for rounding */
    const e = (x >> 23) & 0xff; /* Using int is faster here */
    /* If zero, or denormal, or exponent underflows too much for a denormal
     * half, return signed zero. */
    if (e < 103) {
        return bits;
    }
    /* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
    if (e > 142) {
        bits |= 0x7c00;
        /* If exponent was 0xff and one mantissa bit was set, it means NaN,
         * not Inf, so make sure we set one mantissa bit too. */
        bits |= (e == 255 ? 0 : 1) && x & 0x007fffff;
        return bits;
    }
    /* If exponent underflows but not too much, return a denormal */
    if (e < 113) {
        m |= 0x0800;
        /* Extra rounding may overflow and set mantissa to 0 and exponent
         * to 1, which is OK. */
        bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
        return bits;
    }
    bits |= ((e - 112) << 10) | (m >> 1);
    bits += m & 1;
    return bits;
}
/**
 * Converts a half float to a number
 * @param value half float to convert
 * @returns converted half float
 */
function FromHalfFloat(value) {
    const s = (value & 0x8000) >> 15;
    const e = (value & 0x7c00) >> 10;
    const f = value & 0x03ff;
    if (e === 0) {
        return (s ? -1 : 1) * Math.pow(2, -14) * (f / Math.pow(2, 10));
    }
    else if (e == 0x1f) {
        return f ? NaN : (s ? -1 : 1) * Infinity;
    }
    return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / Math.pow(2, 10));
}
const ProcessAsync = async (texture, width, height, face, lod) => {
    const scene = texture.getScene();
    const engine = scene.getEngine();
    if (!engine.isWebGPU) {
        if (texture.isCube) {
            await __webpack_require__.e(/* import() */ 14).then(__webpack_require__.bind(__webpack_require__, 237));
        }
        else {
            await __webpack_require__.e(/* import() */ 15).then(__webpack_require__.bind(__webpack_require__, 238));
        }
    }
    else {
        if (texture.isCube) {
            await __webpack_require__.e(/* import() */ 16).then(__webpack_require__.bind(__webpack_require__, 239));
        }
        else {
            await __webpack_require__.e(/* import() */ 17).then(__webpack_require__.bind(__webpack_require__, 240));
        }
    }
    let lodPostProcess;
    if (!texture.isCube) {
        lodPostProcess = new _PostProcesses_postProcess_js__WEBPACK_IMPORTED_MODULE_3__.PostProcess("lod", "lod", {
            uniforms: ["lod", "gamma"],
            samplingMode: _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_0__.Texture.NEAREST_NEAREST_MIPNEAREST,
            engine,
            shaderLanguage: engine.isWebGPU ? 1 /* ShaderLanguage.WGSL */ : 0 /* ShaderLanguage.GLSL */,
        });
    }
    else {
        const faceDefines = ["#define POSITIVEX", "#define NEGATIVEX", "#define POSITIVEY", "#define NEGATIVEY", "#define POSITIVEZ", "#define NEGATIVEZ"];
        lodPostProcess = new _PostProcesses_postProcess_js__WEBPACK_IMPORTED_MODULE_3__.PostProcess("lodCube", "lodCube", {
            uniforms: ["lod", "gamma"],
            samplingMode: _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_0__.Texture.NEAREST_NEAREST_MIPNEAREST,
            engine,
            defines: faceDefines[face],
            shaderLanguage: engine.isWebGPU ? 1 /* ShaderLanguage.WGSL */ : 0 /* ShaderLanguage.GLSL */,
        });
    }
    await new Promise((resolve) => {
        lodPostProcess.onEffectCreatedObservable.addOnce((e) => {
            e.executeWhenCompiled(() => {
                resolve(0);
            });
        });
    });
    const rtt = new _Materials_Textures_renderTargetTexture_js__WEBPACK_IMPORTED_MODULE_1__.RenderTargetTexture("temp", { width: width, height: height }, scene, false);
    lodPostProcess.onApply = function (effect) {
        effect.setTexture("textureSampler", texture);
        effect.setFloat("lod", lod);
        effect.setInt("gamma", texture.gammaSpace ? 1 : 0);
    };
    const internalTexture = texture.getInternalTexture();
    try {
        if (rtt.renderTarget && internalTexture) {
            const samplingMode = internalTexture.samplingMode;
            if (lod !== 0) {
                texture.updateSamplingMode(_Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_0__.Texture.NEAREST_NEAREST_MIPNEAREST);
            }
            else {
                texture.updateSamplingMode(_Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_0__.Texture.NEAREST_NEAREST);
            }
            scene.postProcessManager.directRender([lodPostProcess], rtt.renderTarget, true);
            texture.updateSamplingMode(samplingMode);
            //Reading datas from WebGL
            const bufferView = await engine.readPixels(0, 0, width, height);
            const data = new Uint8Array(bufferView.buffer, 0, bufferView.byteLength);
            // Unbind
            engine.unBindFramebuffer(rtt.renderTarget);
            return data;
        }
        else {
            throw Error("Render to texture failed.");
        }
    }
    finally {
        rtt.dispose();
        lodPostProcess.dispose();
    }
};
/**
 * Gets the data of the specified texture by rendering it to an intermediate RGBA texture and retrieving the bytes from it.
 * This is convienent to get 8-bit RGBA values for a texture in a GPU compressed format.
 * @param texture the source texture
 * @param width the width of the result, which does not have to match the source texture width
 * @param height the height of the result, which does not have to match the source texture height
 * @param face if the texture has multiple faces, the face index to use for the source
 * @param lod if the texture has multiple LODs, the lod index to use for the source
 * @returns the 8-bit texture data
 */
async function GetTextureDataAsync(texture, width, height, face = 0, lod = 0) {
    if (!texture.isReady() && texture._texture) {
        await new Promise((resolve, reject) => {
            if (texture._texture === null) {
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                reject(0);
                return;
            }
            texture._texture.onLoadedObservable.addOnce(() => {
                resolve(0);
            });
        });
    }
    return await ProcessAsync(texture, width, height, face, lod);
}
/**
 * Class used to host texture specific utilities
 */
const TextureTools = {
    /**
     * Uses the GPU to create a copy texture rescaled at a given size
     * @param texture Texture to copy from
     * @param width defines the desired width
     * @param height defines the desired height
     * @param useBilinearMode defines if bilinear mode has to be used
     * @returns the generated texture
     */
    CreateResizedCopy,
    /**
     * Apply a post process to a texture
     * @param postProcessName name of the fragment post process
     * @param internalTexture the texture to encode
     * @param scene the scene hosting the texture
     * @param type type of the output texture. If not provided, use the one from internalTexture
     * @param samplingMode sampling mode to use to sample the source texture. If not provided, use the one from internalTexture
     * @param format format of the output texture. If not provided, use the one from internalTexture
     * @returns a promise with the internalTexture having its texture replaced by the result of the processing
     */
    ApplyPostProcess,
    /**
     * Converts a number to half float
     * @param value number to convert
     * @returns converted number
     */
    ToHalfFloat,
    /**
     * Converts a half float to a number
     * @param value half float to convert
     * @returns converted half float
     */
    FromHalfFloat,
    /**
     * Gets the data of the specified texture by rendering it to an intermediate RGBA texture and retrieving the bytes from it.
     * This is convienent to get 8-bit RGBA values for a texture in a GPU compressed format.
     * @param texture the source texture
     * @param width the width of the result, which does not have to match the source texture width
     * @param height the height of the result, which does not have to match the source texture height
     * @param face if the texture has multiple faces, the face index to use for the source
     * @param channels a filter for which of the RGBA channels to return in the result
     * @param lod if the texture has multiple LODs, the lod index to use for the source
     * @returns the 8-bit texture data
     */
    GetTextureDataAsync,
};
//# sourceMappingURL=textureTools.js.map

/***/ }),

/***/ 198:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderTargetTexture: () => (/* binding */ RenderTargetTexture)
/* harmony export */ });
/* harmony import */ var _Misc_observable_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(11);
/* harmony import */ var _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(196);
/* harmony import */ var _PostProcesses_postProcessManager_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(153);
/* harmony import */ var _Misc_tools_functions_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(56);
/* harmony import */ var _effect_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(42);
/* harmony import */ var _Misc_logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(19);
/* harmony import */ var _Rendering_objectRenderer_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(199);









/**
 * Sets a depth stencil texture from a render target on the engine to be used in the shader.
 * @param channel Name of the sampler variable.
 * @param texture Texture to set.
 */
_effect_js__WEBPACK_IMPORTED_MODULE_5__.Effect.prototype.setDepthStencilTexture = function (channel, texture) {
    this._engine.setDepthStencilTexture(this._samplers[channel], this._uniforms[channel], texture, channel);
};
/**
 * This Helps creating a texture that will be created from a camera in your scene.
 * It is basically a dynamic texture that could be used to create special effects for instance.
 * Actually, It is the base of lot of effects in the framework like post process, shadows, effect layers and rendering pipelines...
 */
class RenderTargetTexture extends _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_2__.Texture {
    /**
     * Use this predicate to dynamically define the list of mesh you want to render.
     * If set, the renderList property will be overwritten.
     */
    get renderListPredicate() {
        return this._objectRenderer.renderListPredicate;
    }
    set renderListPredicate(value) {
        this._objectRenderer.renderListPredicate = value;
    }
    /**
     * Use this list to define the list of mesh you want to render.
     */
    get renderList() {
        return this._objectRenderer.renderList;
    }
    set renderList(value) {
        this._objectRenderer.renderList = value;
    }
    /**
     * Define the list of particle systems to render in the texture. If not provided, will render all the particle systems of the scene.
     * Note that the particle systems are rendered only if renderParticles is set to true.
     */
    get particleSystemList() {
        return this._objectRenderer.particleSystemList;
    }
    set particleSystemList(value) {
        this._objectRenderer.particleSystemList = value;
    }
    /**
     * Use this function to overload the renderList array at rendering time.
     * Return null to render with the current renderList, else return the list of meshes to use for rendering.
     * For 2DArray RTT, layerOrFace is the index of the layer that is going to be rendered, else it is the faceIndex of
     * the cube (if the RTT is a cube, else layerOrFace=0).
     * The renderList passed to the function is the current render list (the one that will be used if the function returns null).
     * The length of this list is passed through renderListLength: don't use renderList.length directly because the array can
     * hold dummy elements!
     */
    get getCustomRenderList() {
        return this._objectRenderer.getCustomRenderList;
    }
    set getCustomRenderList(value) {
        this._objectRenderer.getCustomRenderList = value;
    }
    /**
     * Define if particles should be rendered in your texture (default: true).
     */
    get renderParticles() {
        return this._objectRenderer.renderParticles;
    }
    set renderParticles(value) {
        this._objectRenderer.renderParticles = value;
    }
    /**
     * Define if sprites should be rendered in your texture (default: false).
     */
    get renderSprites() {
        return this._objectRenderer.renderSprites;
    }
    set renderSprites(value) {
        this._objectRenderer.renderSprites = value;
    }
    /**
     * Force checking the layerMask property even if a custom list of meshes is provided (ie. if renderList is not undefined) (default: false).
     */
    get forceLayerMaskCheck() {
        return this._objectRenderer.forceLayerMaskCheck;
    }
    set forceLayerMaskCheck(value) {
        this._objectRenderer.forceLayerMaskCheck = value;
    }
    /**
     * Define the camera used to render the texture.
     */
    get activeCamera() {
        return this._objectRenderer.activeCamera;
    }
    set activeCamera(value) {
        this._objectRenderer.activeCamera = value;
    }
    /**
     * Define the camera used to calculate the LOD of the objects.
     * If not defined, activeCamera will be used. If not defined nor activeCamera, scene's active camera will be used.
     */
    get cameraForLOD() {
        return this._objectRenderer.cameraForLOD;
    }
    set cameraForLOD(value) {
        this._objectRenderer.cameraForLOD = value;
    }
    /**
     * If true, the renderer will render all objects without any image processing applied.
     * If false (default value), the renderer will use the current setting of the scene's image processing configuration.
     */
    get disableImageProcessing() {
        return this._objectRenderer.disableImageProcessing;
    }
    set disableImageProcessing(value) {
        this._objectRenderer.disableImageProcessing = value;
    }
    /**
     * Override the mesh isReady function with your own one.
     */
    get customIsReadyFunction() {
        return this._objectRenderer.customIsReadyFunction;
    }
    set customIsReadyFunction(value) {
        this._objectRenderer.customIsReadyFunction = value;
    }
    /**
     * Override the render function of the texture with your own one.
     */
    get customRenderFunction() {
        return this._objectRenderer.customRenderFunction;
    }
    set customRenderFunction(value) {
        this._objectRenderer.customRenderFunction = value;
    }
    /**
     * Post-processes for this render target
     */
    get postProcesses() {
        return this._postProcesses;
    }
    get _prePassEnabled() {
        return !!this._prePassRenderTarget && this._prePassRenderTarget.enabled;
    }
    /**
     * Set a after unbind callback in the texture.
     * This has been kept for backward compatibility and use of onAfterUnbindObservable is recommended.
     */
    set onAfterUnbind(callback) {
        if (this._onAfterUnbindObserver) {
            this.onAfterUnbindObservable.remove(this._onAfterUnbindObserver);
        }
        this._onAfterUnbindObserver = this.onAfterUnbindObservable.add(callback);
    }
    /**
     * An event triggered before rendering the texture
     */
    get onBeforeRenderObservable() {
        return this._objectRenderer.onBeforeRenderObservable;
    }
    /**
     * Set a before render callback in the texture.
     * This has been kept for backward compatibility and use of onBeforeRenderObservable is recommended.
     */
    set onBeforeRender(callback) {
        if (this._onBeforeRenderObserver) {
            this.onBeforeRenderObservable.remove(this._onBeforeRenderObserver);
        }
        this._onBeforeRenderObserver = this.onBeforeRenderObservable.add(callback);
    }
    /**
     * An event triggered after rendering the texture
     */
    get onAfterRenderObservable() {
        return this._objectRenderer.onAfterRenderObservable;
    }
    /**
     * Set a after render callback in the texture.
     * This has been kept for backward compatibility and use of onAfterRenderObservable is recommended.
     */
    set onAfterRender(callback) {
        if (this._onAfterRenderObserver) {
            this.onAfterRenderObservable.remove(this._onAfterRenderObserver);
        }
        this._onAfterRenderObserver = this.onAfterRenderObservable.add(callback);
    }
    /**
     * Set a clear callback in the texture.
     * This has been kept for backward compatibility and use of onClearObservable is recommended.
     */
    set onClear(callback) {
        if (this._onClearObserver) {
            this.onClearObservable.remove(this._onClearObserver);
        }
        this._onClearObserver = this.onClearObservable.add(callback);
    }
    /** @internal */
    get _waitingRenderList() {
        return this._objectRenderer._waitingRenderList;
    }
    /** @internal */
    set _waitingRenderList(value) {
        this._objectRenderer._waitingRenderList = value;
    }
    /**
     * Current render pass id of the render target texture. Note it can change over the rendering as there's a separate id for each face of a cube / each layer of an array layer!
     */
    get renderPassId() {
        return this._objectRenderer.renderPassId;
    }
    /**
     * Gets the render pass ids used by the render target texture. For a single render target the array length will be 1, for a cube texture it will be 6 and for
     * a 2D texture array it will return an array of ids the size of the 2D texture array
     */
    get renderPassIds() {
        return this._objectRenderer.renderPassIds;
    }
    /**
     * Gets the current value of the refreshId counter
     */
    get currentRefreshId() {
        return this._objectRenderer.currentRefreshId;
    }
    /**
     * Sets a specific material to be used to render a mesh/a list of meshes in this render target texture
     * @param mesh mesh or array of meshes
     * @param material material or array of materials to use for this render pass. If undefined is passed, no specific material will be used but the regular material instead (mesh.material). It's possible to provide an array of materials to use a different material for each rendering in the case of a cube texture (6 rendering) and a 2D texture array (as many rendering as the length of the array)
     */
    setMaterialForRendering(mesh, material) {
        this._objectRenderer.setMaterialForRendering(mesh, material);
    }
    /**
     * Define if the texture has multiple draw buffers or if false a single draw buffer.
     */
    get isMulti() {
        return this._renderTarget?.isMulti ?? false;
    }
    /**
     * Gets render target creation options that were used.
     */
    get renderTargetOptions() {
        return this._renderTargetOptions;
    }
    /**
     * Gets the render target wrapper associated with this render target
     */
    get renderTarget() {
        return this._renderTarget;
    }
    _onRatioRescale() {
        if (this._sizeRatio) {
            this.resize(this._initialSizeParameter);
        }
    }
    /**
     * Gets or sets the size of the bounding box associated with the texture (when in cube mode)
     * When defined, the cubemap will switch to local mode
     * @see https://community.arm.com/graphics/b/blog/posts/reflections-based-on-local-cubemaps-in-unity
     * @example https://www.babylonjs-playground.com/#RNASML
     */
    set boundingBoxSize(value) {
        if (this._boundingBoxSize && this._boundingBoxSize.equals(value)) {
            return;
        }
        this._boundingBoxSize = value;
        const scene = this.getScene();
        if (scene) {
            scene.markAllMaterialsAsDirty(1);
        }
    }
    get boundingBoxSize() {
        return this._boundingBoxSize;
    }
    /**
     * In case the RTT has been created with a depth texture, get the associated
     * depth texture.
     * Otherwise, return null.
     */
    get depthStencilTexture() {
        return this._renderTarget?._depthStencilTexture ?? null;
    }
    /** @internal */
    constructor(name, size, scene, generateMipMaps = false, doNotChangeAspectRatio = true, type = 0, isCube = false, samplingMode = _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_2__.Texture.TRILINEAR_SAMPLINGMODE, generateDepthBuffer = true, generateStencilBuffer = false, isMulti = false, format = 5, delayAllocation = false, samples, creationFlags, noColorAttachment = false, useSRGBBuffer = false) {
        let colorAttachment = undefined;
        let gammaSpace = true;
        let existingObjectRenderer = undefined;
        if (typeof generateMipMaps === "object") {
            const options = generateMipMaps;
            generateMipMaps = !!options.generateMipMaps;
            doNotChangeAspectRatio = options.doNotChangeAspectRatio ?? true;
            type = options.type ?? 0;
            isCube = !!options.isCube;
            samplingMode = options.samplingMode ?? _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_2__.Texture.TRILINEAR_SAMPLINGMODE;
            generateDepthBuffer = options.generateDepthBuffer ?? true;
            generateStencilBuffer = !!options.generateStencilBuffer;
            isMulti = !!options.isMulti;
            format = options.format ?? 5;
            delayAllocation = !!options.delayAllocation;
            samples = options.samples;
            creationFlags = options.creationFlags;
            noColorAttachment = !!options.noColorAttachment;
            useSRGBBuffer = !!options.useSRGBBuffer;
            colorAttachment = options.colorAttachment;
            gammaSpace = options.gammaSpace ?? gammaSpace;
            existingObjectRenderer = options.existingObjectRenderer;
        }
        super(null, scene, !generateMipMaps, undefined, samplingMode, undefined, undefined, undefined, undefined, format);
        /**
         * Define if the camera viewport should be respected while rendering the texture or if the render should be done to the entire texture.
         */
        this.ignoreCameraViewport = false;
        /**
         * An event triggered when the texture is unbind.
         */
        this.onBeforeBindObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_0__.Observable();
        /**
         * An event triggered when the texture is unbind.
         */
        this.onAfterUnbindObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_0__.Observable();
        /**
         * An event triggered after the texture clear
         */
        this.onClearObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_0__.Observable();
        /**
         * An event triggered when the texture is resized.
         */
        this.onResizeObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_0__.Observable();
        /** @internal */
        this._cleared = false;
        /**
         * Skip the initial clear of the rtt at the beginning of the frame render loop
         */
        this.skipInitialClear = false;
        this._samples = 1;
        this._canRescale = true;
        this._renderTarget = null;
        this._dontDisposeObjectRenderer = false;
        /**
         * Gets or sets the center of the bounding box associated with the texture (when in cube mode)
         * It must define where the camera used to render the texture is set
         */
        this.boundingBoxPosition = _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_1__.Vector3.Zero();
        /** @internal */
        this._disableEngineStages = false; // TODO: remove this when the shadow generator task (frame graph) is reworked (see https://github.com/BabylonJS/Babylon.js/pull/15962#discussion_r1874417607)
        this._dumpToolsLoading = false;
        scene = this.getScene();
        if (!scene) {
            return;
        }
        const engine = this.getScene().getEngine();
        this._gammaSpace = gammaSpace;
        this._coordinatesMode = _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_2__.Texture.PROJECTION_MODE;
        this.name = name;
        this.isRenderTarget = true;
        this._initialSizeParameter = size;
        this._dontDisposeObjectRenderer = !!existingObjectRenderer;
        this._processSizeParameter(size);
        this._objectRenderer =
            existingObjectRenderer ??
                new _Rendering_objectRenderer_js__WEBPACK_IMPORTED_MODULE_7__.ObjectRenderer(name, scene, {
                    numPasses: isCube ? 6 : this.getRenderLayers() || 1,
                    doNotChangeAspectRatio,
                });
        this._onBeforeRenderingManagerRenderObserver = this._objectRenderer.onBeforeRenderingManagerRenderObservable.add(() => {
            // Before clear
            if (!this._disableEngineStages) {
                for (const step of this._scene._beforeRenderTargetClearStage) {
                    step.action(this, this._currentFaceIndex, this._currentLayer);
                }
            }
            // Clear
            if (this.onClearObservable.hasObservers()) {
                this.onClearObservable.notifyObservers(engine);
            }
            else if (!this.skipInitialClear) {
                engine.clear(this.clearColor || this._scene.clearColor, true, true, true);
            }
            if (!this._doNotChangeAspectRatio) {
                this._scene.updateTransformMatrix(true);
            }
            // Before Camera Draw
            if (!this._disableEngineStages) {
                for (const step of this._scene._beforeRenderTargetDrawStage) {
                    step.action(this, this._currentFaceIndex, this._currentLayer);
                }
            }
        });
        this._onAfterRenderingManagerRenderObserver = this._objectRenderer.onAfterRenderingManagerRenderObservable.add(() => {
            // After Camera Draw
            if (!this._disableEngineStages) {
                for (const step of this._scene._afterRenderTargetDrawStage) {
                    step.action(this, this._currentFaceIndex, this._currentLayer);
                }
            }
            const saveGenerateMipMaps = this._texture?.generateMipMaps ?? false;
            if (this._texture) {
                this._texture.generateMipMaps = false; // if left true, the mipmaps will be generated (if this._texture.generateMipMaps = true) when the first post process binds its own RTT: by doing so it will unbind the current RTT,
                // which will trigger a mipmap generation. We don't want this because it's a wasted work, we will do an unbind of the current RTT at the end of the process (see unbindFrameBuffer) which will
                // trigger the generation of the final mipmaps
            }
            if (this._postProcessManager) {
                this._postProcessManager._finalizeFrame(false, this._renderTarget ?? undefined, this._currentFaceIndex, this._postProcesses, this.ignoreCameraViewport);
            }
            else if (this._currentUseCameraPostProcess) {
                this._scene.postProcessManager._finalizeFrame(false, this._renderTarget ?? undefined, this._currentFaceIndex);
            }
            if (!this._disableEngineStages) {
                for (const step of this._scene._afterRenderTargetPostProcessStage) {
                    step.action(this, this._currentFaceIndex, this._currentLayer);
                }
            }
            if (this._texture) {
                this._texture.generateMipMaps = saveGenerateMipMaps;
            }
            if (!this._doNotChangeAspectRatio) {
                this._scene.updateTransformMatrix(true);
            }
            // Dump ?
            if (this._currentDumpForDebug) {
                if (!this._dumpTools) {
                    _Misc_logger_js__WEBPACK_IMPORTED_MODULE_6__.Logger.Error("dumpTools module is still being loaded. To speed up the process import dump tools directly in your project");
                }
                else {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    this._dumpTools.DumpFramebuffer(this.getRenderWidth(), this.getRenderHeight(), engine);
                }
            }
        });
        this._onFastPathRenderObserver = this._objectRenderer.onFastPathRenderObservable.add(() => {
            if (this.onClearObservable.hasObservers()) {
                this.onClearObservable.notifyObservers(engine);
            }
            else {
                if (!this.skipInitialClear) {
                    engine.clear(this.clearColor || this._scene.clearColor, true, true, true);
                }
            }
        });
        this._resizeObserver = engine.onResizeObservable.add(() => { });
        this._generateMipMaps = generateMipMaps ? true : false;
        this._doNotChangeAspectRatio = doNotChangeAspectRatio;
        if (isMulti) {
            return;
        }
        this._renderTargetOptions = {
            generateMipMaps: generateMipMaps,
            type: type,
            format: this._format ?? undefined,
            samplingMode: this.samplingMode,
            generateDepthBuffer: generateDepthBuffer,
            generateStencilBuffer: generateStencilBuffer,
            samples,
            creationFlags,
            noColorAttachment: noColorAttachment,
            useSRGBBuffer,
            colorAttachment: colorAttachment,
            label: this.name,
        };
        if (this.samplingMode === _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_2__.Texture.NEAREST_SAMPLINGMODE) {
            this.wrapU = _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_2__.Texture.CLAMP_ADDRESSMODE;
            this.wrapV = _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_2__.Texture.CLAMP_ADDRESSMODE;
        }
        if (!delayAllocation) {
            if (isCube) {
                this._renderTarget = scene.getEngine().createRenderTargetCubeTexture(this.getRenderSize(), this._renderTargetOptions);
                this.coordinatesMode = _Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_2__.Texture.INVCUBIC_MODE;
                this._textureMatrix = _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_1__.Matrix.Identity();
            }
            else {
                this._renderTarget = scene.getEngine().createRenderTargetTexture(this._size, this._renderTargetOptions);
            }
            this._texture = this._renderTarget.texture;
            if (samples !== undefined) {
                this.samples = samples;
            }
        }
    }
    /**
     * Creates a depth stencil texture.
     * This is only available in WebGL 2 or with the depth texture extension available.
     * @param comparisonFunction Specifies the comparison function to set on the texture. If 0 or undefined, the texture is not in comparison mode (default: 0)
     * @param bilinearFiltering Specifies whether or not bilinear filtering is enable on the texture (default: true)
     * @param generateStencil Specifies whether or not a stencil should be allocated in the texture (default: false)
     * @param samples sample count of the depth/stencil texture (default: 1)
     * @param format format of the depth texture (default: 14)
     * @param label defines the label of the texture (for debugging purpose)
     */
    createDepthStencilTexture(comparisonFunction = 0, bilinearFiltering = true, generateStencil = false, samples = 1, format = 14, label) {
        this._renderTarget?.createDepthStencilTexture(comparisonFunction, bilinearFiltering, generateStencil, samples, format, label);
    }
    _processSizeParameter(size) {
        if (size.ratio) {
            this._sizeRatio = size.ratio;
            const engine = this._getEngine();
            this._size = {
                width: this._bestReflectionRenderTargetDimension(engine.getRenderWidth(), this._sizeRatio),
                height: this._bestReflectionRenderTargetDimension(engine.getRenderHeight(), this._sizeRatio),
            };
        }
        else {
            this._size = size;
        }
    }
    /**
     * Define the number of samples to use in case of MSAA.
     * It defaults to one meaning no MSAA has been enabled.
     */
    get samples() {
        return this._renderTarget?.samples ?? this._samples;
    }
    set samples(value) {
        if (this._renderTarget) {
            this._samples = this._renderTarget.setSamples(value);
        }
    }
    /**
     * Adds a post process to the render target rendering passes.
     * @param postProcess define the post process to add
     */
    addPostProcess(postProcess) {
        if (!this._postProcessManager) {
            const scene = this.getScene();
            if (!scene) {
                return;
            }
            this._postProcessManager = new _PostProcesses_postProcessManager_js__WEBPACK_IMPORTED_MODULE_3__.PostProcessManager(scene);
            this._postProcesses = new Array();
        }
        this._postProcesses.push(postProcess);
        this._postProcesses[0].autoClear = false;
    }
    /**
     * Clear all the post processes attached to the render target
     * @param dispose define if the cleared post processes should also be disposed (false by default)
     */
    clearPostProcesses(dispose = false) {
        if (!this._postProcesses) {
            return;
        }
        if (dispose) {
            for (const postProcess of this._postProcesses) {
                postProcess.dispose();
            }
        }
        this._postProcesses = [];
    }
    /**
     * Remove one of the post process from the list of attached post processes to the texture
     * @param postProcess define the post process to remove from the list
     */
    removePostProcess(postProcess) {
        if (!this._postProcesses) {
            return;
        }
        const index = this._postProcesses.indexOf(postProcess);
        if (index === -1) {
            return;
        }
        this._postProcesses.splice(index, 1);
        if (this._postProcesses.length > 0) {
            this._postProcesses[0].autoClear = false;
        }
    }
    /**
     * Resets the refresh counter of the texture and start bak from scratch.
     * Could be useful to regenerate the texture if it is setup to render only once.
     */
    resetRefreshCounter() {
        this._objectRenderer.resetRefreshCounter();
    }
    /**
     * Define the refresh rate of the texture or the rendering frequency.
     * Use 0 to render just once, 1 to render on every frame, 2 to render every two frames and so on...
     */
    get refreshRate() {
        return this._objectRenderer.refreshRate;
    }
    set refreshRate(value) {
        this._objectRenderer.refreshRate = value;
    }
    /** @internal */
    _shouldRender() {
        return this._objectRenderer.shouldRender();
    }
    /**
     * Gets the actual render size of the texture.
     * @returns the width of the render size
     */
    getRenderSize() {
        return this.getRenderWidth();
    }
    /**
     * Gets the actual render width of the texture.
     * @returns the width of the render size
     */
    getRenderWidth() {
        if (this._size.width) {
            return this._size.width;
        }
        return this._size;
    }
    /**
     * Gets the actual render height of the texture.
     * @returns the height of the render size
     */
    getRenderHeight() {
        if (this._size.width) {
            return this._size.height;
        }
        return this._size;
    }
    /**
     * Gets the actual number of layers of the texture or, in the case of a 3D texture, return the depth.
     * @returns the number of layers
     */
    getRenderLayers() {
        const layers = this._size.layers;
        if (layers) {
            return layers;
        }
        const depth = this._size.depth;
        if (depth) {
            return depth;
        }
        return 0;
    }
    /**
     * Don't allow this render target texture to rescale. Mainly used to prevent rescaling by the scene optimizer.
     */
    disableRescaling() {
        this._canRescale = false;
    }
    /**
     * Get if the texture can be rescaled or not.
     */
    get canRescale() {
        return this._canRescale;
    }
    /**
     * Resize the texture using a ratio.
     * @param ratio the ratio to apply to the texture size in order to compute the new target size
     */
    scale(ratio) {
        const newSize = Math.max(1, this.getRenderSize() * ratio);
        this.resize(newSize);
    }
    /**
     * Get the texture reflection matrix used to rotate/transform the reflection.
     * @returns the reflection matrix
     */
    getReflectionTextureMatrix() {
        if (this.isCube) {
            return this._textureMatrix;
        }
        return super.getReflectionTextureMatrix();
    }
    /**
     * Resize the texture to a new desired size.
     * Be careful as it will recreate all the data in the new texture.
     * @param size Define the new size. It can be:
     *   - a number for squared texture,
     *   - an object containing { width: number, height: number }
     *   - or an object containing a ratio { ratio: number }
     */
    resize(size) {
        const wasCube = this.isCube;
        this._renderTarget?.dispose();
        this._renderTarget = null;
        const scene = this.getScene();
        if (!scene) {
            return;
        }
        this._processSizeParameter(size);
        if (wasCube) {
            this._renderTarget = scene.getEngine().createRenderTargetCubeTexture(this.getRenderSize(), this._renderTargetOptions);
        }
        else {
            this._renderTarget = scene.getEngine().createRenderTargetTexture(this._size, this._renderTargetOptions);
        }
        this._texture = this._renderTarget.texture;
        if (this._renderTargetOptions.samples !== undefined) {
            this.samples = this._renderTargetOptions.samples;
        }
        if (this.onResizeObservable.hasObservers()) {
            this.onResizeObservable.notifyObservers(this);
        }
    }
    /**
     * Renders all the objects from the render list into the texture.
     * @param useCameraPostProcess Define if camera post processes should be used during the rendering
     * @param dumpForDebug Define if the rendering result should be dumped (copied) for debugging purpose
     */
    render(useCameraPostProcess = false, dumpForDebug = false) {
        this._render(useCameraPostProcess, dumpForDebug);
    }
    /**
     * This function will check if the render target texture can be rendered (textures are loaded, shaders are compiled)
     * @returns true if all required resources are ready
     */
    isReadyForRendering() {
        if (!this._dumpToolsLoading) {
            this._dumpToolsLoading = true;
            // avoid a static import to allow ignoring the import in some cases
            // eslint-disable-next-line @typescript-eslint/no-floating-promises, github/no-then
            __webpack_require__.e(/* import() */ 8).then(__webpack_require__.bind(__webpack_require__, 213)).then((module) => (this._dumpTools = module));
        }
        this._objectRenderer.prepareRenderList();
        this.onBeforeBindObservable.notifyObservers(this);
        this._objectRenderer.initRender(this.getRenderWidth(), this.getRenderHeight());
        const isReady = this._objectRenderer._checkReadiness();
        this.onAfterUnbindObservable.notifyObservers(this);
        this._objectRenderer.finishRender();
        return isReady;
    }
    _render(useCameraPostProcess = false, dumpForDebug = false) {
        const scene = this.getScene();
        if (!scene) {
            return;
        }
        if (this.useCameraPostProcesses !== undefined) {
            useCameraPostProcess = this.useCameraPostProcesses;
        }
        this._objectRenderer.prepareRenderList();
        this.onBeforeBindObservable.notifyObservers(this);
        this._objectRenderer.initRender(this.getRenderWidth(), this.getRenderHeight());
        if ((this.is2DArray || this.is3D) && !this.isMulti) {
            for (let layer = 0; layer < this.getRenderLayers(); layer++) {
                this._renderToTarget(0, useCameraPostProcess, dumpForDebug, layer);
                scene.incrementRenderId();
                scene.resetCachedMaterial();
            }
        }
        else if (this.isCube && !this.isMulti) {
            for (let face = 0; face < 6; face++) {
                this._renderToTarget(face, useCameraPostProcess, dumpForDebug);
                scene.incrementRenderId();
                scene.resetCachedMaterial();
            }
        }
        else {
            this._renderToTarget(0, useCameraPostProcess, dumpForDebug);
        }
        this.onAfterUnbindObservable.notifyObservers(this);
        this._objectRenderer.finishRender();
    }
    _bestReflectionRenderTargetDimension(renderDimension, scale) {
        const minimum = 128;
        const x = renderDimension * scale;
        const curved = (0,_Misc_tools_functions_js__WEBPACK_IMPORTED_MODULE_4__.NearestPOT)(x + (minimum * minimum) / (minimum + x));
        // Ensure we don't exceed the render dimension (while staying POT)
        return Math.min((0,_Misc_tools_functions_js__WEBPACK_IMPORTED_MODULE_4__.FloorPOT)(renderDimension), curved);
    }
    /**
     * @internal
     * @param faceIndex face index to bind to if this is a cubetexture
     * @param layer defines the index of the texture to bind in the array
     */
    _bindFrameBuffer(faceIndex = 0, layer = 0) {
        const scene = this.getScene();
        if (!scene) {
            return;
        }
        const engine = scene.getEngine();
        if (this._renderTarget) {
            engine.bindFramebuffer(this._renderTarget, this.isCube ? faceIndex : undefined, undefined, undefined, this.ignoreCameraViewport, 0, layer);
        }
    }
    _unbindFrameBuffer(engine, faceIndex) {
        if (!this._renderTarget) {
            return;
        }
        engine.unBindFramebuffer(this._renderTarget, this.isCube, () => {
            this.onAfterRenderObservable.notifyObservers(faceIndex);
        });
    }
    /**
     * @internal
     */
    _prepareFrame(scene, faceIndex, layer, useCameraPostProcess) {
        if (this._postProcessManager) {
            if (!this._prePassEnabled) {
                if (!this._postProcessManager._prepareFrame(this._texture, this._postProcesses)) {
                    this._bindFrameBuffer(faceIndex, layer);
                }
            }
        }
        else if (!useCameraPostProcess || !scene.postProcessManager._prepareFrame(this._texture)) {
            this._bindFrameBuffer(faceIndex, layer);
        }
    }
    _renderToTarget(faceIndex, useCameraPostProcess, dumpForDebug, layer = 0) {
        const scene = this.getScene();
        if (!scene) {
            return;
        }
        const engine = scene.getEngine();
        this._currentFaceIndex = faceIndex;
        this._currentLayer = layer;
        this._currentUseCameraPostProcess = useCameraPostProcess;
        this._currentDumpForDebug = dumpForDebug;
        this._prepareFrame(scene, faceIndex, layer, useCameraPostProcess);
        engine._debugPushGroup?.(`render to face #${faceIndex} layer #${layer}`, 2);
        this._objectRenderer.render(faceIndex + layer, true); // only faceIndex or layer (if any) will be different from 0 (we don't support array of cubes), so it's safe to add them to get the pass index
        engine._debugPopGroup?.(2);
        this._unbindFrameBuffer(engine, faceIndex);
        if (this._texture && this.isCube && faceIndex === 5) {
            engine.generateMipMapsForCubemap(this._texture, true);
        }
    }
    /**
     * Overrides the default sort function applied in the rendering group to prepare the meshes.
     * This allowed control for front to back rendering or reversely depending of the special needs.
     *
     * @param renderingGroupId The rendering group id corresponding to its index
     * @param opaqueSortCompareFn The opaque queue comparison function use to sort.
     * @param alphaTestSortCompareFn The alpha test queue comparison function use to sort.
     * @param transparentSortCompareFn The transparent queue comparison function use to sort.
     */
    setRenderingOrder(renderingGroupId, opaqueSortCompareFn = null, alphaTestSortCompareFn = null, transparentSortCompareFn = null) {
        this._objectRenderer.setRenderingOrder(renderingGroupId, opaqueSortCompareFn, alphaTestSortCompareFn, transparentSortCompareFn);
    }
    /**
     * Specifies whether or not the stencil and depth buffer are cleared between two rendering groups.
     *
     * @param renderingGroupId The rendering group id corresponding to its index
     * @param autoClearDepthStencil Automatically clears depth and stencil between groups if true.
     */
    setRenderingAutoClearDepthStencil(renderingGroupId, autoClearDepthStencil) {
        this._objectRenderer.setRenderingAutoClearDepthStencil(renderingGroupId, autoClearDepthStencil);
    }
    /**
     * Clones the texture.
     * @returns the cloned texture
     */
    clone() {
        const textureSize = this.getSize();
        const newTexture = new RenderTargetTexture(this.name, textureSize, this.getScene(), this._renderTargetOptions.generateMipMaps, this._doNotChangeAspectRatio, this._renderTargetOptions.type, this.isCube, this._renderTargetOptions.samplingMode, this._renderTargetOptions.generateDepthBuffer, this._renderTargetOptions.generateStencilBuffer, undefined, this._renderTargetOptions.format, undefined, this._renderTargetOptions.samples);
        // Base texture
        newTexture.hasAlpha = this.hasAlpha;
        newTexture.level = this.level;
        // RenderTarget Texture
        newTexture.coordinatesMode = this.coordinatesMode;
        if (this.renderList) {
            newTexture.renderList = this.renderList.slice(0);
        }
        return newTexture;
    }
    /**
     * Serialize the texture to a JSON representation we can easily use in the respective Parse function.
     * @returns The JSON representation of the texture
     */
    serialize() {
        if (!this.name) {
            return null;
        }
        const serializationObject = super.serialize();
        serializationObject.renderTargetSize = this.getRenderSize();
        serializationObject.renderList = [];
        if (this.renderList) {
            for (let index = 0; index < this.renderList.length; index++) {
                serializationObject.renderList.push(this.renderList[index].id);
            }
        }
        return serializationObject;
    }
    /**
     *  This will remove the attached framebuffer objects. The texture will not be able to be used as render target anymore
     */
    disposeFramebufferObjects() {
        this._renderTarget?.dispose(true);
    }
    /**
     * Release and destroy the underlying lower level texture aka internalTexture.
     */
    releaseInternalTexture() {
        this._renderTarget?.releaseTextures();
        this._texture = null;
    }
    /**
     * Dispose the texture and release its associated resources.
     */
    dispose() {
        this.onResizeObservable.clear();
        this.onClearObservable.clear();
        this.onAfterUnbindObservable.clear();
        this.onBeforeBindObservable.clear();
        if (this._postProcessManager) {
            this._postProcessManager.dispose();
            this._postProcessManager = null;
        }
        if (this._prePassRenderTarget) {
            this._prePassRenderTarget.dispose();
        }
        this._objectRenderer.onBeforeRenderingManagerRenderObservable.remove(this._onBeforeRenderingManagerRenderObserver);
        this._objectRenderer.onAfterRenderingManagerRenderObservable.remove(this._onAfterRenderingManagerRenderObserver);
        this._objectRenderer.onFastPathRenderObservable.remove(this._onFastPathRenderObserver);
        if (!this._dontDisposeObjectRenderer) {
            this._objectRenderer.dispose();
        }
        this.clearPostProcesses(true);
        if (this._resizeObserver) {
            this.getScene().getEngine().onResizeObservable.remove(this._resizeObserver);
            this._resizeObserver = null;
        }
        // Remove from custom render targets
        const scene = this.getScene();
        if (!scene) {
            return;
        }
        let index = scene.customRenderTargets.indexOf(this);
        if (index >= 0) {
            scene.customRenderTargets.splice(index, 1);
        }
        for (const camera of scene.cameras) {
            index = camera.customRenderTargets.indexOf(this);
            if (index >= 0) {
                camera.customRenderTargets.splice(index, 1);
            }
        }
        this._renderTarget?.dispose();
        this._renderTarget = null;
        this._texture = null;
        super.dispose();
    }
    /** @internal */
    _rebuild() {
        this._objectRenderer._rebuild();
        if (this._postProcessManager) {
            this._postProcessManager._rebuild();
        }
    }
    /**
     * Clear the info related to rendering groups preventing retention point in material dispose.
     */
    freeRenderingGroups() {
        this._objectRenderer.freeRenderingGroups();
    }
    /**
     * Gets the number of views the corresponding to the texture (eg. a MultiviewRenderTarget will have > 1)
     * @returns the view count
     */
    getViewCount() {
        return 1;
    }
}
/**
 * The texture will only be rendered once which can be useful to improve performance if everything in your render is static for instance.
 */
RenderTargetTexture.REFRESHRATE_RENDER_ONCE = _Rendering_objectRenderer_js__WEBPACK_IMPORTED_MODULE_7__.ObjectRenderer.REFRESHRATE_RENDER_ONCE;
/**
 * The texture will be rendered every frame and is recommended for dynamic contents.
 */
RenderTargetTexture.REFRESHRATE_RENDER_ONEVERYFRAME = _Rendering_objectRenderer_js__WEBPACK_IMPORTED_MODULE_7__.ObjectRenderer.REFRESHRATE_RENDER_ONEVERYFRAME;
/**
 * The texture will be rendered every 2 frames which could be enough if your dynamic objects are not
 * the central point of your effect and can save a lot of performances.
 */
RenderTargetTexture.REFRESHRATE_RENDER_ONEVERYTWOFRAMES = _Rendering_objectRenderer_js__WEBPACK_IMPORTED_MODULE_7__.ObjectRenderer.REFRESHRATE_RENDER_ONEVERYTWOFRAMES;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_Materials_Textures_texture_js__WEBPACK_IMPORTED_MODULE_2__.Texture._CreateRenderTargetTexture = (name, renderTargetSize, scene, generateMipMaps, creationFlags) => {
    return new RenderTargetTexture(name, renderTargetSize, scene, generateMipMaps);
};
//# sourceMappingURL=renderTargetTexture.js.map

/***/ }),

/***/ 199:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ObjectRenderer: () => (/* binding */ ObjectRenderer)
/* harmony export */ });
/* harmony import */ var _Misc_observable_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(11);
/* harmony import */ var _Rendering_renderingManager_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(154);
/* harmony import */ var _Misc_arrayTools_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7);




/**
 * A class that renders objects to the currently bound render target.
 * This class only renders objects, and is not concerned with the output texture or post-processing.
 */
class ObjectRenderer {
    /**
     * Use this list to define the list of mesh you want to render.
     */
    get renderList() {
        return this._renderList;
    }
    set renderList(value) {
        if (this._renderList === value) {
            return;
        }
        if (this._unObserveRenderList) {
            this._unObserveRenderList();
            this._unObserveRenderList = null;
        }
        if (value) {
            this._unObserveRenderList = (0,_Misc_arrayTools_js__WEBPACK_IMPORTED_MODULE_2__._ObserveArray)(value, this._renderListHasChanged);
        }
        this._renderList = value;
    }
    /**
     * If true, the object renderer will render all objects without any image processing applied.
     * If false (default value), the renderer will use the current setting of the scene's image processing configuration.
     */
    get disableImageProcessing() {
        return this._disableImageProcessing;
    }
    set disableImageProcessing(value) {
        if (value === this._disableImageProcessing) {
            return;
        }
        this._disableImageProcessing = value;
        this._scene.markAllMaterialsAsDirty(64);
    }
    /**
     * Friendly name of the object renderer
     */
    get name() {
        return this._name;
    }
    set name(value) {
        if (this._name === value) {
            return;
        }
        this._name = value;
        if (!this._scene) {
            return;
        }
        const engine = this._scene.getEngine();
        for (let i = 0; i < this._renderPassIds.length; ++i) {
            const renderPassId = this._renderPassIds[i];
            engine._renderPassNames[renderPassId] = `${this._name}#${i}`;
        }
    }
    /**
     * Gets the render pass ids used by the object renderer.
     */
    get renderPassIds() {
        return this._renderPassIds;
    }
    /**
     * Gets the current value of the refreshId counter
     */
    get currentRefreshId() {
        return this._currentRefreshId;
    }
    /**
     * Sets a specific material to be used to render a mesh/a list of meshes with this object renderer
     * @param mesh mesh or array of meshes
     * @param material material or array of materials to use for this render pass. If undefined is passed, no specific material will be used but the regular material instead (mesh.material). It's possible to provide an array of materials to use a different material for each rendering pass.
     */
    setMaterialForRendering(mesh, material) {
        let meshes;
        if (!Array.isArray(mesh)) {
            meshes = [mesh];
        }
        else {
            meshes = mesh;
        }
        for (let j = 0; j < meshes.length; ++j) {
            for (let i = 0; i < this.options.numPasses; ++i) {
                let mesh = meshes[j];
                if (meshes[j].isAnInstance) {
                    mesh = meshes[j].sourceMesh;
                }
                mesh.setMaterialForRenderPass(this._renderPassIds[i], material !== undefined ? (Array.isArray(material) ? material[i] : material) : undefined);
            }
        }
    }
    /**
     * Instantiates an object renderer.
     * @param name The friendly name of the object renderer
     * @param scene The scene the renderer belongs to
     * @param options The options used to create the renderer (optional)
     */
    constructor(name, scene, options) {
        this._unObserveRenderList = null;
        this._renderListHasChanged = (_functionName, previousLength) => {
            const newLength = this._renderList ? this._renderList.length : 0;
            if ((previousLength === 0 && newLength > 0) || newLength === 0) {
                for (const mesh of this._scene.meshes) {
                    mesh._markSubMeshesAsLightDirty();
                }
            }
        };
        /**
         * Define the list of particle systems to render. If not provided, will render all the particle systems of the scene.
         * Note that the particle systems are rendered only if renderParticles is set to true.
         */
        this.particleSystemList = null;
        /**
         * Use this function to overload the renderList array at rendering time.
         * Return null to render with the current renderList, else return the list of meshes to use for rendering.
         * For 2DArray, layerOrFace is the index of the layer that is going to be rendered, else it is the faceIndex of
         * the cube (if the RTT is a cube, else layerOrFace=0).
         * The renderList passed to the function is the current render list (the one that will be used if the function returns null).
         * The length of this list is passed through renderListLength: don't use renderList.length directly because the array can
         * hold dummy elements!
         */
        this.getCustomRenderList = null;
        /**
         * Define if particles should be rendered.
         */
        this.renderParticles = true;
        /**
         * Define if sprites should be rendered.
         */
        this.renderSprites = false;
        /**
         * Force checking the layerMask property even if a custom list of meshes is provided (ie. if renderList is not undefined)
         */
        this.forceLayerMaskCheck = false;
        this._disableImageProcessing = false;
        /**
         * An event triggered before rendering the objects
         */
        this.onBeforeRenderObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_0__.Observable();
        /**
         * An event triggered after rendering the objects
         */
        this.onAfterRenderObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_0__.Observable();
        /**
         * An event triggered before the rendering group is processed
         */
        this.onBeforeRenderingManagerRenderObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_0__.Observable();
        /**
         * An event triggered after the rendering group is processed
         */
        this.onAfterRenderingManagerRenderObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_0__.Observable();
        /**
         * An event triggered when fast path rendering is used
         */
        this.onFastPathRenderObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_0__.Observable();
        this._currentRefreshId = -1;
        this._refreshRate = 1;
        this._currentApplyByPostProcessSetting = false;
        this._currentSceneCamera = null;
        this.name = name;
        this._scene = scene;
        this.renderList = [];
        this._renderPassIds = [];
        this.options = {
            numPasses: 1,
            doNotChangeAspectRatio: true,
            ...options,
        };
        this._createRenderPassId();
        this.renderPassId = this._renderPassIds[0];
        // Rendering groups
        this._renderingManager = new _Rendering_renderingManager_js__WEBPACK_IMPORTED_MODULE_1__.RenderingManager(scene);
        this._renderingManager._useSceneAutoClearSetup = true;
    }
    _releaseRenderPassId() {
        const engine = this._scene.getEngine();
        for (let i = 0; i < this.options.numPasses; ++i) {
            engine.releaseRenderPassId(this._renderPassIds[i]);
        }
        this._renderPassIds.length = 0;
    }
    _createRenderPassId() {
        this._releaseRenderPassId();
        const engine = this._scene.getEngine();
        for (let i = 0; i < this.options.numPasses; ++i) {
            this._renderPassIds[i] = engine.createRenderPassId(`${this.name}#${i}`);
        }
    }
    /**
     * Resets the refresh counter of the renderer and start back from scratch.
     * Could be useful to re-render if it is setup to render only once.
     */
    resetRefreshCounter() {
        this._currentRefreshId = -1;
    }
    /**
     * Defines the refresh rate of the rendering or the rendering frequency.
     * Use 0 to render just once, 1 to render on every frame, 2 to render every two frames and so on...
     */
    get refreshRate() {
        return this._refreshRate;
    }
    set refreshRate(value) {
        this._refreshRate = value;
        this.resetRefreshCounter();
    }
    /**
     * Indicates if the renderer should render the current frame.
     * The output is based on the specified refresh rate.
     * @returns true if the renderer should render the current frame
     */
    shouldRender() {
        if (this._currentRefreshId === -1) {
            // At least render once
            this._currentRefreshId = 1;
            return true;
        }
        if (this.refreshRate === this._currentRefreshId) {
            this._currentRefreshId = 1;
            return true;
        }
        this._currentRefreshId++;
        return false;
    }
    /**
     * This function will check if the renderer is ready to render (textures are loaded, shaders are compiled)
     * @param viewportWidth defines the width of the viewport
     * @param viewportHeight defines the height of the viewport
     * @returns true if all required resources are ready
     */
    isReadyForRendering(viewportWidth, viewportHeight) {
        this.prepareRenderList();
        this.initRender(viewportWidth, viewportHeight);
        const isReady = this._checkReadiness();
        this.finishRender();
        return isReady;
    }
    /**
     * Makes sure the list of meshes is ready to be rendered
     * You should call this function before "initRender", but if you know the render list is ok, you may call "initRender" directly
     */
    prepareRenderList() {
        const scene = this._scene;
        if (this._waitingRenderList) {
            if (!this.renderListPredicate) {
                this.renderList = [];
                for (let index = 0; index < this._waitingRenderList.length; index++) {
                    const id = this._waitingRenderList[index];
                    const mesh = scene.getMeshById(id);
                    if (mesh) {
                        this.renderList.push(mesh);
                    }
                }
            }
            this._waitingRenderList = undefined;
        }
        // Is predicate defined?
        if (this.renderListPredicate) {
            if (this.renderList) {
                this.renderList.length = 0; // Clear previous renderList
            }
            else {
                this.renderList = [];
            }
            const sceneMeshes = this._scene.meshes;
            for (let index = 0; index < sceneMeshes.length; index++) {
                const mesh = sceneMeshes[index];
                if (this.renderListPredicate(mesh)) {
                    this.renderList.push(mesh);
                }
            }
        }
        this._currentApplyByPostProcessSetting = this._scene.imageProcessingConfiguration.applyByPostProcess;
        if (this._disableImageProcessing) {
            // we do not use the applyByPostProcess setter to avoid flagging all the materials as "image processing dirty"!
            this._scene.imageProcessingConfiguration._applyByPostProcess = this._disableImageProcessing;
        }
    }
    /**
     * This method makes sure everything is setup before "render" can be called
     * @param viewportWidth Width of the viewport to render to
     * @param viewportHeight Height of the viewport to render to
     */
    initRender(viewportWidth, viewportHeight) {
        const engine = this._scene.getEngine();
        const camera = this.activeCamera ?? this._scene.activeCamera;
        this._currentSceneCamera = this._scene.activeCamera;
        if (camera) {
            if (camera !== this._scene.activeCamera) {
                this._scene.setTransformMatrix(camera.getViewMatrix(), camera.getProjectionMatrix(true));
                this._scene.activeCamera = camera;
            }
            engine.setViewport(camera.rigParent ? camera.rigParent.viewport : camera.viewport, viewportWidth, viewportHeight);
        }
        this._defaultRenderListPrepared = false;
    }
    /**
     * This method must be called after the "render" call(s), to complete the rendering process.
     */
    finishRender() {
        const scene = this._scene;
        if (this._disableImageProcessing) {
            scene.imageProcessingConfiguration._applyByPostProcess = this._currentApplyByPostProcessSetting;
        }
        scene.activeCamera = this._currentSceneCamera;
        if (this._currentSceneCamera) {
            if (this.activeCamera && this.activeCamera !== scene.activeCamera) {
                scene.setTransformMatrix(this._currentSceneCamera.getViewMatrix(), this._currentSceneCamera.getProjectionMatrix(true));
            }
            scene.getEngine().setViewport(this._currentSceneCamera.viewport);
        }
        scene.resetCachedMaterial();
    }
    /**
     * Renders all the objects (meshes, particles systems, sprites) to the currently bound render target texture.
     * @param passIndex defines the pass index to use (default: 0)
     * @param skipOnAfterRenderObservable defines a flag to skip raising the onAfterRenderObservable
     */
    render(passIndex = 0, skipOnAfterRenderObservable = false) {
        const scene = this._scene;
        const engine = scene.getEngine();
        const currentRenderPassId = engine.currentRenderPassId;
        engine.currentRenderPassId = this._renderPassIds[passIndex];
        this.onBeforeRenderObservable.notifyObservers(passIndex);
        const fastPath = engine.snapshotRendering && engine.snapshotRenderingMode === 1;
        if (!fastPath) {
            // Get the list of meshes to render
            let currentRenderList = null;
            const defaultRenderList = this.renderList ? this.renderList : scene.getActiveMeshes().data;
            const defaultRenderListLength = this.renderList ? this.renderList.length : scene.getActiveMeshes().length;
            if (this.getCustomRenderList) {
                currentRenderList = this.getCustomRenderList(passIndex, defaultRenderList, defaultRenderListLength);
            }
            if (!currentRenderList) {
                // No custom render list provided, we prepare the rendering for the default list, but check
                // first if we did not already performed the preparation before so as to avoid re-doing it several times
                if (!this._defaultRenderListPrepared) {
                    this._prepareRenderingManager(defaultRenderList, defaultRenderListLength, !this.renderList || this.forceLayerMaskCheck);
                    this._defaultRenderListPrepared = true;
                }
                currentRenderList = defaultRenderList;
            }
            else {
                // Prepare the rendering for the custom render list provided
                this._prepareRenderingManager(currentRenderList, currentRenderList.length, this.forceLayerMaskCheck);
            }
            this.onBeforeRenderingManagerRenderObservable.notifyObservers(passIndex);
            this._renderingManager.render(this.customRenderFunction, currentRenderList, this.renderParticles, this.renderSprites);
            this.onAfterRenderingManagerRenderObservable.notifyObservers(passIndex);
        }
        else {
            this.onFastPathRenderObservable.notifyObservers(passIndex);
        }
        if (!skipOnAfterRenderObservable) {
            this.onAfterRenderObservable.notifyObservers(passIndex);
        }
        engine.currentRenderPassId = currentRenderPassId;
    }
    /** @internal */
    _checkReadiness() {
        const scene = this._scene;
        const engine = scene.getEngine();
        const currentRenderPassId = engine.currentRenderPassId;
        let returnValue = true;
        if (!scene.getViewMatrix()) {
            // We probably didn't execute scene.render() yet, so make sure we have a view/projection matrix setup for the scene
            scene.updateTransformMatrix();
        }
        const numPasses = this.options.numPasses;
        for (let passIndex = 0; passIndex < numPasses && returnValue; passIndex++) {
            let currentRenderList = null;
            const defaultRenderList = this.renderList ? this.renderList : scene.getActiveMeshes().data;
            const defaultRenderListLength = this.renderList ? this.renderList.length : scene.getActiveMeshes().length;
            engine.currentRenderPassId = this._renderPassIds[passIndex];
            this.onBeforeRenderObservable.notifyObservers(passIndex);
            if (this.getCustomRenderList) {
                currentRenderList = this.getCustomRenderList(passIndex, defaultRenderList, defaultRenderListLength);
            }
            if (!currentRenderList) {
                currentRenderList = defaultRenderList;
            }
            if (!this.options.doNotChangeAspectRatio) {
                scene.updateTransformMatrix(true);
            }
            for (let i = 0; i < currentRenderList.length && returnValue; ++i) {
                const mesh = currentRenderList[i];
                if (!mesh.isEnabled() || mesh.isBlocked || !mesh.isVisible || !mesh.subMeshes) {
                    continue;
                }
                if (this.customIsReadyFunction) {
                    if (!this.customIsReadyFunction(mesh, this.refreshRate, true)) {
                        returnValue = false;
                        continue;
                    }
                }
                else if (!mesh.isReady(true)) {
                    returnValue = false;
                    continue;
                }
            }
            this.onAfterRenderObservable.notifyObservers(passIndex);
            if (numPasses > 1) {
                scene.incrementRenderId();
                scene.resetCachedMaterial();
            }
        }
        const particleSystems = this.particleSystemList || scene.particleSystems;
        for (const particleSystem of particleSystems) {
            if (!particleSystem.isReady()) {
                returnValue = false;
            }
        }
        engine.currentRenderPassId = currentRenderPassId;
        return returnValue;
    }
    _prepareRenderingManager(currentRenderList, currentRenderListLength, checkLayerMask) {
        const scene = this._scene;
        const camera = scene.activeCamera; // note that at this point, scene.activeCamera == this.activeCamera if defined, because initRender() has been called before
        const cameraForLOD = this.cameraForLOD ?? camera;
        this._renderingManager.reset();
        const sceneRenderId = scene.getRenderId();
        const currentFrameId = scene.getFrameId();
        for (let meshIndex = 0; meshIndex < currentRenderListLength; meshIndex++) {
            const mesh = currentRenderList[meshIndex];
            if (mesh && !mesh.isBlocked) {
                if (this.customIsReadyFunction) {
                    if (!this.customIsReadyFunction(mesh, this.refreshRate, false)) {
                        this.resetRefreshCounter();
                        continue;
                    }
                }
                else if (!mesh.isReady(this.refreshRate === 0)) {
                    this.resetRefreshCounter();
                    continue;
                }
                let meshToRender = null;
                if (cameraForLOD) {
                    const meshToRenderAndFrameId = mesh._internalAbstractMeshDataInfo._currentLOD.get(cameraForLOD);
                    if (!meshToRenderAndFrameId || meshToRenderAndFrameId[1] !== currentFrameId) {
                        meshToRender = scene.customLODSelector ? scene.customLODSelector(mesh, cameraForLOD) : mesh.getLOD(cameraForLOD);
                        if (!meshToRenderAndFrameId) {
                            mesh._internalAbstractMeshDataInfo._currentLOD.set(cameraForLOD, [meshToRender, currentFrameId]);
                        }
                        else {
                            meshToRenderAndFrameId[0] = meshToRender;
                            meshToRenderAndFrameId[1] = currentFrameId;
                        }
                    }
                    else {
                        meshToRender = meshToRenderAndFrameId[0];
                    }
                }
                else {
                    meshToRender = mesh;
                }
                if (!meshToRender) {
                    continue;
                }
                if (meshToRender !== mesh && meshToRender.billboardMode !== 0) {
                    meshToRender.computeWorldMatrix(); // Compute world matrix if LOD is billboard
                }
                meshToRender._preActivateForIntermediateRendering(sceneRenderId);
                let isMasked;
                if (checkLayerMask && camera) {
                    isMasked = (mesh.layerMask & camera.layerMask) === 0;
                }
                else {
                    isMasked = false;
                }
                if (mesh.isEnabled() && mesh.isVisible && mesh.subMeshes && !isMasked) {
                    if (meshToRender !== mesh) {
                        meshToRender._activate(sceneRenderId, true);
                    }
                    if (mesh._activate(sceneRenderId, true) && mesh.subMeshes.length) {
                        if (!mesh.isAnInstance) {
                            meshToRender._internalAbstractMeshDataInfo._onlyForInstancesIntermediate = false;
                        }
                        else {
                            if (mesh._internalAbstractMeshDataInfo._actAsRegularMesh) {
                                meshToRender = mesh;
                            }
                        }
                        meshToRender._internalAbstractMeshDataInfo._isActiveIntermediate = true;
                        scene._prepareSkeleton(meshToRender);
                        for (let subIndex = 0; subIndex < meshToRender.subMeshes.length; subIndex++) {
                            const subMesh = meshToRender.subMeshes[subIndex];
                            this._renderingManager.dispatch(subMesh, meshToRender);
                        }
                    }
                    mesh._postActivate();
                }
            }
        }
        const particleSystems = this.particleSystemList || scene.particleSystems;
        for (let particleIndex = 0; particleIndex < particleSystems.length; particleIndex++) {
            const particleSystem = particleSystems[particleIndex];
            const emitter = particleSystem.emitter;
            if (!particleSystem.isStarted() || !emitter || (emitter.position && !emitter.isEnabled())) {
                continue;
            }
            this._renderingManager.dispatchParticles(particleSystem);
        }
    }
    /**
     * Overrides the default sort function applied in the rendering group to prepare the meshes.
     * This allowed control for front to back rendering or reversely depending of the special needs.
     *
     * @param renderingGroupId The rendering group id corresponding to its index
     * @param opaqueSortCompareFn The opaque queue comparison function use to sort.
     * @param alphaTestSortCompareFn The alpha test queue comparison function use to sort.
     * @param transparentSortCompareFn The transparent queue comparison function use to sort.
     */
    setRenderingOrder(renderingGroupId, opaqueSortCompareFn = null, alphaTestSortCompareFn = null, transparentSortCompareFn = null) {
        this._renderingManager.setRenderingOrder(renderingGroupId, opaqueSortCompareFn, alphaTestSortCompareFn, transparentSortCompareFn);
    }
    /**
     * Specifies whether or not the stencil and depth buffer are cleared between two rendering groups.
     *
     * @param renderingGroupId The rendering group id corresponding to its index
     * @param autoClearDepthStencil Automatically clears depth and stencil between groups if true.
     * @param depth Automatically clears depth between groups if true and autoClear is true.
     * @param stencil Automatically clears stencil between groups if true and autoClear is true.
     */
    setRenderingAutoClearDepthStencil(renderingGroupId, autoClearDepthStencil, depth = true, stencil = true) {
        this._renderingManager.setRenderingAutoClearDepthStencil(renderingGroupId, autoClearDepthStencil, depth, stencil);
        this._renderingManager._useSceneAutoClearSetup = false;
    }
    /**
     * Clones the renderer.
     * @returns the cloned renderer
     */
    clone() {
        const newRenderer = new ObjectRenderer(this.name, this._scene, this.options);
        if (this.renderList) {
            newRenderer.renderList = this.renderList.slice(0);
        }
        return newRenderer;
    }
    /**
     * Dispose the renderer and release its associated resources.
     */
    dispose() {
        const renderList = this.renderList ? this.renderList : this._scene.getActiveMeshes().data;
        const renderListLength = this.renderList ? this.renderList.length : this._scene.getActiveMeshes().length;
        for (let i = 0; i < renderListLength; i++) {
            const mesh = renderList[i];
            if (mesh && mesh.getMaterialForRenderPass(this.renderPassId) !== undefined) {
                mesh.setMaterialForRenderPass(this.renderPassId, undefined);
            }
        }
        this.onBeforeRenderObservable.clear();
        this.onAfterRenderObservable.clear();
        this.onBeforeRenderingManagerRenderObservable.clear();
        this.onAfterRenderingManagerRenderObservable.clear();
        this.onFastPathRenderObservable.clear();
        this._releaseRenderPassId();
        this.renderList = null;
    }
    /** @internal */
    _rebuild() {
        if (this.refreshRate === ObjectRenderer.REFRESHRATE_RENDER_ONCE) {
            this.refreshRate = ObjectRenderer.REFRESHRATE_RENDER_ONCE;
        }
    }
    /**
     * Clear the info related to rendering groups preventing retention point in material dispose.
     */
    freeRenderingGroups() {
        if (this._renderingManager) {
            this._renderingManager.freeRenderingGroups();
        }
    }
}
/**
 * Objects will only be rendered once which can be useful to improve performance if everything in your render is static for instance.
 */
ObjectRenderer.REFRESHRATE_RENDER_ONCE = 0;
/**
 * Objects will be rendered every frame and is recommended for dynamic contents.
 */
ObjectRenderer.REFRESHRATE_RENDER_ONEVERYFRAME = 1;
/**
 * Objects will be rendered every 2 frames which could be enough if your dynamic objects are not
 * the central point of your effect and can save a lot of performances.
 */
ObjectRenderer.REFRESHRATE_RENDER_ONEVERYTWOFRAMES = 2;
//# sourceMappingURL=objectRenderer.js.map

/***/ }),

/***/ 200:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PassCubePostProcess: () => (/* binding */ PassCubePostProcess),
/* harmony export */   PassPostProcess: () => (/* binding */ PassPostProcess)
/* harmony export */ });
/* harmony import */ var _tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _postProcess_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(201);
/* harmony import */ var _Engines_abstractEngine_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(41);
/* harmony import */ var _Misc_typeStore_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8);
/* harmony import */ var _Misc_decorators_serialization_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(58);
/* harmony import */ var _thinPassPostProcess_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(204);
/* harmony import */ var _Misc_decorators_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(3);








/**
 * PassPostProcess which produces an output the same as it's input
 */
class PassPostProcess extends _postProcess_js__WEBPACK_IMPORTED_MODULE_1__.PostProcess {
    /**
     * Gets a string identifying the name of the class
     * @returns "PassPostProcess" string
     */
    getClassName() {
        return "PassPostProcess";
    }
    /**
     * Creates the PassPostProcess
     * @param name The name of the effect.
     * @param options The required width/height ratio to downsize to before computing the render pass.
     * @param camera The camera to apply the render pass to.
     * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
     * @param engine The engine which the post process will be applied. (default: current engine)
     * @param reusable If the post process can be reused on the same frame. (default: false)
     * @param textureType The type of texture to be used when performing the post processing.
     * @param blockCompilation If compilation of the shader should not be done in the constructor. The updateEffect method can be used to compile the shader at a later time. (default: false)
     */
    constructor(name, options, camera = null, samplingMode, engine, reusable, textureType = 0, blockCompilation = false) {
        const localOptions = {
            size: typeof options === "number" ? options : undefined,
            camera,
            samplingMode,
            engine,
            reusable,
            textureType,
            blockCompilation,
            ...options,
        };
        super(name, _thinPassPostProcess_js__WEBPACK_IMPORTED_MODULE_5__.ThinPassPostProcess.FragmentUrl, {
            effectWrapper: typeof options === "number" || !options.effectWrapper ? new _thinPassPostProcess_js__WEBPACK_IMPORTED_MODULE_5__.ThinPassPostProcess(name, engine, localOptions) : undefined,
            ...localOptions,
        });
    }
    /**
     * @internal
     */
    static _Parse(parsedPostProcess, targetCamera, scene, rootUrl) {
        return _Misc_decorators_serialization_js__WEBPACK_IMPORTED_MODULE_4__.SerializationHelper.Parse(() => {
            return new PassPostProcess(parsedPostProcess.name, parsedPostProcess.options, targetCamera, parsedPostProcess.renderTargetSamplingMode, parsedPostProcess._engine, parsedPostProcess.reusable);
        }, parsedPostProcess, scene, rootUrl);
    }
}
(0,_Misc_typeStore_js__WEBPACK_IMPORTED_MODULE_3__.RegisterClass)("BABYLON.PassPostProcess", PassPostProcess);
/**
 * PassCubePostProcess which produces an output the same as it's input (which must be a cube texture)
 */
class PassCubePostProcess extends _postProcess_js__WEBPACK_IMPORTED_MODULE_1__.PostProcess {
    /**
     * Gets or sets the cube face to display.
     *  * 0 is +X
     *  * 1 is -X
     *  * 2 is +Y
     *  * 3 is -Y
     *  * 4 is +Z
     *  * 5 is -Z
     */
    get face() {
        return this._effectWrapper.face;
    }
    set face(value) {
        this._effectWrapper.face = value;
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "PassCubePostProcess" string
     */
    getClassName() {
        return "PassCubePostProcess";
    }
    /**
     * Creates the PassCubePostProcess
     * @param name The name of the effect.
     * @param options The required width/height ratio to downsize to before computing the render pass.
     * @param camera The camera to apply the render pass to.
     * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
     * @param engine The engine which the post process will be applied. (default: current engine)
     * @param reusable If the post process can be reused on the same frame. (default: false)
     * @param textureType The type of texture to be used when performing the post processing.
     * @param blockCompilation If compilation of the shader should not be done in the constructor. The updateEffect method can be used to compile the shader at a later time. (default: false)
     */
    constructor(name, options, camera = null, samplingMode, engine, reusable, textureType = 0, blockCompilation = false) {
        const localOptions = {
            size: typeof options === "number" ? options : undefined,
            camera,
            samplingMode,
            engine,
            reusable,
            textureType,
            blockCompilation,
            ...options,
        };
        super(name, _thinPassPostProcess_js__WEBPACK_IMPORTED_MODULE_5__.ThinPassPostProcess.FragmentUrl, {
            effectWrapper: typeof options === "number" || !options.effectWrapper ? new _thinPassPostProcess_js__WEBPACK_IMPORTED_MODULE_5__.ThinPassCubePostProcess(name, engine, localOptions) : undefined,
            ...localOptions,
        });
    }
    /**
     * @internal
     */
    static _Parse(parsedPostProcess, targetCamera, scene, rootUrl) {
        return _Misc_decorators_serialization_js__WEBPACK_IMPORTED_MODULE_4__.SerializationHelper.Parse(() => {
            return new PassCubePostProcess(parsedPostProcess.name, parsedPostProcess.options, targetCamera, parsedPostProcess.renderTargetSamplingMode, parsedPostProcess._engine, parsedPostProcess.reusable);
        }, parsedPostProcess, scene, rootUrl);
    }
}
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_6__.serialize)()
], PassCubePostProcess.prototype, "face", null);
_Engines_abstractEngine_js__WEBPACK_IMPORTED_MODULE_2__.AbstractEngine._RescalePostProcessFactory = (engine) => {
    return new PassPostProcess("rescale", 1, null, 2, engine, false, 0);
};
//# sourceMappingURL=passPostProcess.js.map

/***/ }),

/***/ 201:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PostProcess: () => (/* binding */ PostProcess)
/* harmony export */ });
/* harmony import */ var _tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _Misc_smartArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(16);
/* harmony import */ var _Misc_observable_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(11);
/* harmony import */ var _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var _Materials_effect_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(42);
/* harmony import */ var _Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(3);
/* harmony import */ var _Misc_decorators_serialization_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(58);
/* harmony import */ var _Misc_typeStore_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(8);
/* harmony import */ var _Engines_abstractEngine_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(41);
/* harmony import */ var _Misc_tools_functions_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(56);
/* harmony import */ var _Materials_effectRenderer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(202);












_Engines_abstractEngine_js__WEBPACK_IMPORTED_MODULE_8__.AbstractEngine.prototype.setTextureFromPostProcess = function (channel, postProcess, name) {
    let postProcessInput = null;
    if (postProcess) {
        if (postProcess._forcedOutputTexture) {
            postProcessInput = postProcess._forcedOutputTexture;
        }
        else if (postProcess._textures.data[postProcess._currentRenderTextureInd]) {
            postProcessInput = postProcess._textures.data[postProcess._currentRenderTextureInd];
        }
    }
    this._bindTexture(channel, postProcessInput?.texture ?? null, name);
};
_Engines_abstractEngine_js__WEBPACK_IMPORTED_MODULE_8__.AbstractEngine.prototype.setTextureFromPostProcessOutput = function (channel, postProcess, name) {
    this._bindTexture(channel, postProcess?._outputTexture?.texture ?? null, name);
};
/**
 * Sets a texture to be the input of the specified post process. (To use the output, pass in the next post process in the pipeline)
 * @param channel Name of the sampler variable.
 * @param postProcess Post process to get the input texture from.
 */
_Materials_effect_js__WEBPACK_IMPORTED_MODULE_4__.Effect.prototype.setTextureFromPostProcess = function (channel, postProcess) {
    this._engine.setTextureFromPostProcess(this._samplers[channel], postProcess, channel);
};
/**
 * (Warning! setTextureFromPostProcessOutput may be desired instead)
 * Sets the input texture of the passed in post process to be input of this effect. (To use the output of the passed in post process use setTextureFromPostProcessOutput)
 * @param channel Name of the sampler variable.
 * @param postProcess Post process to get the output texture from.
 */
_Materials_effect_js__WEBPACK_IMPORTED_MODULE_4__.Effect.prototype.setTextureFromPostProcessOutput = function (channel, postProcess) {
    this._engine.setTextureFromPostProcessOutput(this._samplers[channel], postProcess, channel);
};
/**
 * PostProcess can be used to apply a shader to a texture after it has been rendered
 * See https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/usePostProcesses
 */
class PostProcess {
    /**
     * Force all the postprocesses to compile to glsl even on WebGPU engines.
     * False by default. This is mostly meant for backward compatibility.
     */
    static get ForceGLSL() {
        return _Materials_effectRenderer_js__WEBPACK_IMPORTED_MODULE_10__.EffectWrapper.ForceGLSL;
    }
    static set ForceGLSL(force) {
        _Materials_effectRenderer_js__WEBPACK_IMPORTED_MODULE_10__.EffectWrapper.ForceGLSL = force;
    }
    /**
     * Registers a shader code processing with a post process name.
     * @param postProcessName name of the post process. Use null for the fallback shader code processing. This is the shader code processing that will be used in case no specific shader code processing has been associated to a post process name
     * @param customShaderCodeProcessing shader code processing to associate to the post process name
     */
    static RegisterShaderCodeProcessing(postProcessName, customShaderCodeProcessing) {
        _Materials_effectRenderer_js__WEBPACK_IMPORTED_MODULE_10__.EffectWrapper.RegisterShaderCodeProcessing(postProcessName, customShaderCodeProcessing);
    }
    /** Name of the PostProcess. */
    get name() {
        return this._effectWrapper.name;
    }
    set name(value) {
        this._effectWrapper.name = value;
    }
    /**
     * Type of alpha mode to use when performing the post process (default: Engine.ALPHA_DISABLE)
     */
    get alphaMode() {
        return this._effectWrapper.alphaMode;
    }
    set alphaMode(value) {
        this._effectWrapper.alphaMode = value;
    }
    /**
     * Number of sample textures (default: 1)
     */
    get samples() {
        return this._samples;
    }
    set samples(n) {
        this._samples = Math.min(n, this._engine.getCaps().maxMSAASamples);
        this._textures.forEach((texture) => {
            texture.setSamples(this._samples);
        });
    }
    /**
     * Gets the shader language type used to generate vertex and fragment source code.
     */
    get shaderLanguage() {
        return this._shaderLanguage;
    }
    /**
     * Returns the fragment url or shader name used in the post process.
     * @returns the fragment url or name in the shader store.
     */
    getEffectName() {
        return this._fragmentUrl;
    }
    /**
     * A function that is added to the onActivateObservable
     */
    set onActivate(callback) {
        if (this._onActivateObserver) {
            this.onActivateObservable.remove(this._onActivateObserver);
        }
        if (callback) {
            this._onActivateObserver = this.onActivateObservable.add(callback);
        }
    }
    /**
     * A function that is added to the onSizeChangedObservable
     */
    set onSizeChanged(callback) {
        if (this._onSizeChangedObserver) {
            this.onSizeChangedObservable.remove(this._onSizeChangedObserver);
        }
        this._onSizeChangedObserver = this.onSizeChangedObservable.add(callback);
    }
    /**
     * A function that is added to the onApplyObservable
     */
    set onApply(callback) {
        if (this._onApplyObserver) {
            this.onApplyObservable.remove(this._onApplyObserver);
        }
        this._onApplyObserver = this.onApplyObservable.add(callback);
    }
    /**
     * A function that is added to the onBeforeRenderObservable
     */
    set onBeforeRender(callback) {
        if (this._onBeforeRenderObserver) {
            this.onBeforeRenderObservable.remove(this._onBeforeRenderObserver);
        }
        this._onBeforeRenderObserver = this.onBeforeRenderObservable.add(callback);
    }
    /**
     * A function that is added to the onAfterRenderObservable
     */
    set onAfterRender(callback) {
        if (this._onAfterRenderObserver) {
            this.onAfterRenderObservable.remove(this._onAfterRenderObserver);
        }
        this._onAfterRenderObserver = this.onAfterRenderObservable.add(callback);
    }
    /**
     * The input texture for this post process and the output texture of the previous post process. When added to a pipeline the previous post process will
     * render it's output into this texture and this texture will be used as textureSampler in the fragment shader of this post process.
     */
    get inputTexture() {
        return this._textures.data[this._currentRenderTextureInd];
    }
    set inputTexture(value) {
        this._forcedOutputTexture = value;
    }
    /**
     * Since inputTexture should always be defined, if we previously manually set `inputTexture`,
     * the only way to unset it is to use this function to restore its internal state
     */
    restoreDefaultInputTexture() {
        if (this._forcedOutputTexture) {
            this._forcedOutputTexture = null;
            this.markTextureDirty();
        }
    }
    /**
     * Gets the camera which post process is applied to.
     * @returns The camera the post process is applied to.
     */
    getCamera() {
        return this._camera;
    }
    /**
     * Gets the texel size of the postprocess.
     * See https://en.wikipedia.org/wiki/Texel_(graphics)
     */
    get texelSize() {
        if (this._shareOutputWithPostProcess) {
            return this._shareOutputWithPostProcess.texelSize;
        }
        if (this._forcedOutputTexture) {
            this._texelSize.copyFromFloats(1.0 / this._forcedOutputTexture.width, 1.0 / this._forcedOutputTexture.height);
        }
        return this._texelSize;
    }
    /** @internal */
    constructor(name, fragmentUrl, parameters, samplers, _size, camera, samplingMode = 1, engine, reusable, defines = null, textureType = 0, vertexUrl = "postprocess", indexParameters, blockCompilation = false, textureFormat = 5, shaderLanguage, extraInitializations) {
        /** @internal */
        this._parentContainer = null;
        /**
         * Width of the texture to apply the post process on
         */
        this.width = -1;
        /**
         * Height of the texture to apply the post process on
         */
        this.height = -1;
        /**
         * Gets the node material used to create this postprocess (null if the postprocess was manually created)
         */
        this.nodeMaterialSource = null;
        /**
         * Internal, reference to the location where this postprocess was output to. (Typically the texture on the next postprocess in the chain)
         * @internal
         */
        this._outputTexture = null;
        /**
         * If the buffer needs to be cleared before applying the post process. (default: true)
         * Should be set to false if shader will overwrite all previous pixels.
         */
        this.autoClear = true;
        /**
         * If clearing the buffer should be forced in autoClear mode, even when alpha mode is enabled (default: false).
         * By default, the buffer will only be cleared if alpha mode is disabled (and autoClear is true).
         */
        this.forceAutoClearInAlphaMode = false;
        /**
         * Animations to be used for the post processing
         */
        this.animations = [];
        /**
         * Enable Pixel Perfect mode where texture is not scaled to be power of 2.
         * Can only be used on a single postprocess or on the last one of a chain. (default: false)
         */
        this.enablePixelPerfectMode = false;
        /**
         * Force the postprocess to be applied without taking in account viewport
         */
        this.forceFullscreenViewport = true;
        /**
         * Scale mode for the post process (default: Engine.SCALEMODE_FLOOR)
         *
         * | Value | Type                                | Description |
         * | ----- | ----------------------------------- | ----------- |
         * | 1     | SCALEMODE_FLOOR                     | [engine.scalemode_floor](https://doc.babylonjs.com/api/classes/babylon.engine#scalemode_floor) |
         * | 2     | SCALEMODE_NEAREST                   | [engine.scalemode_nearest](https://doc.babylonjs.com/api/classes/babylon.engine#scalemode_nearest) |
         * | 3     | SCALEMODE_CEILING                   | [engine.scalemode_ceiling](https://doc.babylonjs.com/api/classes/babylon.engine#scalemode_ceiling) |
         *
         */
        this.scaleMode = 1;
        /**
         * Force textures to be a power of two (default: false)
         */
        this.alwaysForcePOT = false;
        this._samples = 1;
        /**
         * Modify the scale of the post process to be the same as the viewport (default: false)
         */
        this.adaptScaleToCurrentViewport = false;
        this._webGPUReady = false;
        this._reusable = false;
        this._renderId = 0;
        /**
         * if externalTextureSamplerBinding is true, the "apply" method won't bind the textureSampler texture, it is expected to be done by the "outside" (by the onApplyObservable observer most probably).
         * counter-productive in some cases because if the texture bound by "apply" is different from the currently texture bound, (the one set by the onApplyObservable observer, for eg) some
         * internal structures (materialContext) will be dirtified, which may impact performances
         */
        this.externalTextureSamplerBinding = false;
        /**
         * Smart array of input and output textures for the post process.
         * @internal
         */
        this._textures = new _Misc_smartArray_js__WEBPACK_IMPORTED_MODULE_1__.SmartArray(2);
        /**
         * Smart array of input and output textures for the post process.
         * @internal
         */
        this._textureCache = [];
        /**
         * The index in _textures that corresponds to the output texture.
         * @internal
         */
        this._currentRenderTextureInd = 0;
        this._scaleRatio = new _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_3__.Vector2(1, 1);
        this._texelSize = _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_3__.Vector2.Zero();
        // Events
        /**
         * An event triggered when the postprocess is activated.
         */
        this.onActivateObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_2__.Observable();
        /**
         * An event triggered when the postprocess changes its size.
         */
        this.onSizeChangedObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_2__.Observable();
        /**
         * An event triggered when the postprocess applies its effect.
         */
        this.onApplyObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_2__.Observable();
        /**
         * An event triggered before rendering the postprocess
         */
        this.onBeforeRenderObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_2__.Observable();
        /**
         * An event triggered after rendering the postprocess
         */
        this.onAfterRenderObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_2__.Observable();
        /**
         * An event triggered when the post-process is disposed
         */
        this.onDisposeObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_2__.Observable();
        let size = 1;
        let uniformBuffers = null;
        let effectWrapper;
        if (parameters && !Array.isArray(parameters)) {
            const options = parameters;
            parameters = options.uniforms ?? null;
            samplers = options.samplers ?? null;
            size = options.size ?? 1;
            camera = options.camera ?? null;
            samplingMode = options.samplingMode ?? 1;
            engine = options.engine;
            reusable = options.reusable;
            defines = Array.isArray(options.defines) ? options.defines.join("\n") : (options.defines ?? null);
            textureType = options.textureType ?? 0;
            vertexUrl = options.vertexUrl ?? "postprocess";
            indexParameters = options.indexParameters;
            blockCompilation = options.blockCompilation ?? false;
            textureFormat = options.textureFormat ?? 5;
            shaderLanguage = options.shaderLanguage ?? 0 /* ShaderLanguage.GLSL */;
            uniformBuffers = options.uniformBuffers ?? null;
            extraInitializations = options.extraInitializations;
            effectWrapper = options.effectWrapper;
        }
        else if (_size) {
            if (typeof _size === "number") {
                size = _size;
            }
            else {
                size = { width: _size.width, height: _size.height };
            }
        }
        this._useExistingThinPostProcess = !!effectWrapper;
        this._effectWrapper =
            effectWrapper ??
                new _Materials_effectRenderer_js__WEBPACK_IMPORTED_MODULE_10__.EffectWrapper({
                    name,
                    useShaderStore: true,
                    useAsPostProcess: true,
                    fragmentShader: fragmentUrl,
                    engine: engine || camera?.getScene().getEngine(),
                    uniforms: parameters,
                    samplers,
                    uniformBuffers,
                    defines,
                    vertexUrl,
                    indexParameters,
                    blockCompilation: true,
                    shaderLanguage,
                    extraInitializations: undefined,
                });
        this.name = name;
        this.onEffectCreatedObservable = this._effectWrapper.onEffectCreatedObservable;
        if (camera != null) {
            this._camera = camera;
            this._scene = camera.getScene();
            camera.attachPostProcess(this);
            this._engine = this._scene.getEngine();
            this._scene.postProcesses.push(this);
            this.uniqueId = this._scene.getUniqueId();
        }
        else if (engine) {
            this._engine = engine;
            this._engine.postProcesses.push(this);
        }
        this._options = size;
        this.renderTargetSamplingMode = samplingMode ? samplingMode : 1;
        this._reusable = reusable || false;
        this._textureType = textureType;
        this._textureFormat = textureFormat;
        this._shaderLanguage = shaderLanguage || 0 /* ShaderLanguage.GLSL */;
        this._samplers = samplers || [];
        if (this._samplers.indexOf("textureSampler") === -1) {
            this._samplers.push("textureSampler");
        }
        this._fragmentUrl = fragmentUrl;
        this._vertexUrl = vertexUrl;
        this._parameters = parameters || [];
        if (this._parameters.indexOf("scale") === -1) {
            this._parameters.push("scale");
        }
        this._uniformBuffers = uniformBuffers || [];
        this._indexParameters = indexParameters;
        if (!this._useExistingThinPostProcess) {
            this._webGPUReady = this._shaderLanguage === 1 /* ShaderLanguage.WGSL */;
            const importPromises = [];
            this._gatherImports(this._engine.isWebGPU && !PostProcess.ForceGLSL, importPromises);
            this._effectWrapper._webGPUReady = this._webGPUReady;
            this._effectWrapper._postConstructor(blockCompilation, defines, extraInitializations, importPromises);
        }
    }
    _gatherImports(useWebGPU = false, list) {
        // this._webGPUReady is used to detect when a postprocess is intended to be used with WebGPU
        if (useWebGPU && this._webGPUReady) {
            list.push(Promise.all([__webpack_require__.e(/* import() */ 18).then(__webpack_require__.bind(__webpack_require__, 241))]));
        }
        else {
            list.push(Promise.all([Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 203))]));
        }
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "PostProcess" string
     */
    getClassName() {
        return "PostProcess";
    }
    /**
     * Gets the engine which this post process belongs to.
     * @returns The engine the post process was enabled with.
     */
    getEngine() {
        return this._engine;
    }
    /**
     * The effect that is created when initializing the post process.
     * @returns The created effect corresponding to the postprocess.
     */
    getEffect() {
        return this._effectWrapper.drawWrapper.effect;
    }
    /**
     * To avoid multiple redundant textures for multiple post process, the output the output texture for this post process can be shared with another.
     * @param postProcess The post process to share the output with.
     * @returns This post process.
     */
    shareOutputWith(postProcess) {
        this._disposeTextures();
        this._shareOutputWithPostProcess = postProcess;
        return this;
    }
    /**
     * Reverses the effect of calling shareOutputWith and returns the post process back to its original state.
     * This should be called if the post process that shares output with this post process is disabled/disposed.
     */
    useOwnOutput() {
        if (this._textures.length == 0) {
            this._textures = new _Misc_smartArray_js__WEBPACK_IMPORTED_MODULE_1__.SmartArray(2);
        }
        this._shareOutputWithPostProcess = null;
    }
    /**
     * Updates the effect with the current post process compile time values and recompiles the shader.
     * @param defines Define statements that should be added at the beginning of the shader. (default: null)
     * @param uniforms Set of uniform variables that will be passed to the shader. (default: null)
     * @param samplers Set of Texture2D variables that will be passed to the shader. (default: null)
     * @param indexParameters The index parameters to be used for babylons include syntax "#include<kernelBlurVaryingDeclaration>[0..varyingCount]". (default: undefined) See usage in babylon.blurPostProcess.ts and kernelBlur.vertex.fx
     * @param onCompiled Called when the shader has been compiled.
     * @param onError Called if there is an error when compiling a shader.
     * @param vertexUrl The url of the vertex shader to be used (default: the one given at construction time)
     * @param fragmentUrl The url of the fragment shader to be used (default: the one given at construction time)
     */
    updateEffect(defines = null, uniforms = null, samplers = null, indexParameters, onCompiled, onError, vertexUrl, fragmentUrl) {
        this._effectWrapper.updateEffect(defines, uniforms, samplers, indexParameters, onCompiled, onError, vertexUrl, fragmentUrl);
        this._postProcessDefines = Array.isArray(this._effectWrapper.options.defines) ? this._effectWrapper.options.defines.join("\n") : this._effectWrapper.options.defines;
    }
    /**
     * The post process is reusable if it can be used multiple times within one frame.
     * @returns If the post process is reusable
     */
    isReusable() {
        return this._reusable;
    }
    /** invalidate frameBuffer to hint the postprocess to create a depth buffer */
    markTextureDirty() {
        this.width = -1;
    }
    _createRenderTargetTexture(textureSize, textureOptions, channel = 0) {
        for (let i = 0; i < this._textureCache.length; i++) {
            if (this._textureCache[i].texture.width === textureSize.width &&
                this._textureCache[i].texture.height === textureSize.height &&
                this._textureCache[i].postProcessChannel === channel &&
                this._textureCache[i].texture._generateDepthBuffer === textureOptions.generateDepthBuffer &&
                this._textureCache[i].texture.samples === textureOptions.samples) {
                return this._textureCache[i].texture;
            }
        }
        const tex = this._engine.createRenderTargetTexture(textureSize, textureOptions);
        this._textureCache.push({ texture: tex, postProcessChannel: channel, lastUsedRenderId: -1 });
        return tex;
    }
    _flushTextureCache() {
        const currentRenderId = this._renderId;
        for (let i = this._textureCache.length - 1; i >= 0; i--) {
            if (currentRenderId - this._textureCache[i].lastUsedRenderId > 100) {
                let currentlyUsed = false;
                for (let j = 0; j < this._textures.length; j++) {
                    if (this._textures.data[j] === this._textureCache[i].texture) {
                        currentlyUsed = true;
                        break;
                    }
                }
                if (!currentlyUsed) {
                    this._textureCache[i].texture.dispose();
                    this._textureCache.splice(i, 1);
                }
            }
        }
    }
    /**
     * Resizes the post-process texture
     * @param width Width of the texture
     * @param height Height of the texture
     * @param camera The camera this post-process is applied to. Pass null if the post-process is used outside the context of a camera post-process chain (default: null)
     * @param needMipMaps True if mip maps need to be generated after render (default: false)
     * @param forceDepthStencil True to force post-process texture creation with stencil depth and buffer (default: false)
     */
    resize(width, height, camera = null, needMipMaps = false, forceDepthStencil = false) {
        if (this._textures.length > 0) {
            this._textures.reset();
        }
        this.width = width;
        this.height = height;
        let firstPP = null;
        if (camera) {
            for (let i = 0; i < camera._postProcesses.length; i++) {
                if (camera._postProcesses[i] !== null) {
                    firstPP = camera._postProcesses[i];
                    break;
                }
            }
        }
        const textureSize = { width: this.width, height: this.height };
        const textureOptions = {
            generateMipMaps: needMipMaps,
            generateDepthBuffer: forceDepthStencil || firstPP === this,
            generateStencilBuffer: (forceDepthStencil || firstPP === this) && this._engine.isStencilEnable,
            samplingMode: this.renderTargetSamplingMode,
            type: this._textureType,
            format: this._textureFormat,
            samples: this._samples,
            label: "PostProcessRTT-" + this.name,
        };
        this._textures.push(this._createRenderTargetTexture(textureSize, textureOptions, 0));
        if (this._reusable) {
            this._textures.push(this._createRenderTargetTexture(textureSize, textureOptions, 1));
        }
        this._texelSize.copyFromFloats(1.0 / this.width, 1.0 / this.height);
        this.onSizeChangedObservable.notifyObservers(this);
    }
    _getTarget() {
        let target;
        if (this._shareOutputWithPostProcess) {
            target = this._shareOutputWithPostProcess.inputTexture;
        }
        else if (this._forcedOutputTexture) {
            target = this._forcedOutputTexture;
            this.width = this._forcedOutputTexture.width;
            this.height = this._forcedOutputTexture.height;
        }
        else {
            target = this.inputTexture;
            let cache;
            for (let i = 0; i < this._textureCache.length; i++) {
                if (this._textureCache[i].texture === target) {
                    cache = this._textureCache[i];
                    break;
                }
            }
            if (cache) {
                cache.lastUsedRenderId = this._renderId;
            }
        }
        return target;
    }
    /**
     * Activates the post process by intializing the textures to be used when executed. Notifies onActivateObservable.
     * When this post process is used in a pipeline, this is call will bind the input texture of this post process to the output of the previous.
     * @param cameraOrScene The camera that will be used in the post process. This camera will be used when calling onActivateObservable. You can also pass the scene if no camera is available.
     * @param sourceTexture The source texture to be inspected to get the width and height if not specified in the post process constructor. (default: null)
     * @param forceDepthStencil If true, a depth and stencil buffer will be generated. (default: false)
     * @returns The render target wrapper that was bound to be written to.
     */
    activate(cameraOrScene, sourceTexture = null, forceDepthStencil) {
        const camera = cameraOrScene === null || cameraOrScene.cameraRigMode !== undefined ? cameraOrScene || this._camera : null;
        const scene = camera?.getScene() ?? cameraOrScene;
        const engine = scene.getEngine();
        const maxSize = engine.getCaps().maxTextureSize;
        const requiredWidth = ((sourceTexture ? sourceTexture.width : this._engine.getRenderWidth(true)) * this._options) | 0;
        const requiredHeight = ((sourceTexture ? sourceTexture.height : this._engine.getRenderHeight(true)) * this._options) | 0;
        let desiredWidth = this._options.width || requiredWidth;
        let desiredHeight = this._options.height || requiredHeight;
        const needMipMaps = this.renderTargetSamplingMode !== 7 &&
            this.renderTargetSamplingMode !== 1 &&
            this.renderTargetSamplingMode !== 2;
        let target = null;
        if (!this._shareOutputWithPostProcess && !this._forcedOutputTexture) {
            if (this.adaptScaleToCurrentViewport) {
                const currentViewport = engine.currentViewport;
                if (currentViewport) {
                    desiredWidth *= currentViewport.width;
                    desiredHeight *= currentViewport.height;
                }
            }
            if (needMipMaps || this.alwaysForcePOT) {
                if (!this._options.width) {
                    desiredWidth = engine.needPOTTextures ? (0,_Misc_tools_functions_js__WEBPACK_IMPORTED_MODULE_9__.GetExponentOfTwo)(desiredWidth, maxSize, this.scaleMode) : desiredWidth;
                }
                if (!this._options.height) {
                    desiredHeight = engine.needPOTTextures ? (0,_Misc_tools_functions_js__WEBPACK_IMPORTED_MODULE_9__.GetExponentOfTwo)(desiredHeight, maxSize, this.scaleMode) : desiredHeight;
                }
            }
            if (this.width !== desiredWidth || this.height !== desiredHeight || !(target = this._getTarget())) {
                this.resize(desiredWidth, desiredHeight, camera, needMipMaps, forceDepthStencil);
            }
            this._textures.forEach((texture) => {
                if (texture.samples !== this.samples) {
                    this._engine.updateRenderTargetTextureSampleCount(texture, this.samples);
                }
            });
            this._flushTextureCache();
            this._renderId++;
        }
        if (!target) {
            target = this._getTarget();
        }
        // Bind the input of this post process to be used as the output of the previous post process.
        if (this.enablePixelPerfectMode) {
            this._scaleRatio.copyFromFloats(requiredWidth / desiredWidth, requiredHeight / desiredHeight);
            this._engine.bindFramebuffer(target, 0, requiredWidth, requiredHeight, this.forceFullscreenViewport);
        }
        else {
            this._scaleRatio.copyFromFloats(1, 1);
            this._engine.bindFramebuffer(target, 0, undefined, undefined, this.forceFullscreenViewport);
        }
        this._engine._debugInsertMarker?.(`post process ${this.name} input`);
        this.onActivateObservable.notifyObservers(camera);
        // Clear
        if (this.autoClear && (this.alphaMode === 0 || this.forceAutoClearInAlphaMode)) {
            this._engine.clear(this.clearColor ? this.clearColor : scene.clearColor, scene._allowPostProcessClearColor, true, true);
        }
        if (this._reusable) {
            this._currentRenderTextureInd = (this._currentRenderTextureInd + 1) % 2;
        }
        return target;
    }
    /**
     * If the post process is supported.
     */
    get isSupported() {
        return this._effectWrapper.drawWrapper.effect.isSupported;
    }
    /**
     * The aspect ratio of the output texture.
     */
    get aspectRatio() {
        if (this._shareOutputWithPostProcess) {
            return this._shareOutputWithPostProcess.aspectRatio;
        }
        if (this._forcedOutputTexture) {
            return this._forcedOutputTexture.width / this._forcedOutputTexture.height;
        }
        return this.width / this.height;
    }
    /**
     * Get a value indicating if the post-process is ready to be used
     * @returns true if the post-process is ready (shader is compiled)
     */
    isReady() {
        return this._effectWrapper.isReady();
    }
    /**
     * Binds all textures and uniforms to the shader, this will be run on every pass.
     * @returns the effect corresponding to this post process. Null if not compiled or not ready.
     */
    apply() {
        // Check
        if (!this._effectWrapper.isReady()) {
            return null;
        }
        // States
        this._engine.enableEffect(this._effectWrapper.drawWrapper);
        this._engine.setState(false);
        this._engine.setDepthBuffer(false);
        this._engine.setDepthWrite(false);
        // Alpha
        if (this.alphaConstants) {
            this.getEngine().setAlphaConstants(this.alphaConstants.r, this.alphaConstants.g, this.alphaConstants.b, this.alphaConstants.a);
        }
        this._engine.setAlphaMode(this.alphaMode);
        // Bind the output texture of the preivous post process as the input to this post process.
        let source;
        if (this._shareOutputWithPostProcess) {
            source = this._shareOutputWithPostProcess.inputTexture;
        }
        else if (this._forcedOutputTexture) {
            source = this._forcedOutputTexture;
        }
        else {
            source = this.inputTexture;
        }
        if (!this.externalTextureSamplerBinding) {
            this._effectWrapper.drawWrapper.effect._bindTexture("textureSampler", source?.texture);
        }
        // Parameters
        this._effectWrapper.drawWrapper.effect.setVector2("scale", this._scaleRatio);
        this.onApplyObservable.notifyObservers(this._effectWrapper.drawWrapper.effect);
        this._effectWrapper.bind(true);
        return this._effectWrapper.drawWrapper.effect;
    }
    _disposeTextures() {
        if (this._shareOutputWithPostProcess || this._forcedOutputTexture) {
            this._disposeTextureCache();
            return;
        }
        this._disposeTextureCache();
        this._textures.dispose();
    }
    _disposeTextureCache() {
        for (let i = this._textureCache.length - 1; i >= 0; i--) {
            this._textureCache[i].texture.dispose();
        }
        this._textureCache.length = 0;
    }
    /**
     * Sets the required values to the prepass renderer.
     * @param prePassRenderer defines the prepass renderer to setup.
     * @returns true if the pre pass is needed.
     */
    setPrePassRenderer(prePassRenderer) {
        if (this._prePassEffectConfiguration) {
            this._prePassEffectConfiguration = prePassRenderer.addEffectConfiguration(this._prePassEffectConfiguration);
            this._prePassEffectConfiguration.enabled = true;
            return true;
        }
        return false;
    }
    /**
     * Disposes the post process.
     * @param camera The camera to dispose the post process on.
     */
    dispose(camera) {
        camera = camera || this._camera;
        if (!this._useExistingThinPostProcess) {
            this._effectWrapper.dispose();
        }
        this._disposeTextures();
        let index;
        if (this._scene) {
            index = this._scene.postProcesses.indexOf(this);
            if (index !== -1) {
                this._scene.postProcesses.splice(index, 1);
            }
        }
        if (this._parentContainer) {
            const index = this._parentContainer.postProcesses.indexOf(this);
            if (index > -1) {
                this._parentContainer.postProcesses.splice(index, 1);
            }
            this._parentContainer = null;
        }
        index = this._engine.postProcesses.indexOf(this);
        if (index !== -1) {
            this._engine.postProcesses.splice(index, 1);
        }
        this.onDisposeObservable.notifyObservers();
        if (!camera) {
            return;
        }
        camera.detachPostProcess(this);
        index = camera._postProcesses.indexOf(this);
        if (index === 0 && camera._postProcesses.length > 0) {
            const firstPostProcess = this._camera._getFirstPostProcess();
            if (firstPostProcess) {
                firstPostProcess.markTextureDirty();
            }
        }
        this.onActivateObservable.clear();
        this.onAfterRenderObservable.clear();
        this.onApplyObservable.clear();
        this.onBeforeRenderObservable.clear();
        this.onSizeChangedObservable.clear();
        this.onEffectCreatedObservable.clear();
    }
    /**
     * Serializes the post process to a JSON object
     * @returns the JSON object
     */
    serialize() {
        const serializationObject = _Misc_decorators_serialization_js__WEBPACK_IMPORTED_MODULE_6__.SerializationHelper.Serialize(this);
        const camera = this.getCamera() || (this._scene && this._scene.activeCamera);
        serializationObject.customType = "BABYLON." + this.getClassName();
        serializationObject.cameraId = camera ? camera.id : null;
        serializationObject.reusable = this._reusable;
        serializationObject.textureType = this._textureType;
        serializationObject.fragmentUrl = this._fragmentUrl;
        serializationObject.parameters = this._parameters;
        serializationObject.samplers = this._samplers;
        serializationObject.uniformBuffers = this._uniformBuffers;
        serializationObject.options = this._options;
        serializationObject.defines = this._postProcessDefines;
        serializationObject.textureFormat = this._textureFormat;
        serializationObject.vertexUrl = this._vertexUrl;
        serializationObject.indexParameters = this._indexParameters;
        return serializationObject;
    }
    /**
     * Clones this post process
     * @returns a new post process similar to this one
     */
    clone() {
        const serializationObject = this.serialize();
        serializationObject._engine = this._engine;
        serializationObject.cameraId = null;
        const result = PostProcess.Parse(serializationObject, this._scene, "");
        if (!result) {
            return null;
        }
        result.onActivateObservable = this.onActivateObservable.clone();
        result.onSizeChangedObservable = this.onSizeChangedObservable.clone();
        result.onApplyObservable = this.onApplyObservable.clone();
        result.onBeforeRenderObservable = this.onBeforeRenderObservable.clone();
        result.onAfterRenderObservable = this.onAfterRenderObservable.clone();
        result._prePassEffectConfiguration = this._prePassEffectConfiguration;
        return result;
    }
    /**
     * Creates a material from parsed material data
     * @param parsedPostProcess defines parsed post process data
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL to use to load textures
     * @returns a new post process
     */
    static Parse(parsedPostProcess, scene, rootUrl) {
        const postProcessType = (0,_Misc_typeStore_js__WEBPACK_IMPORTED_MODULE_7__.GetClass)(parsedPostProcess.customType);
        if (!postProcessType || !postProcessType._Parse) {
            return null;
        }
        const camera = scene ? scene.getCameraById(parsedPostProcess.cameraId) : null;
        return postProcessType._Parse(parsedPostProcess, camera, scene, rootUrl);
    }
    /**
     * @internal
     */
    static _Parse(parsedPostProcess, targetCamera, scene, rootUrl) {
        return _Misc_decorators_serialization_js__WEBPACK_IMPORTED_MODULE_6__.SerializationHelper.Parse(() => {
            return new PostProcess(parsedPostProcess.name, parsedPostProcess.fragmentUrl, parsedPostProcess.parameters, parsedPostProcess.samplers, parsedPostProcess.options, targetCamera, parsedPostProcess.renderTargetSamplingMode, parsedPostProcess._engine, parsedPostProcess.reusable, parsedPostProcess.defines, parsedPostProcess.textureType, parsedPostProcess.vertexUrl, parsedPostProcess.indexParameters, false, parsedPostProcess.textureFormat);
        }, parsedPostProcess, scene, rootUrl);
    }
}
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)()
], PostProcess.prototype, "uniqueId", void 0);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)()
], PostProcess.prototype, "name", null);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)()
], PostProcess.prototype, "width", void 0);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)()
], PostProcess.prototype, "height", void 0);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)()
], PostProcess.prototype, "renderTargetSamplingMode", void 0);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serializeAsColor4)()
], PostProcess.prototype, "clearColor", void 0);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)()
], PostProcess.prototype, "autoClear", void 0);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)()
], PostProcess.prototype, "forceAutoClearInAlphaMode", void 0);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)()
], PostProcess.prototype, "alphaMode", null);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)()
], PostProcess.prototype, "alphaConstants", void 0);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)()
], PostProcess.prototype, "enablePixelPerfectMode", void 0);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)()
], PostProcess.prototype, "forceFullscreenViewport", void 0);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)()
], PostProcess.prototype, "scaleMode", void 0);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)()
], PostProcess.prototype, "alwaysForcePOT", void 0);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)("samples")
], PostProcess.prototype, "_samples", void 0);
(0,_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__.__decorate)([
    (0,_Misc_decorators_js__WEBPACK_IMPORTED_MODULE_5__.serialize)()
], PostProcess.prototype, "adaptScaleToCurrentViewport", void 0);
(0,_Misc_typeStore_js__WEBPACK_IMPORTED_MODULE_7__.RegisterClass)("BABYLON.PostProcess", PostProcess);
//# sourceMappingURL=postProcess.js.map

/***/ }),

/***/ 202:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EffectRenderer: () => (/* binding */ EffectRenderer),
/* harmony export */   EffectWrapper: () => (/* binding */ EffectWrapper)
/* harmony export */ });
/* harmony import */ var _Buffers_buffer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(120);
/* harmony import */ var _Maths_math_viewport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(62);
/* harmony import */ var _Misc_observable_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(11);
/* harmony import */ var _effect_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(42);
/* harmony import */ var _drawWrapper_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(129);
/* harmony import */ var _Shaders_postprocess_vertex_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(203);






// Prevents ES6 issue if not imported.

// Fullscreen quad buffers by default.
const DefaultOptions = {
    positions: [1, 1, -1, 1, -1, -1, 1, -1],
    indices: [0, 1, 2, 0, 2, 3],
};
/**
 * Helper class to render one or more effects.
 * You can access the previous rendering in your shader by declaring a sampler named textureSampler
 */
class EffectRenderer {
    /**
     * Creates an effect renderer
     * @param engine the engine to use for rendering
     * @param options defines the options of the effect renderer
     */
    constructor(engine, options = DefaultOptions) {
        this._fullscreenViewport = new _Maths_math_viewport_js__WEBPACK_IMPORTED_MODULE_1__.Viewport(0, 0, 1, 1);
        const positions = options.positions ?? DefaultOptions.positions;
        const indices = options.indices ?? DefaultOptions.indices;
        this.engine = engine;
        this._vertexBuffers = {
            // Note, always assumes stride of 2.
            [_Buffers_buffer_js__WEBPACK_IMPORTED_MODULE_0__.VertexBuffer.PositionKind]: new _Buffers_buffer_js__WEBPACK_IMPORTED_MODULE_0__.VertexBuffer(engine, positions, _Buffers_buffer_js__WEBPACK_IMPORTED_MODULE_0__.VertexBuffer.PositionKind, false, false, 2),
        };
        this._indexBuffer = engine.createIndexBuffer(indices);
        this._indexBufferLength = indices.length;
        this._onContextRestoredObserver = engine.onContextRestoredObservable.add(() => {
            this._indexBuffer = engine.createIndexBuffer(indices);
            for (const key in this._vertexBuffers) {
                const vertexBuffer = this._vertexBuffers[key];
                vertexBuffer._rebuild();
            }
        });
    }
    /**
     * Sets the current viewport in normalized coordinates 0-1
     * @param viewport Defines the viewport to set (defaults to 0 0 1 1)
     */
    setViewport(viewport = this._fullscreenViewport) {
        this.engine.setViewport(viewport);
    }
    /**
     * Binds the embedded attributes buffer to the effect.
     * @param effect Defines the effect to bind the attributes for
     */
    bindBuffers(effect) {
        this.engine.bindBuffers(this._vertexBuffers, this._indexBuffer, effect);
    }
    /**
     * Sets the current effect wrapper to use during draw.
     * The effect needs to be ready before calling this api.
     * This also sets the default full screen position attribute.
     * @param effectWrapper Defines the effect to draw with
     */
    applyEffectWrapper(effectWrapper) {
        this.engine.setState(true);
        this.engine.depthCullingState.depthTest = false;
        this.engine.stencilState.stencilTest = false;
        this.engine.enableEffect(effectWrapper.drawWrapper);
        this.bindBuffers(effectWrapper.effect);
        effectWrapper.onApplyObservable.notifyObservers({});
    }
    /**
     * Saves engine states
     */
    saveStates() {
        this._savedStateDepthTest = this.engine.depthCullingState.depthTest;
        this._savedStateStencilTest = this.engine.stencilState.stencilTest;
    }
    /**
     * Restores engine states
     */
    restoreStates() {
        this.engine.depthCullingState.depthTest = this._savedStateDepthTest;
        this.engine.stencilState.stencilTest = this._savedStateStencilTest;
    }
    /**
     * Draws a full screen quad.
     */
    draw() {
        this.engine.drawElementsType(0, 0, this._indexBufferLength);
    }
    _isRenderTargetTexture(texture) {
        return texture.renderTarget !== undefined;
    }
    /**
     * renders one or more effects to a specified texture
     * @param effectWrapper the effect to renderer
     * @param outputTexture texture to draw to, if null it will render to the currently bound frame buffer
     */
    render(effectWrapper, outputTexture = null) {
        // Ensure effect is ready
        if (!effectWrapper.effect.isReady()) {
            return;
        }
        this.saveStates();
        // Reset state
        this.setViewport();
        const out = outputTexture === null ? null : this._isRenderTargetTexture(outputTexture) ? outputTexture.renderTarget : outputTexture;
        if (out) {
            this.engine.bindFramebuffer(out);
        }
        this.applyEffectWrapper(effectWrapper);
        this.draw();
        if (out) {
            this.engine.unBindFramebuffer(out);
        }
        this.restoreStates();
    }
    /**
     * Disposes of the effect renderer
     */
    dispose() {
        const vertexBuffer = this._vertexBuffers[_Buffers_buffer_js__WEBPACK_IMPORTED_MODULE_0__.VertexBuffer.PositionKind];
        if (vertexBuffer) {
            vertexBuffer.dispose();
            delete this._vertexBuffers[_Buffers_buffer_js__WEBPACK_IMPORTED_MODULE_0__.VertexBuffer.PositionKind];
        }
        if (this._indexBuffer) {
            this.engine._releaseBuffer(this._indexBuffer);
        }
        if (this._onContextRestoredObserver) {
            this.engine.onContextRestoredObservable.remove(this._onContextRestoredObserver);
            this._onContextRestoredObserver = null;
        }
    }
}
/**
 * Wraps an effect to be used for rendering
 */
class EffectWrapper {
    /**
     * Registers a shader code processing with an effect wrapper name.
     * @param effectWrapperName name of the effect wrapper. Use null for the fallback shader code processing. This is the shader code processing that will be used in case no specific shader code processing has been associated to an effect wrapper name
     * @param customShaderCodeProcessing shader code processing to associate to the effect wrapper name
     */
    static RegisterShaderCodeProcessing(effectWrapperName, customShaderCodeProcessing) {
        if (!customShaderCodeProcessing) {
            delete EffectWrapper._CustomShaderCodeProcessing[effectWrapperName ?? ""];
            return;
        }
        EffectWrapper._CustomShaderCodeProcessing[effectWrapperName ?? ""] = customShaderCodeProcessing;
    }
    static _GetShaderCodeProcessing(effectWrapperName) {
        return EffectWrapper._CustomShaderCodeProcessing[effectWrapperName] ?? EffectWrapper._CustomShaderCodeProcessing[""];
    }
    /**
     * Gets or sets the name of the effect wrapper
     */
    get name() {
        return this.options.name;
    }
    set name(value) {
        this.options.name = value;
    }
    /**
     * Get a value indicating if the effect is ready to be used
     * @returns true if the post-process is ready (shader is compiled)
     */
    isReady() {
        return this._drawWrapper.effect?.isReady() ?? false;
    }
    /**
     * Get the draw wrapper associated with the effect wrapper
     * @returns the draw wrapper associated with the effect wrapper
     */
    get drawWrapper() {
        return this._drawWrapper;
    }
    /**
     * The underlying effect
     */
    get effect() {
        return this._drawWrapper.effect;
    }
    set effect(effect) {
        this._drawWrapper.effect = effect;
    }
    /**
     * Creates an effect to be rendered
     * @param creationOptions options to create the effect
     */
    constructor(creationOptions) {
        /**
         * Type of alpha mode to use when applying the effect (default: Engine.ALPHA_DISABLE). Used only if useAsPostProcess is true.
         */
        this.alphaMode = 0;
        /**
         * Executed when the effect is created
         * @returns effect that was created for this effect wrapper
         */
        this.onEffectCreatedObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_2__.Observable(undefined, true);
        /**
         * Event that is fired (only when the EffectWrapper is used with an EffectRenderer) right before the effect is drawn (should be used to update uniforms)
         */
        this.onApplyObservable = new _Misc_observable_js__WEBPACK_IMPORTED_MODULE_2__.Observable();
        this._shadersLoaded = false;
        /** @internal */
        this._webGPUReady = false;
        this._importPromises = [];
        this.options = {
            ...creationOptions,
            name: creationOptions.name || "effectWrapper",
            engine: creationOptions.engine,
            uniforms: creationOptions.uniforms || creationOptions.uniformNames || [],
            uniformNames: undefined,
            samplers: creationOptions.samplers || creationOptions.samplerNames || [],
            samplerNames: undefined,
            attributeNames: creationOptions.attributeNames || ["position"],
            uniformBuffers: creationOptions.uniformBuffers || [],
            defines: creationOptions.defines || "",
            useShaderStore: creationOptions.useShaderStore || false,
            vertexUrl: creationOptions.vertexUrl || creationOptions.vertexShader || "postprocess",
            vertexShader: undefined,
            fragmentShader: creationOptions.fragmentShader || "pass",
            indexParameters: creationOptions.indexParameters,
            blockCompilation: creationOptions.blockCompilation || false,
            shaderLanguage: creationOptions.shaderLanguage || 0 /* ShaderLanguage.GLSL */,
            onCompiled: creationOptions.onCompiled || undefined,
            extraInitializations: creationOptions.extraInitializations || undefined,
            extraInitializationsAsync: creationOptions.extraInitializationsAsync || undefined,
            useAsPostProcess: creationOptions.useAsPostProcess ?? false,
        };
        this.options.uniformNames = this.options.uniforms;
        this.options.samplerNames = this.options.samplers;
        this.options.vertexShader = this.options.vertexUrl;
        if (this.options.useAsPostProcess) {
            if (this.options.samplers.indexOf("textureSampler") === -1) {
                this.options.samplers.push("textureSampler");
            }
            if (this.options.uniforms.indexOf("scale") === -1) {
                this.options.uniforms.push("scale");
            }
        }
        if (creationOptions.vertexUrl || creationOptions.vertexShader) {
            this._shaderPath = {
                vertexSource: this.options.vertexShader,
            };
        }
        else {
            if (!this.options.useAsPostProcess) {
                this.options.uniforms.push("scale");
                this.onApplyObservable.add(() => {
                    this.effect.setFloat2("scale", 1, 1);
                });
            }
            this._shaderPath = {
                vertex: this.options.vertexShader,
            };
        }
        this._shaderPath.fragmentSource = this.options.fragmentShader;
        this._shaderPath.spectorName = this.options.name;
        if (this.options.useShaderStore) {
            this._shaderPath.fragment = this._shaderPath.fragmentSource;
            if (!this._shaderPath.vertex) {
                this._shaderPath.vertex = this._shaderPath.vertexSource;
            }
            delete this._shaderPath.fragmentSource;
            delete this._shaderPath.vertexSource;
        }
        this.onApplyObservable.add(() => {
            this.bind();
        });
        if (!this.options.useShaderStore) {
            this._onContextRestoredObserver = this.options.engine.onContextRestoredObservable.add(() => {
                this.effect._pipelineContext = null; // because _prepareEffect will try to dispose this pipeline before recreating it and that would lead to webgl errors
                this.effect._prepareEffect();
            });
        }
        this._drawWrapper = new _drawWrapper_js__WEBPACK_IMPORTED_MODULE_4__.DrawWrapper(this.options.engine);
        this._webGPUReady = this.options.shaderLanguage === 1 /* ShaderLanguage.WGSL */;
        const defines = Array.isArray(this.options.defines) ? this.options.defines.join("\n") : this.options.defines;
        this._postConstructor(this.options.blockCompilation, defines, this.options.extraInitializations);
    }
    _gatherImports(useWebGPU = false, list) {
        if (!this.options.useAsPostProcess) {
            return;
        }
        // this._webGPUReady is used to detect when an effect wrapper is intended to be used with WebGPU
        if (useWebGPU && this._webGPUReady) {
            list.push(Promise.all([__webpack_require__.e(/* import() */ 18).then(__webpack_require__.bind(__webpack_require__, 241))]));
        }
        else {
            list.push(Promise.all([Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 203))]));
        }
    }
    /** @internal */
    _postConstructor(blockCompilation, defines = null, extraInitializations, importPromises) {
        this._importPromises.length = 0;
        if (importPromises) {
            this._importPromises.push(...importPromises);
        }
        const useWebGPU = this.options.engine.isWebGPU && !EffectWrapper.ForceGLSL;
        this._gatherImports(useWebGPU, this._importPromises);
        if (extraInitializations !== undefined) {
            extraInitializations(useWebGPU, this._importPromises);
        }
        if (useWebGPU && this._webGPUReady) {
            this.options.shaderLanguage = 1 /* ShaderLanguage.WGSL */;
        }
        if (!blockCompilation) {
            this.updateEffect(defines);
        }
    }
    /**
     * Updates the effect with the current effect wrapper compile time values and recompiles the shader.
     * @param defines Define statements that should be added at the beginning of the shader. (default: null)
     * @param uniforms Set of uniform variables that will be passed to the shader. (default: null)
     * @param samplers Set of Texture2D variables that will be passed to the shader. (default: null)
     * @param indexParameters The index parameters to be used for babylons include syntax "#include<kernelBlurVaryingDeclaration>[0..varyingCount]". (default: undefined) See usage in babylon.blurPostProcess.ts and kernelBlur.vertex.fx
     * @param onCompiled Called when the shader has been compiled.
     * @param onError Called if there is an error when compiling a shader.
     * @param vertexUrl The url of the vertex shader to be used (default: the one given at construction time)
     * @param fragmentUrl The url of the fragment shader to be used (default: the one given at construction time)
     */
    updateEffect(defines = null, uniforms = null, samplers = null, indexParameters, onCompiled, onError, vertexUrl, fragmentUrl) {
        const customShaderCodeProcessing = EffectWrapper._GetShaderCodeProcessing(this.name);
        if (customShaderCodeProcessing?.defineCustomBindings) {
            const newUniforms = uniforms?.slice() ?? [];
            newUniforms.push(...this.options.uniforms);
            const newSamplers = samplers?.slice() ?? [];
            newSamplers.push(...this.options.samplers);
            defines = customShaderCodeProcessing.defineCustomBindings(this.name, defines, newUniforms, newSamplers);
            uniforms = newUniforms;
            samplers = newSamplers;
        }
        this.options.defines = defines || "";
        const waitImportsLoaded = this._shadersLoaded || this._importPromises.length === 0
            ? undefined
            : async () => {
                await Promise.all(this._importPromises);
                this._shadersLoaded = true;
            };
        let extraInitializationsAsync;
        if (this.options.extraInitializationsAsync) {
            extraInitializationsAsync = async () => {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                waitImportsLoaded?.();
                await this.options.extraInitializationsAsync();
            };
        }
        else {
            extraInitializationsAsync = waitImportsLoaded;
        }
        if (this.options.useShaderStore) {
            this._drawWrapper.effect = this.options.engine.createEffect({ vertex: vertexUrl ?? this._shaderPath.vertex, fragment: fragmentUrl ?? this._shaderPath.fragment }, {
                attributes: this.options.attributeNames,
                uniformsNames: uniforms || this.options.uniforms,
                uniformBuffersNames: this.options.uniformBuffers,
                samplers: samplers || this.options.samplers,
                defines: defines !== null ? defines : "",
                fallbacks: null,
                onCompiled: onCompiled ?? this.options.onCompiled,
                onError: onError ?? null,
                indexParameters: indexParameters || this.options.indexParameters,
                processCodeAfterIncludes: customShaderCodeProcessing?.processCodeAfterIncludes
                    ? (shaderType, code) => customShaderCodeProcessing.processCodeAfterIncludes(this.name, shaderType, code)
                    : null,
                processFinalCode: customShaderCodeProcessing?.processFinalCode
                    ? (shaderType, code) => customShaderCodeProcessing.processFinalCode(this.name, shaderType, code)
                    : null,
                shaderLanguage: this.options.shaderLanguage,
                extraInitializationsAsync,
            }, this.options.engine);
        }
        else {
            this._drawWrapper.effect = new _effect_js__WEBPACK_IMPORTED_MODULE_3__.Effect(this._shaderPath, this.options.attributeNames, uniforms || this.options.uniforms, samplers || this.options.samplerNames, this.options.engine, defines, undefined, onCompiled || this.options.onCompiled, undefined, undefined, undefined, this.options.shaderLanguage, extraInitializationsAsync);
        }
        this.onEffectCreatedObservable.notifyObservers(this._drawWrapper.effect);
    }
    /**
     * Binds the data to the effect.
     * @param noDefaultBindings if true, the default bindings (scale and alpha mode) will not be set.
     */
    bind(noDefaultBindings = false) {
        if (this.options.useAsPostProcess && !noDefaultBindings) {
            this.options.engine.setAlphaMode(this.alphaMode);
            this.drawWrapper.effect.setFloat2("scale", 1, 1);
        }
        EffectWrapper._GetShaderCodeProcessing(this.name)?.bindCustomBindings?.(this.name, this._drawWrapper.effect);
    }
    /**
     * Disposes of the effect wrapper
     * @param _ignored kept for backward compatibility
     */
    dispose(_ignored = false) {
        if (this._onContextRestoredObserver) {
            this.effect.getEngine().onContextRestoredObservable.remove(this._onContextRestoredObserver);
            this._onContextRestoredObserver = null;
        }
        this.onEffectCreatedObservable.clear();
        this._drawWrapper.dispose(true);
    }
}
/**
 * Force code to compile to glsl even on WebGPU engines.
 * False by default. This is mostly meant for backward compatibility.
 */
EffectWrapper.ForceGLSL = false;
EffectWrapper._CustomShaderCodeProcessing = {};
//# sourceMappingURL=effectRenderer.js.map

/***/ }),

/***/ 203:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   postprocessVertexShader: () => (/* binding */ postprocessVertexShader)
/* harmony export */ });
/* harmony import */ var _Engines_shaderStore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(43);
// Do not edit.

const name = "postprocessVertexShader";
const shader = `attribute vec2 position;uniform vec2 scale;varying vec2 vUV;const vec2 madd=vec2(0.5,0.5);
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
vUV=(position*madd+madd)*scale;gl_Position=vec4(position,0.0,1.0);
#define CUSTOM_VERTEX_MAIN_END
}`;
// Sideeffect
if (!_Engines_shaderStore_js__WEBPACK_IMPORTED_MODULE_0__.ShaderStore.ShadersStore[name]) {
    _Engines_shaderStore_js__WEBPACK_IMPORTED_MODULE_0__.ShaderStore.ShadersStore[name] = shader;
}
/** @internal */
const postprocessVertexShader = { name, shader };
//# sourceMappingURL=postprocess.vertex.js.map

/***/ }),

/***/ 204:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ThinPassCubePostProcess: () => (/* binding */ ThinPassCubePostProcess),
/* harmony export */   ThinPassPostProcess: () => (/* binding */ ThinPassPostProcess)
/* harmony export */ });
/* harmony import */ var _Materials_effectRenderer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202);
/* harmony import */ var _Engines_engine_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(76);


/**
 * PassPostProcess which produces an output the same as it's input
 */
class ThinPassPostProcess extends _Materials_effectRenderer_js__WEBPACK_IMPORTED_MODULE_0__.EffectWrapper {
    _gatherImports(useWebGPU, list) {
        if (useWebGPU) {
            this._webGPUReady = true;
            list.push(Promise.all([__webpack_require__.e(/* import() */ 19).then(__webpack_require__.bind(__webpack_require__, 242))]));
        }
        else {
            list.push(Promise.all([__webpack_require__.e(/* import() */ 20).then(__webpack_require__.bind(__webpack_require__, 243))]));
        }
        super._gatherImports(useWebGPU, list);
    }
    /**
     * Constructs a new pass post process
     * @param name Name of the effect
     * @param engine Engine to use to render the effect. If not provided, the last created engine will be used
     * @param options Options to configure the effect
     */
    constructor(name, engine = null, options) {
        super({
            ...options,
            name,
            engine: engine || _Engines_engine_js__WEBPACK_IMPORTED_MODULE_1__.Engine.LastCreatedEngine,
            useShaderStore: true,
            useAsPostProcess: true,
            fragmentShader: ThinPassPostProcess.FragmentUrl,
        });
    }
}
/**
 * The fragment shader url
 */
ThinPassPostProcess.FragmentUrl = "pass";
/**
 * PassCubePostProcess which produces an output the same as it's input (which must be a cube texture)
 */
class ThinPassCubePostProcess extends _Materials_effectRenderer_js__WEBPACK_IMPORTED_MODULE_0__.EffectWrapper {
    _gatherImports(useWebGPU, list) {
        if (useWebGPU) {
            this._webGPUReady = true;
            list.push(Promise.all([__webpack_require__.e(/* import() */ 21).then(__webpack_require__.bind(__webpack_require__, 244))]));
        }
        else {
            list.push(Promise.all([__webpack_require__.e(/* import() */ 22).then(__webpack_require__.bind(__webpack_require__, 245))]));
        }
        super._gatherImports(useWebGPU, list);
    }
    /**
     * Creates the PassCubePostProcess
     * @param name Name of the effect
     * @param engine Engine to use to render the effect. If not provided, the last created engine will be used
     * @param options Options to configure the effect
     */
    constructor(name, engine = null, options) {
        super({
            ...options,
            name,
            engine: engine || _Engines_engine_js__WEBPACK_IMPORTED_MODULE_1__.Engine.LastCreatedEngine,
            useShaderStore: true,
            useAsPostProcess: true,
            fragmentShader: ThinPassCubePostProcess.FragmentUrl,
            defines: "#define POSITIVEX",
        });
        this._face = 0;
    }
    /**
     * Gets or sets the cube face to display.
     *  * 0 is +X
     *  * 1 is -X
     *  * 2 is +Y
     *  * 3 is -Y
     *  * 4 is +Z
     *  * 5 is -Z
     */
    get face() {
        return this._face;
    }
    set face(value) {
        if (value < 0 || value > 5) {
            return;
        }
        this._face = value;
        switch (this._face) {
            case 0:
                this.updateEffect("#define POSITIVEX");
                break;
            case 1:
                this.updateEffect("#define NEGATIVEX");
                break;
            case 2:
                this.updateEffect("#define POSITIVEY");
                break;
            case 3:
                this.updateEffect("#define NEGATIVEY");
                break;
            case 4:
                this.updateEffect("#define POSITIVEZ");
                break;
            case 5:
                this.updateEffect("#define NEGATIVEZ");
                break;
        }
    }
}
/**
 * The fragment shader url
 */
ThinPassCubePostProcess.FragmentUrl = "passCube";
//# sourceMappingURL=thinPassPostProcess.js.map

/***/ })

}]);