"use strict";
(self["webpackChunkbabylon"] = self["webpackChunkbabylon"] || []).push([[7],{

/***/ 210:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _ENVTextureLoader: () => (/* binding */ _ENVTextureLoader)
/* harmony export */ });
/* harmony import */ var _Misc_environmentTextureTools_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(211);

/**
 * Implementation of the ENV Texture Loader.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
class _ENVTextureLoader {
    constructor() {
        /**
         * Defines whether the loader supports cascade loading the different faces.
         */
        this.supportCascades = false;
    }
    /**
     * Uploads the cube texture data to the WebGL texture. It has already been bound.
     * @param data contains the texture data
     * @param texture defines the BabylonJS internal texture
     * @param createPolynomials will be true if polynomials have been requested
     * @param onLoad defines the callback to trigger once the texture is ready
     * @param onError defines the callback to trigger in case of error
     */
    loadCubeData(data, texture, createPolynomials, onLoad, onError) {
        if (Array.isArray(data)) {
            return;
        }
        const info = (0,_Misc_environmentTextureTools_js__WEBPACK_IMPORTED_MODULE_0__.GetEnvInfo)(data);
        if (info) {
            texture.width = info.width;
            texture.height = info.width;
            try {
                (0,_Misc_environmentTextureTools_js__WEBPACK_IMPORTED_MODULE_0__.UploadEnvSpherical)(texture, info);
                // eslint-disable-next-line github/no-then
                (0,_Misc_environmentTextureTools_js__WEBPACK_IMPORTED_MODULE_0__.UploadEnvLevelsAsync)(texture, data, info).then(() => {
                    texture.isReady = true;
                    texture.onLoadedObservable.notifyObservers(texture);
                    texture.onLoadedObservable.clear();
                    if (onLoad) {
                        onLoad();
                    }
                }, (reason) => {
                    onError?.("Can not upload environment levels", reason);
                });
            }
            catch (e) {
                onError?.("Can not upload environment file", e);
            }
        }
        else if (onError) {
            onError("Can not parse the environment file", null);
        }
    }
    /**
     * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
     */
    loadData() {
        // eslint-disable-next-line no-throw-literal
        throw ".env not supported in 2d.";
    }
}
//# sourceMappingURL=envTextureLoader.js.map

/***/ }),

/***/ 211:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CreateEnvTextureAsync: () => (/* binding */ CreateEnvTextureAsync),
/* harmony export */   CreateIrradianceImageDataArrayBufferViews: () => (/* binding */ CreateIrradianceImageDataArrayBufferViews),
/* harmony export */   CreateRadianceImageDataArrayBufferViews: () => (/* binding */ CreateRadianceImageDataArrayBufferViews),
/* harmony export */   EnvironmentTextureTools: () => (/* binding */ EnvironmentTextureTools),
/* harmony export */   GetEnvInfo: () => (/* binding */ GetEnvInfo),
/* harmony export */   UploadEnvLevelsAsync: () => (/* binding */ UploadEnvLevelsAsync),
/* harmony export */   UploadEnvSpherical: () => (/* binding */ UploadEnvSpherical),
/* harmony export */   UploadIrradianceLevelsAsync: () => (/* binding */ UploadIrradianceLevelsAsync),
/* harmony export */   UploadRadianceLevelsAsync: () => (/* binding */ UploadRadianceLevelsAsync),
/* harmony export */   _UpdateRGBDAsync: () => (/* binding */ _UpdateRGBDAsync),
/* harmony export */   normalizeEnvInfo: () => (/* binding */ normalizeEnvInfo)
/* harmony export */ });
/* harmony import */ var _tools_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(17);
/* harmony import */ var _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(12);
/* harmony import */ var _Maths_sphericalPolynomial_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(98);
/* harmony import */ var _Materials_Textures_internalTexture_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(51);
/* harmony import */ var _Materials_Textures_baseTexture_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(103);
/* harmony import */ var _scene_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(146);
/* harmony import */ var _PostProcesses_postProcess_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(201);
/* harmony import */ var _Misc_logger_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(19);
/* harmony import */ var _rgbdTextureTools_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(212);
/* harmony import */ var _Misc_dumpTools_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(213);
/* harmony import */ var _Materials_Textures_baseTexture_polynomial_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(214);













const DefaultEnvironmentTextureImageType = "image/png";
const CurrentVersion = 2;
/**
 * Magic number identifying the env file.
 */
const MagicBytes = [0x86, 0x16, 0x87, 0x96, 0xf6, 0xd6, 0x96, 0x36];
/**
 * Gets the environment info from an env file.
 * @param data The array buffer containing the .env bytes.
 * @returns the environment file info (the json header) if successfully parsed, normalized to the latest supported version.
 */
function GetEnvInfo(data) {
    const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let pos = 0;
    for (let i = 0; i < MagicBytes.length; i++) {
        if (dataView.getUint8(pos++) !== MagicBytes[i]) {
            _Misc_logger_js__WEBPACK_IMPORTED_MODULE_8__.Logger.Error("Not a babylon environment map");
            return null;
        }
    }
    // Read json manifest - collect characters up to null terminator
    let manifestString = "";
    let charCode = 0x00;
    while ((charCode = dataView.getUint8(pos++))) {
        manifestString += String.fromCharCode(charCode);
    }
    let manifest = JSON.parse(manifestString);
    manifest = normalizeEnvInfo(manifest);
    // Extend the header with the position of the payload.
    manifest.binaryDataPosition = pos;
    if (manifest.specular) {
        // Fallback to 0.8 exactly if lodGenerationScale is not defined for backward compatibility.
        manifest.specular.lodGenerationScale = manifest.specular.lodGenerationScale || 0.8;
    }
    return manifest;
}
/**
 * Normalizes any supported version of the environment file info to the latest version
 * @param info environment file info on any supported version
 * @returns environment file info in the latest supported version
 * @private
 */
function normalizeEnvInfo(info) {
    if (info.version > CurrentVersion) {
        throw new Error(`Unsupported babylon environment map version "${info.version}". Latest supported version is "${CurrentVersion}".`);
    }
    if (info.version === 2) {
        return info;
    }
    // Migrate a v1 info to v2
    info = { ...info, version: 2, imageType: DefaultEnvironmentTextureImageType };
    return info;
}
/**
 * Creates an environment texture from a loaded cube texture.
 * @param texture defines the cube texture to convert in env file
 * @param options options for the conversion process
 * @returns a promise containing the environment data if successful.
 */
async function CreateEnvTextureAsync(texture, options = {}) {
    const internalTexture = texture.getInternalTexture();
    if (!internalTexture) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        return await Promise.reject("The cube texture is invalid.");
    }
    const engine = internalTexture.getEngine();
    if (texture.textureType !== 2 &&
        texture.textureType !== 1 &&
        texture.textureType !== 0 &&
        texture.textureType !== 0 &&
        texture.textureType !== 7 &&
        texture.textureType !== -1) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        return await Promise.reject("The cube texture should allow HDR (Full Float or Half Float).");
    }
    let textureType = 1;
    if (!engine.getCaps().textureFloatRender) {
        textureType = 2;
        if (!engine.getCaps().textureHalfFloatRender) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            return await Promise.reject("Env texture can only be created when the browser supports half float or full float rendering.");
        }
    }
    // sphericalPolynomial is lazy loaded so simply accessing it should trigger the computation.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    texture.sphericalPolynomial;
    // Lets keep track of the polynomial promise so we can wait for it to be ready before generating the pixels.
    const sphericalPolynomialPromise = texture.getInternalTexture()?._sphericalPolynomialPromise;
    const cubeWidth = internalTexture.width;
    const hostingScene = new _scene_js__WEBPACK_IMPORTED_MODULE_6__.Scene(engine);
    const specularTextures = {};
    const diffuseTextures = {};
    // As we are going to readPixels the faces of the cube, make sure the drawing/update commands for the cube texture are fully sent to the GPU in case it is drawn for the first time in this very frame!
    engine.flushFramebuffer();
    const imageType = options.imageType ?? DefaultEnvironmentTextureImageType;
    // Read and collect all mipmaps data from the cube.
    const mipmapsCount = (0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_2__.ILog2)(internalTexture.width);
    for (let i = 0; i <= mipmapsCount; i++) {
        const faceWidth = Math.pow(2, mipmapsCount - i);
        // All faces of the cube.
        for (let face = 0; face < 6; face++) {
            // eslint-disable-next-line no-await-in-loop
            specularTextures[i * 6 + face] = await _GetTextureEncodedDataAsync(hostingScene, texture, textureType, face, i, faceWidth, imageType, options.imageQuality);
        }
    }
    // Read and collect all irradiance data from the cube.
    const irradianceTexture = options.disableIrradianceTexture ? null : texture.irradianceTexture;
    if (irradianceTexture) {
        const faceWidth = irradianceTexture.getSize().width;
        // All faces of the cube.
        for (let face = 0; face < 6; face++) {
            // eslint-disable-next-line no-await-in-loop
            diffuseTextures[face] = await _GetTextureEncodedDataAsync(hostingScene, irradianceTexture, textureType, face, 0, faceWidth, imageType, options.imageQuality);
        }
    }
    // We can delete the hosting scene keeping track of all the creation objects
    hostingScene.dispose();
    // Ensure completion of the polynomial creation promise.
    if (sphericalPolynomialPromise) {
        await sphericalPolynomialPromise;
    }
    // Creates the json header for the env texture
    const info = {
        version: CurrentVersion,
        width: cubeWidth,
        imageType,
        irradiance: CreateEnvTextureIrradiance(texture),
        specular: {
            mipmaps: [],
            lodGenerationScale: texture.lodGenerationScale,
        },
    };
    // Sets the specular image data information
    let position = 0;
    for (let i = 0; i <= mipmapsCount; i++) {
        for (let face = 0; face < 6; face++) {
            const byteLength = specularTextures[i * 6 + face].byteLength;
            info.specular.mipmaps.push({
                length: byteLength,
                position: position,
            });
            position += byteLength;
        }
    }
    // Sets the irradiance image data information
    if (irradianceTexture) {
        info.irradiance = info.irradiance || {
            x: [0, 0, 0],
            xx: [0, 0, 0],
            y: [0, 0, 0],
            yy: [0, 0, 0],
            z: [0, 0, 0],
            zz: [0, 0, 0],
            yz: [0, 0, 0],
            zx: [0, 0, 0],
            xy: [0, 0, 0],
        };
        info.irradiance.irradianceTexture = {
            size: irradianceTexture.getSize().width,
            faces: [],
            dominantDirection: irradianceTexture._dominantDirection?.asArray(),
        };
        for (let face = 0; face < 6; face++) {
            const byteLength = diffuseTextures[face].byteLength;
            info.irradiance.irradianceTexture.faces.push({
                length: byteLength,
                position: position,
            });
            position += byteLength;
        }
    }
    // Encode the JSON as an array buffer
    const infoString = JSON.stringify(info);
    const infoBuffer = new ArrayBuffer(infoString.length + 1);
    const infoView = new Uint8Array(infoBuffer); // Limited to ascii subset matching unicode.
    for (let i = 0, strLen = infoString.length; i < strLen; i++) {
        infoView[i] = infoString.charCodeAt(i);
    }
    // Ends up with a null terminator for easier parsing
    infoView[infoString.length] = 0x00;
    // Computes the final required size and creates the storage
    const totalSize = MagicBytes.length + position + infoBuffer.byteLength;
    const finalBuffer = new ArrayBuffer(totalSize);
    const finalBufferView = new Uint8Array(finalBuffer);
    const dataView = new DataView(finalBuffer);
    // Copy the magic bytes identifying the file in
    let pos = 0;
    for (let i = 0; i < MagicBytes.length; i++) {
        dataView.setUint8(pos++, MagicBytes[i]);
    }
    // Add the json info
    finalBufferView.set(new Uint8Array(infoBuffer), pos);
    pos += infoBuffer.byteLength;
    // Finally inserts the radiance texture data
    for (let i = 0; i <= mipmapsCount; i++) {
        for (let face = 0; face < 6; face++) {
            const dataBuffer = specularTextures[i * 6 + face];
            finalBufferView.set(new Uint8Array(dataBuffer), pos);
            pos += dataBuffer.byteLength;
        }
    }
    // Finally inserts the irradiance texture data
    if (irradianceTexture) {
        for (let face = 0; face < 6; face++) {
            const dataBuffer = diffuseTextures[face];
            finalBufferView.set(new Uint8Array(dataBuffer), pos);
            pos += dataBuffer.byteLength;
        }
    }
    // Voila
    return finalBuffer;
}
/**
 * Get the texture encoded data from the current texture
 * @internal
 */
async function _GetTextureEncodedDataAsync(hostingScene, texture, textureType, face, i, size, imageType, imageQuality) {
    let faceData = await texture.readPixels(face, i, undefined, false);
    if (faceData && faceData.byteLength === faceData.length) {
        const faceDataFloat = new Float32Array(faceData.byteLength * 4);
        for (let i = 0; i < faceData.byteLength; i++) {
            faceDataFloat[i] = faceData[i] / 255;
            // Gamma to linear
            faceDataFloat[i] = Math.pow(faceDataFloat[i], 2.2);
        }
        faceData = faceDataFloat;
    }
    else if (faceData && texture.gammaSpace) {
        const floatData = faceData;
        for (let i = 0; i < floatData.length; i++) {
            // Gamma to linear
            floatData[i] = Math.pow(floatData[i], 2.2);
        }
    }
    const engine = hostingScene.getEngine();
    const tempTexture = engine.createRawTexture(faceData, size, size, 5, false, true, 1, null, textureType);
    await _rgbdTextureTools_js__WEBPACK_IMPORTED_MODULE_9__.RGBDTextureTools.EncodeTextureToRGBD(tempTexture, hostingScene, textureType);
    const rgbdEncodedData = await engine._readTexturePixels(tempTexture, size, size);
    const imageEncodedData = await (0,_Misc_dumpTools_js__WEBPACK_IMPORTED_MODULE_10__.DumpDataAsync)(size, size, rgbdEncodedData, imageType, undefined, false, true, imageQuality);
    tempTexture.dispose();
    return imageEncodedData;
}
/**
 * Creates a JSON representation of the spherical data.
 * @param texture defines the texture containing the polynomials
 * @returns the JSON representation of the spherical info
 */
function CreateEnvTextureIrradiance(texture) {
    const polynmials = texture.sphericalPolynomial;
    if (polynmials == null) {
        return null;
    }
    return {
        x: [polynmials.x.x, polynmials.x.y, polynmials.x.z],
        y: [polynmials.y.x, polynmials.y.y, polynmials.y.z],
        z: [polynmials.z.x, polynmials.z.y, polynmials.z.z],
        xx: [polynmials.xx.x, polynmials.xx.y, polynmials.xx.z],
        yy: [polynmials.yy.x, polynmials.yy.y, polynmials.yy.z],
        zz: [polynmials.zz.x, polynmials.zz.y, polynmials.zz.z],
        yz: [polynmials.yz.x, polynmials.yz.y, polynmials.yz.z],
        zx: [polynmials.zx.x, polynmials.zx.y, polynmials.zx.z],
        xy: [polynmials.xy.x, polynmials.xy.y, polynmials.xy.z],
    };
}
/**
 * Creates the ArrayBufferViews used for initializing environment texture image data.
 * @param data the image data
 * @param info parameters that determine what views will be created for accessing the underlying buffer
 * @returns the views described by info providing access to the underlying buffer
 */
function CreateRadianceImageDataArrayBufferViews(data, info) {
    info = normalizeEnvInfo(info);
    const specularInfo = info.specular;
    // Double checks the enclosed info
    let mipmapsCount = Math.log2(info.width);
    mipmapsCount = Math.round(mipmapsCount) + 1;
    if (specularInfo.mipmaps.length !== 6 * mipmapsCount) {
        throw new Error(`Unsupported specular mipmaps number "${specularInfo.mipmaps.length}"`);
    }
    const imageData = new Array(mipmapsCount);
    for (let i = 0; i < mipmapsCount; i++) {
        imageData[i] = new Array(6);
        for (let face = 0; face < 6; face++) {
            const imageInfo = specularInfo.mipmaps[i * 6 + face];
            imageData[i][face] = new Uint8Array(data.buffer, data.byteOffset + info.binaryDataPosition + imageInfo.position, imageInfo.length);
        }
    }
    return imageData;
}
/**
 * Creates the ArrayBufferViews used for initializing environment texture image data.
 * @param data the image data
 * @param info parameters that determine what views will be created for accessing the underlying buffer
 * @returns the views described by info providing access to the underlying buffer
 */
function CreateIrradianceImageDataArrayBufferViews(data, info) {
    info = normalizeEnvInfo(info);
    const imageData = new Array(6);
    const irradianceTexture = info.irradiance?.irradianceTexture;
    if (irradianceTexture) {
        if (irradianceTexture.faces.length !== 6) {
            throw new Error(`Incorrect irradiance texture faces number "${irradianceTexture.faces.length}"`);
        }
        for (let face = 0; face < 6; face++) {
            const imageInfo = irradianceTexture.faces[face];
            imageData[face] = new Uint8Array(data.buffer, data.byteOffset + info.binaryDataPosition + imageInfo.position, imageInfo.length);
        }
    }
    return imageData;
}
/**
 * Uploads the texture info contained in the env file to the GPU.
 * @param texture defines the internal texture to upload to
 * @param data defines the data to load
 * @param info defines the texture info retrieved through the GetEnvInfo method
 * @returns a promise
 */
// eslint-disable-next-line @typescript-eslint/promise-function-async, no-restricted-syntax
function UploadEnvLevelsAsync(texture, data, info) {
    info = normalizeEnvInfo(info);
    const specularInfo = info.specular;
    if (!specularInfo) {
        // Nothing else parsed so far
        return Promise.resolve([]);
    }
    texture._lodGenerationScale = specularInfo.lodGenerationScale;
    const promises = [];
    const radianceImageData = CreateRadianceImageDataArrayBufferViews(data, info);
    promises.push(UploadRadianceLevelsAsync(texture, radianceImageData, info.imageType));
    const irradianceTexture = info.irradiance?.irradianceTexture;
    if (irradianceTexture) {
        const irradianceImageData = CreateIrradianceImageDataArrayBufferViews(data, info);
        let dominantDirection = null;
        if (info.irradiance?.irradianceTexture?.dominantDirection) {
            dominantDirection = _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_1__.Vector3.FromArray(info.irradiance.irradianceTexture.dominantDirection);
        }
        promises.push(UploadIrradianceLevelsAsync(texture, irradianceImageData, irradianceTexture.size, info.imageType, dominantDirection));
    }
    return Promise.all(promises);
}
async function _OnImageReadyAsync(image, engine, expandTexture, rgbdPostProcess, url, face, i, generateNonLODTextures, lodTextures, cubeRtt, texture) {
    return await new Promise((resolve, reject) => {
        if (expandTexture) {
            const tempTexture = engine.createTexture(null, true, true, null, 1, null, (message) => {
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                reject(message);
            }, image);
            rgbdPostProcess?.onEffectCreatedObservable.addOnce((effect) => {
                effect.executeWhenCompiled(() => {
                    // Uncompress the data to a RTT
                    rgbdPostProcess.externalTextureSamplerBinding = true;
                    rgbdPostProcess.onApply = (effect) => {
                        effect._bindTexture("textureSampler", tempTexture);
                        effect.setFloat2("scale", 1, engine._features.needsInvertingBitmap && image instanceof ImageBitmap ? -1 : 1);
                    };
                    if (!engine.scenes.length) {
                        return;
                    }
                    engine.scenes[0].postProcessManager.directRender([rgbdPostProcess], cubeRtt, true, face, i);
                    // Cleanup
                    engine.restoreDefaultFramebuffer();
                    tempTexture.dispose();
                    URL.revokeObjectURL(url);
                    resolve();
                });
            });
        }
        else {
            engine._uploadImageToTexture(texture, image, face, i);
            // Upload the face to the non lod texture support
            if (generateNonLODTextures) {
                const lodTexture = lodTextures[i];
                if (lodTexture) {
                    engine._uploadImageToTexture(lodTexture._texture, image, face, 0);
                }
            }
            resolve();
        }
    });
}
/**
 * Uploads the levels of image data to the GPU.
 * @param texture defines the internal texture to upload to
 * @param imageData defines the array buffer views of image data [mipmap][face]
 * @param imageType the mime type of the image data
 * @returns a promise
 */
async function UploadRadianceLevelsAsync(texture, imageData, imageType = DefaultEnvironmentTextureImageType) {
    const engine = texture.getEngine();
    texture.format = 5;
    texture.type = 0;
    texture.generateMipMaps = true;
    texture._cachedAnisotropicFilteringLevel = null;
    engine.updateTextureSamplingMode(3, texture);
    await _UploadLevelsAsync(texture, imageData, true, imageType);
    // Flag internal texture as ready in case they are in use.
    texture.isReady = true;
}
/**
 * Uploads the levels of image data to the GPU.
 * @param mainTexture defines the internal texture to upload to
 * @param imageData defines the array buffer views of image data [mipmap][face]
 * @param size defines the size of the texture faces
 * @param imageType the mime type of the image data
 * @param dominantDirection the dominant direction of light in the environment texture, if available
 * @returns a promise
 */
async function UploadIrradianceLevelsAsync(mainTexture, imageData, size, imageType = DefaultEnvironmentTextureImageType, dominantDirection = null) {
    // Gets everything ready.
    const engine = mainTexture.getEngine();
    const texture = new _Materials_Textures_internalTexture_js__WEBPACK_IMPORTED_MODULE_4__.InternalTexture(engine, 5 /* InternalTextureSource.RenderTarget */);
    const baseTexture = new _Materials_Textures_baseTexture_js__WEBPACK_IMPORTED_MODULE_5__.BaseTexture(engine, texture);
    mainTexture._irradianceTexture = baseTexture;
    baseTexture._dominantDirection = dominantDirection;
    texture.isCube = true;
    texture.format = 5;
    texture.type = 0;
    texture.generateMipMaps = true;
    texture._cachedAnisotropicFilteringLevel = null;
    texture.generateMipMaps = true;
    texture.width = size;
    texture.height = size;
    engine.updateTextureSamplingMode(3, texture);
    await _UploadLevelsAsync(texture, [imageData], false, imageType);
    engine.generateMipMapsForCubemap(texture);
    // Flag internal texture as ready in case they are in use.
    texture.isReady = true;
}
/**
 * Uploads the levels of image data to the GPU.
 * @param texture defines the internal texture to upload to
 * @param imageData defines the array buffer views of image data [mipmap][face]
 * @param canGenerateNonLODTextures defines whether or not to generate non lod textures
 * @param imageType the mime type of the image data
 * @returns a promise
 */
async function _UploadLevelsAsync(texture, imageData, canGenerateNonLODTextures, imageType = DefaultEnvironmentTextureImageType) {
    if (!_tools_js__WEBPACK_IMPORTED_MODULE_0__.Tools.IsExponentOfTwo(texture.width)) {
        throw new Error("Texture size must be a power of two");
    }
    const mipmapsCount = (0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_2__.ILog2)(texture.width) + 1;
    // Gets everything ready.
    const engine = texture.getEngine();
    let expandTexture = false;
    let generateNonLODTextures = false;
    let rgbdPostProcess = null;
    let cubeRtt = null;
    let lodTextures = null;
    const caps = engine.getCaps();
    if (!caps.textureLOD) {
        expandTexture = false;
        generateNonLODTextures = canGenerateNonLODTextures;
    }
    else if (!engine._features.supportRenderAndCopyToLodForFloatTextures) {
        expandTexture = false;
    }
    // If half float available we can uncompress the texture
    else if (caps.textureHalfFloatRender && caps.textureHalfFloatLinearFiltering) {
        expandTexture = true;
        texture.type = 2;
    }
    // If full float available we can uncompress the texture
    else if (caps.textureFloatRender && caps.textureFloatLinearFiltering) {
        expandTexture = true;
        texture.type = 1;
    }
    // Expand the texture if possible
    let shaderLanguage = 0 /* ShaderLanguage.GLSL */;
    if (expandTexture) {
        if (engine.isWebGPU) {
            shaderLanguage = 1 /* ShaderLanguage.WGSL */;
            await __webpack_require__.e(/* import() */ 23).then(__webpack_require__.bind(__webpack_require__, 246));
        }
        else {
            await __webpack_require__.e(/* import() */ 25).then(__webpack_require__.bind(__webpack_require__, 248));
        }
        // Simply run through the decode PP
        rgbdPostProcess = new _PostProcesses_postProcess_js__WEBPACK_IMPORTED_MODULE_7__.PostProcess("rgbdDecode", "rgbdDecode", null, null, 1, null, 3, engine, false, undefined, texture.type, undefined, null, false, undefined, shaderLanguage);
        texture._isRGBD = false;
        texture.invertY = false;
        cubeRtt = engine.createRenderTargetCubeTexture(texture.width, {
            generateDepthBuffer: false,
            generateMipMaps: true,
            generateStencilBuffer: false,
            samplingMode: 3,
            type: texture.type,
            format: 5,
        });
    }
    else {
        texture._isRGBD = true;
        texture.invertY = true;
        // In case of missing support, applies the same patch than DDS files.
        if (generateNonLODTextures) {
            const mipSlices = 3;
            lodTextures = {};
            const scale = texture._lodGenerationScale;
            const offset = texture._lodGenerationOffset;
            for (let i = 0; i < mipSlices; i++) {
                //compute LOD from even spacing in smoothness (matching shader calculation)
                const smoothness = i / (mipSlices - 1);
                const roughness = 1 - smoothness;
                const minLODIndex = offset; // roughness = 0
                const maxLODIndex = (mipmapsCount - 1) * scale + offset; // roughness = 1 (mipmaps start from 0)
                const lodIndex = minLODIndex + (maxLODIndex - minLODIndex) * roughness;
                const mipmapIndex = Math.round(Math.min(Math.max(lodIndex, 0), maxLODIndex));
                //compute LOD from even spacing in smoothness (matching shader calculation)
                const glTextureFromLod = new _Materials_Textures_internalTexture_js__WEBPACK_IMPORTED_MODULE_4__.InternalTexture(engine, 2 /* InternalTextureSource.Temp */);
                glTextureFromLod.isCube = true;
                glTextureFromLod.invertY = true;
                glTextureFromLod.generateMipMaps = false;
                engine.updateTextureSamplingMode(2, glTextureFromLod);
                // Wrap in a base texture for easy binding.
                const lodTexture = new _Materials_Textures_baseTexture_js__WEBPACK_IMPORTED_MODULE_5__.BaseTexture(null);
                lodTexture._isCube = true;
                lodTexture._texture = glTextureFromLod;
                lodTextures[mipmapIndex] = lodTexture;
                switch (i) {
                    case 0:
                        texture._lodTextureLow = lodTexture;
                        break;
                    case 1:
                        texture._lodTextureMid = lodTexture;
                        break;
                    case 2:
                        texture._lodTextureHigh = lodTexture;
                        break;
                }
            }
        }
    }
    const promises = [];
    // All mipmaps up to provided number of images
    for (let i = 0; i < imageData.length; i++) {
        // All faces
        for (let face = 0; face < 6; face++) {
            // Constructs an image element from image data
            const bytes = imageData[i][face];
            const blob = new Blob([bytes], { type: imageType });
            const url = URL.createObjectURL(blob);
            let promise;
            if (engine._features.forceBitmapOverHTMLImageElement) {
                // eslint-disable-next-line github/no-then
                promise = engine.createImageBitmap(blob, { premultiplyAlpha: "none" }).then(async (img) => {
                    return await _OnImageReadyAsync(img, engine, expandTexture, rgbdPostProcess, url, face, i, generateNonLODTextures, lodTextures, cubeRtt, texture);
                });
            }
            else {
                const image = new Image();
                image.src = url;
                // Enqueue promise to upload to the texture.
                promise = new Promise((resolve, reject) => {
                    image.onload = () => {
                        _OnImageReadyAsync(image, engine, expandTexture, rgbdPostProcess, url, face, i, generateNonLODTextures, lodTextures, cubeRtt, texture)
                            // eslint-disable-next-line github/no-then
                            .then(() => resolve())
                            // eslint-disable-next-line github/no-then
                            .catch((reason) => {
                            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                            reject(reason);
                        });
                    };
                    image.onerror = (error) => {
                        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                        reject(error);
                    };
                });
            }
            promises.push(promise);
        }
    }
    await Promise.all(promises);
    // Fill remaining mipmaps with black textures.
    if (imageData.length < mipmapsCount) {
        let data;
        const size = Math.pow(2, mipmapsCount - 1 - imageData.length);
        const dataLength = size * size * 4;
        switch (texture.type) {
            case 0: {
                data = new Uint8Array(dataLength);
                break;
            }
            case 2: {
                data = new Uint16Array(dataLength);
                break;
            }
            case 1: {
                data = new Float32Array(dataLength);
                break;
            }
        }
        for (let i = imageData.length; i < mipmapsCount; i++) {
            for (let face = 0; face < 6; face++) {
                engine._uploadArrayBufferViewToTexture(cubeRtt?.texture || texture, data, face, i);
            }
        }
    }
    // Release temp RTT.
    if (cubeRtt) {
        const irradiance = texture._irradianceTexture;
        texture._irradianceTexture = null;
        engine._releaseTexture(texture);
        cubeRtt._swapAndDie(texture);
        texture._irradianceTexture = irradiance;
    }
    // Release temp Post Process.
    if (rgbdPostProcess) {
        rgbdPostProcess.dispose();
    }
    // Flag internal texture as ready in case they are in use.
    if (generateNonLODTextures) {
        if (texture._lodTextureHigh && texture._lodTextureHigh._texture) {
            texture._lodTextureHigh._texture.isReady = true;
        }
        if (texture._lodTextureMid && texture._lodTextureMid._texture) {
            texture._lodTextureMid._texture.isReady = true;
        }
        if (texture._lodTextureLow && texture._lodTextureLow._texture) {
            texture._lodTextureLow._texture.isReady = true;
        }
    }
}
/**
 * Uploads spherical polynomials information to the texture.
 * @param texture defines the texture we are trying to upload the information to
 * @param info defines the environment texture info retrieved through the GetEnvInfo method
 */
function UploadEnvSpherical(texture, info) {
    info = normalizeEnvInfo(info);
    const irradianceInfo = info.irradiance;
    if (!irradianceInfo) {
        return;
    }
    const sp = new _Maths_sphericalPolynomial_js__WEBPACK_IMPORTED_MODULE_3__.SphericalPolynomial();
    _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_1__.Vector3.FromArrayToRef(irradianceInfo.x, 0, sp.x);
    _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_1__.Vector3.FromArrayToRef(irradianceInfo.y, 0, sp.y);
    _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_1__.Vector3.FromArrayToRef(irradianceInfo.z, 0, sp.z);
    _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_1__.Vector3.FromArrayToRef(irradianceInfo.xx, 0, sp.xx);
    _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_1__.Vector3.FromArrayToRef(irradianceInfo.yy, 0, sp.yy);
    _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_1__.Vector3.FromArrayToRef(irradianceInfo.zz, 0, sp.zz);
    _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_1__.Vector3.FromArrayToRef(irradianceInfo.yz, 0, sp.yz);
    _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_1__.Vector3.FromArrayToRef(irradianceInfo.zx, 0, sp.zx);
    _Maths_math_vector_js__WEBPACK_IMPORTED_MODULE_1__.Vector3.FromArrayToRef(irradianceInfo.xy, 0, sp.xy);
    texture._sphericalPolynomial = sp;
}
/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/promise-function-async, no-restricted-syntax
function _UpdateRGBDAsync(internalTexture, data, sphericalPolynomial, lodScale, lodOffset) {
    const proxy = internalTexture
        .getEngine()
        .createRawCubeTexture(null, internalTexture.width, internalTexture.format, internalTexture.type, internalTexture.generateMipMaps, internalTexture.invertY, internalTexture.samplingMode, internalTexture._compression);
    // eslint-disable-next-line github/no-then
    const proxyPromise = UploadRadianceLevelsAsync(proxy, data).then(() => internalTexture);
    internalTexture.onRebuildCallback = (_internalTexture) => {
        return {
            proxy: proxyPromise,
            isReady: true,
            isAsync: true,
        };
    };
    internalTexture._source = 13 /* InternalTextureSource.CubeRawRGBD */;
    internalTexture._bufferViewArrayArray = data;
    internalTexture._lodGenerationScale = lodScale;
    internalTexture._lodGenerationOffset = lodOffset;
    internalTexture._sphericalPolynomial = sphericalPolynomial;
    // eslint-disable-next-line github/no-then
    return UploadRadianceLevelsAsync(internalTexture, data).then(() => {
        internalTexture.isReady = true;
        return internalTexture;
    });
}
/**
 * Sets of helpers addressing the serialization and deserialization of environment texture
 * stored in a BabylonJS env file.
 * Those files are usually stored as .env files.
 */
const EnvironmentTextureTools = {
    /**
     * Gets the environment info from an env file.
     * @param data The array buffer containing the .env bytes.
     * @returns the environment file info (the json header) if successfully parsed, normalized to the latest supported version.
     */
    GetEnvInfo,
    /**
     * Creates an environment texture from a loaded cube texture.
     * @param texture defines the cube texture to convert in env file
     * @param options options for the conversion process
     * @param options.imageType the mime type for the encoded images, with support for "image/png" (default) and "image/webp"
     * @param options.imageQuality the image quality of encoded WebP images.
     * @returns a promise containing the environment data if successful.
     */
    CreateEnvTextureAsync,
    /**
     * Creates the ArrayBufferViews used for initializing environment texture image data.
     * @param data the image data
     * @param info parameters that determine what views will be created for accessing the underlying buffer
     * @returns the views described by info providing access to the underlying buffer
     */
    CreateRadianceImageDataArrayBufferViews,
    /**
     * Creates the ArrayBufferViews used for initializing environment texture image data.
     * @param data the image data
     * @param info parameters that determine what views will be created for accessing the underlying buffer
     * @returns the views described by info providing access to the underlying buffer
     */
    CreateIrradianceImageDataArrayBufferViews,
    /**
     * Uploads the texture info contained in the env file to the GPU.
     * @param texture defines the internal texture to upload to
     * @param data defines the data to load
     * @param info defines the texture info retrieved through the GetEnvInfo method
     * @returns a promise
     */
    UploadEnvLevelsAsync,
    /**
     * Uploads the levels of image data to the GPU.
     * @param texture defines the internal texture to upload to
     * @param imageData defines the array buffer views of image data [mipmap][face]
     * @param imageType the mime type of the image data
     * @returns a promise
     */
    UploadRadianceLevelsAsync,
    /**
     * Uploads the levels of image data to the GPU.
     * @param texture defines the internal texture to upload to
     * @param imageData defines the array buffer views of image data [mipmap][face]
     * @param imageType the mime type of the image data
     * @param dominantDirection the dominant direction of light in the environment texture, if available
     * @returns a promise
     */
    UploadIrradianceLevelsAsync,
    /**
     * Uploads spherical polynomials information to the texture.
     * @param texture defines the texture we are trying to upload the information to
     * @param info defines the environment texture info retrieved through the GetEnvInfo method
     */
    UploadEnvSpherical,
};
//# sourceMappingURL=environmentTextureTools.js.map

/***/ }),

/***/ 212:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RGBDTextureTools: () => (/* binding */ RGBDTextureTools)
/* harmony export */ });
/* harmony import */ var _PostProcesses_postProcess_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(201);
/* harmony import */ var _textureTools_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(195);



/**
 * Class used to host RGBD texture specific utilities
 */
class RGBDTextureTools {
    /**
     * Expand the RGBD Texture from RGBD to Half Float if possible.
     * @param texture the texture to expand.
     */
    static ExpandRGBDTexture(texture) {
        const internalTexture = texture._texture;
        if (!internalTexture || !texture.isRGBD) {
            return;
        }
        // Gets everything ready.
        const engine = internalTexture.getEngine();
        const caps = engine.getCaps();
        const isReady = internalTexture.isReady;
        let expandTexture = false;
        // If half float available we can uncompress the texture
        if (caps.textureHalfFloatRender && caps.textureHalfFloatLinearFiltering) {
            expandTexture = true;
            internalTexture.type = 2;
        }
        // If full float available we can uncompress the texture
        else if (caps.textureFloatRender && caps.textureFloatLinearFiltering) {
            expandTexture = true;
            internalTexture.type = 1;
        }
        if (expandTexture) {
            // Do not use during decode.
            internalTexture.isReady = false;
            internalTexture._isRGBD = false;
            internalTexture.invertY = false;
        }
        const expandRgbdTextureAsync = async () => {
            const isWebGpu = engine.isWebGPU;
            const shaderLanguage = isWebGpu ? 1 /* ShaderLanguage.WGSL */ : 0 /* ShaderLanguage.GLSL */;
            internalTexture.isReady = false;
            if (isWebGpu) {
                await __webpack_require__.e(/* import() */ 23).then(__webpack_require__.bind(__webpack_require__, 246));
            }
            else {
                await __webpack_require__.e(/* import() */ 25).then(__webpack_require__.bind(__webpack_require__, 248));
            }
            // Expand the texture if possible
            // Simply run through the decode PP.
            const rgbdPostProcess = new _PostProcesses_postProcess_js__WEBPACK_IMPORTED_MODULE_0__.PostProcess("rgbdDecode", "rgbdDecode", null, null, 1, null, 3, engine, false, undefined, internalTexture.type, undefined, null, false, undefined, shaderLanguage);
            rgbdPostProcess.externalTextureSamplerBinding = true;
            // Hold the output of the decoding.
            const expandedTexture = engine.createRenderTargetTexture(internalTexture.width, {
                generateDepthBuffer: false,
                generateMipMaps: false,
                generateStencilBuffer: false,
                samplingMode: internalTexture.samplingMode,
                type: internalTexture.type,
                format: 5,
            });
            rgbdPostProcess.onEffectCreatedObservable.addOnce((e) => {
                e.executeWhenCompiled(() => {
                    // PP Render Pass
                    rgbdPostProcess.onApply = (effect) => {
                        effect._bindTexture("textureSampler", internalTexture);
                        effect.setFloat2("scale", 1, 1);
                    };
                    texture.getScene().postProcessManager.directRender([rgbdPostProcess], expandedTexture, true);
                    // Cleanup
                    engine.restoreDefaultFramebuffer();
                    engine._releaseTexture(internalTexture);
                    if (rgbdPostProcess) {
                        rgbdPostProcess.dispose();
                    }
                    // Internal Swap
                    expandedTexture._swapAndDie(internalTexture);
                    // Ready to get rolling again.
                    internalTexture.isReady = true;
                });
            });
        };
        if (expandTexture) {
            if (isReady) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                expandRgbdTextureAsync();
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                texture.onLoadObservable.addOnce(expandRgbdTextureAsync);
            }
        }
    }
    /**
     * Encode the texture to RGBD if possible.
     * @param internalTexture the texture to encode
     * @param scene the scene hosting the texture
     * @param outputTextureType type of the texture in which the encoding is performed
     * @returns a promise with the internalTexture having its texture replaced by the result of the processing
     */
    // Should have "Async" in the name but this is a breaking change.
    // eslint-disable-next-line no-restricted-syntax
    static async EncodeTextureToRGBD(internalTexture, scene, outputTextureType = 0) {
        if (!scene.getEngine().isWebGPU) {
            await __webpack_require__.e(/* import() */ 26).then(__webpack_require__.bind(__webpack_require__, 250));
        }
        else {
            await __webpack_require__.e(/* import() */ 24).then(__webpack_require__.bind(__webpack_require__, 251));
        }
        return await (0,_textureTools_js__WEBPACK_IMPORTED_MODULE_1__.ApplyPostProcess)("rgbdEncode", internalTexture, scene, outputTextureType, 1, 5);
    }
}
//# sourceMappingURL=rgbdTextureTools.js.map

/***/ }),

/***/ 214:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Misc_HighDynamicRange_cubemapToSphericalPolynomial_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(194);
/* harmony import */ var _baseTexture_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(103);


_baseTexture_js__WEBPACK_IMPORTED_MODULE_1__.BaseTexture.prototype.forceSphericalPolynomialsRecompute = function () {
    if (this._texture) {
        this._texture._sphericalPolynomial = null;
        this._texture._sphericalPolynomialPromise = null;
        this._texture._sphericalPolynomialComputed = false;
    }
};
Object.defineProperty(_baseTexture_js__WEBPACK_IMPORTED_MODULE_1__.BaseTexture.prototype, "sphericalPolynomial", {
    get: function () {
        if (this._texture) {
            if (this._texture._sphericalPolynomial || this._texture._sphericalPolynomialComputed) {
                return this._texture._sphericalPolynomial;
            }
            if (this._texture.isReady) {
                if (!this._texture._sphericalPolynomialPromise) {
                    this._texture._sphericalPolynomialPromise = _Misc_HighDynamicRange_cubemapToSphericalPolynomial_js__WEBPACK_IMPORTED_MODULE_0__.CubeMapToSphericalPolynomialTools.ConvertCubeMapTextureToSphericalPolynomial(this);
                    if (this._texture._sphericalPolynomialPromise === null) {
                        this._texture._sphericalPolynomialComputed = true;
                    }
                    else {
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises, github/no-then
                        this._texture._sphericalPolynomialPromise.then((sphericalPolynomial) => {
                            this._texture._sphericalPolynomial = sphericalPolynomial;
                            this._texture._sphericalPolynomialComputed = true;
                        });
                    }
                }
                return null;
            }
        }
        return null;
    },
    set: function (value) {
        if (this._texture) {
            this._texture._sphericalPolynomial = value;
        }
    },
    enumerable: true,
    configurable: true,
});
//# sourceMappingURL=baseTexture.polynomial.js.map

/***/ })

}]);