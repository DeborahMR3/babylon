"use strict";
(self["webpackChunkbabylon"] = self["webpackChunkbabylon"] || []).push([[10],{

/***/ 218:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _KTXTextureLoader: () => (/* binding */ _KTXTextureLoader)
/* harmony export */ });
/* harmony import */ var _Misc_khronosTextureContainer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(219);
/* harmony import */ var _Misc_khronosTextureContainer2_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(220);
/* harmony import */ var _Misc_logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(19);




function MapSRGBToLinear(format) {
    switch (format) {
        case 35916:
            return 33776;
        case 35918:
            return 33778;
        case 35919:
            return 33779;
        case 37493:
            return 37492;
        case 37497:
            return 37496;
        case 37495:
            return 37494;
        case 37840:
            return 37808;
        case 36493:
            return 36492;
    }
    return null;
}
/**
 * Implementation of the KTX Texture Loader.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
class _KTXTextureLoader {
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
     */
    loadCubeData(data, texture, createPolynomials, onLoad) {
        if (Array.isArray(data)) {
            return;
        }
        // Need to invert vScale as invertY via UNPACK_FLIP_Y_WEBGL is not supported by compressed texture
        texture._invertVScale = !texture.invertY;
        const engine = texture.getEngine();
        const ktx = new _Misc_khronosTextureContainer_js__WEBPACK_IMPORTED_MODULE_0__.KhronosTextureContainer(data, 6);
        const loadMipmap = ktx.numberOfMipmapLevels > 1 && texture.generateMipMaps;
        engine._unpackFlipY(true);
        ktx.uploadLevels(texture, texture.generateMipMaps);
        texture.width = ktx.pixelWidth;
        texture.height = ktx.pixelHeight;
        engine._setCubeMapTextureParams(texture, loadMipmap, ktx.numberOfMipmapLevels - 1);
        texture.isReady = true;
        texture.onLoadedObservable.notifyObservers(texture);
        texture.onLoadedObservable.clear();
        if (onLoad) {
            onLoad();
        }
    }
    /**
     * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
     * @param data contains the texture data
     * @param texture defines the BabylonJS internal texture
     * @param callback defines the method to call once ready to upload
     * @param options
     */
    loadData(data, texture, callback, options) {
        if (_Misc_khronosTextureContainer_js__WEBPACK_IMPORTED_MODULE_0__.KhronosTextureContainer.IsValid(data)) {
            // Need to invert vScale as invertY via UNPACK_FLIP_Y_WEBGL is not supported by compressed texture
            texture._invertVScale = !texture.invertY;
            const ktx = new _Misc_khronosTextureContainer_js__WEBPACK_IMPORTED_MODULE_0__.KhronosTextureContainer(data, 1);
            const mappedFormat = MapSRGBToLinear(ktx.glInternalFormat);
            if (mappedFormat) {
                texture.format = mappedFormat;
                texture._useSRGBBuffer = texture.getEngine()._getUseSRGBBuffer(true, texture.generateMipMaps);
                texture._gammaSpace = true;
            }
            else {
                texture.format = ktx.glInternalFormat;
            }
            callback(ktx.pixelWidth, ktx.pixelHeight, texture.generateMipMaps, true, () => {
                ktx.uploadLevels(texture, texture.generateMipMaps);
            }, ktx.isInvalid);
        }
        else if (_Misc_khronosTextureContainer2_js__WEBPACK_IMPORTED_MODULE_1__.KhronosTextureContainer2.IsValid(data)) {
            const ktx2 = new _Misc_khronosTextureContainer2_js__WEBPACK_IMPORTED_MODULE_1__.KhronosTextureContainer2(texture.getEngine());
            // eslint-disable-next-line github/no-then
            ktx2._uploadAsync(data, texture, options).then(() => {
                callback(texture.width, texture.height, texture.generateMipMaps, true, () => { }, false);
            }, (error) => {
                _Misc_logger_js__WEBPACK_IMPORTED_MODULE_2__.Logger.Warn(`Failed to load KTX2 texture data: ${error.message}`);
                callback(0, 0, false, false, () => { }, true);
            });
        }
        else {
            _Misc_logger_js__WEBPACK_IMPORTED_MODULE_2__.Logger.Error("texture missing KTX identifier");
            callback(0, 0, false, false, () => { }, true);
        }
    }
}
//# sourceMappingURL=ktxTextureLoader.js.map

/***/ }),

/***/ 219:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KhronosTextureContainer: () => (/* binding */ KhronosTextureContainer)
/* harmony export */ });
/* harmony import */ var _Misc_logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(19);
/* eslint-disable @typescript-eslint/naming-convention */

/**
 * for description see https://www.khronos.org/opengles/sdk/tools/KTX/
 * for file layout see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/
 */
class KhronosTextureContainer {
    /**
     * Creates a new KhronosTextureContainer
     * @param data contents of the KTX container file
     * @param facesExpected should be either 1 or 6, based whether a cube texture or or
     */
    constructor(
    /** contents of the KTX container file */
    data, facesExpected) {
        this.data = data;
        /**
         * If the container has been made invalid (eg. constructor failed to correctly load array buffer)
         */
        this.isInvalid = false;
        if (!KhronosTextureContainer.IsValid(data)) {
            this.isInvalid = true;
            _Misc_logger_js__WEBPACK_IMPORTED_MODULE_0__.Logger.Error("texture missing KTX identifier");
            return;
        }
        // load the reset of the header in native 32 bit uint
        const dataSize = Uint32Array.BYTES_PER_ELEMENT;
        const headerDataView = new DataView(this.data.buffer, this.data.byteOffset + 12, 13 * dataSize);
        const endianness = headerDataView.getUint32(0, true);
        const littleEndian = endianness === 0x04030201;
        this.glType = headerDataView.getUint32(1 * dataSize, littleEndian); // must be 0 for compressed textures
        this.glTypeSize = headerDataView.getUint32(2 * dataSize, littleEndian); // must be 1 for compressed textures
        this.glFormat = headerDataView.getUint32(3 * dataSize, littleEndian); // must be 0 for compressed textures
        this.glInternalFormat = headerDataView.getUint32(4 * dataSize, littleEndian); // the value of arg passed to gl.compressedTexImage2D(,,x,,,,)
        this.glBaseInternalFormat = headerDataView.getUint32(5 * dataSize, littleEndian); // specify GL_RGB, GL_RGBA, GL_ALPHA, etc (un-compressed only)
        this.pixelWidth = headerDataView.getUint32(6 * dataSize, littleEndian); // level 0 value of arg passed to gl.compressedTexImage2D(,,,x,,,)
        this.pixelHeight = headerDataView.getUint32(7 * dataSize, littleEndian); // level 0 value of arg passed to gl.compressedTexImage2D(,,,,x,,)
        this.pixelDepth = headerDataView.getUint32(8 * dataSize, littleEndian); // level 0 value of arg passed to gl.compressedTexImage3D(,,,,,x,,)
        this.numberOfArrayElements = headerDataView.getUint32(9 * dataSize, littleEndian); // used for texture arrays
        this.numberOfFaces = headerDataView.getUint32(10 * dataSize, littleEndian); // used for cubemap textures, should either be 1 or 6
        this.numberOfMipmapLevels = headerDataView.getUint32(11 * dataSize, littleEndian); // number of levels; disregard possibility of 0 for compressed textures
        this.bytesOfKeyValueData = headerDataView.getUint32(12 * dataSize, littleEndian); // the amount of space after the header for meta-data
        // Make sure we have a compressed type.  Not only reduces work, but probably better to let dev know they are not compressing.
        if (this.glType !== 0) {
            _Misc_logger_js__WEBPACK_IMPORTED_MODULE_0__.Logger.Error("only compressed formats currently supported");
            this.isInvalid = true;
            return;
        }
        else {
            // value of zero is an indication to generate mipmaps @ runtime.  Not usually allowed for compressed, so disregard.
            this.numberOfMipmapLevels = Math.max(1, this.numberOfMipmapLevels);
        }
        if (this.pixelHeight === 0 || this.pixelDepth !== 0) {
            _Misc_logger_js__WEBPACK_IMPORTED_MODULE_0__.Logger.Error("only 2D textures currently supported");
            this.isInvalid = true;
            return;
        }
        if (this.numberOfArrayElements !== 0) {
            _Misc_logger_js__WEBPACK_IMPORTED_MODULE_0__.Logger.Error("texture arrays not currently supported");
            this.isInvalid = true;
            return;
        }
        if (this.numberOfFaces !== facesExpected) {
            _Misc_logger_js__WEBPACK_IMPORTED_MODULE_0__.Logger.Error("number of faces expected" + facesExpected + ", but found " + this.numberOfFaces);
            this.isInvalid = true;
            return;
        }
        // we now have a completely validated file, so could use existence of loadType as success
        // would need to make this more elaborate & adjust checks above to support more than one load type
        this.loadType = KhronosTextureContainer.COMPRESSED_2D;
    }
    /**
     * Uploads KTX content to a Babylon Texture.
     * It is assumed that the texture has already been created & is currently bound
     * @internal
     */
    uploadLevels(texture, loadMipmaps) {
        switch (this.loadType) {
            case KhronosTextureContainer.COMPRESSED_2D:
                this._upload2DCompressedLevels(texture, loadMipmaps);
                break;
            case KhronosTextureContainer.TEX_2D:
            case KhronosTextureContainer.COMPRESSED_3D:
            case KhronosTextureContainer.TEX_3D:
        }
    }
    _upload2DCompressedLevels(texture, loadMipmaps) {
        // initialize width & height for level 1
        let dataOffset = KhronosTextureContainer.HEADER_LEN + this.bytesOfKeyValueData;
        let width = this.pixelWidth;
        let height = this.pixelHeight;
        const mipmapCount = loadMipmaps ? this.numberOfMipmapLevels : 1;
        for (let level = 0; level < mipmapCount; level++) {
            const imageSize = new Int32Array(this.data.buffer, this.data.byteOffset + dataOffset, 1)[0]; // size per face, since not supporting array cubemaps
            dataOffset += 4; //image data starts from next multiple of 4 offset. Each face refers to same imagesize field above.
            for (let face = 0; face < this.numberOfFaces; face++) {
                const byteArray = new Uint8Array(this.data.buffer, this.data.byteOffset + dataOffset, imageSize);
                const engine = texture.getEngine();
                engine._uploadCompressedDataToTextureDirectly(texture, texture.format, width, height, byteArray, face, level);
                dataOffset += imageSize; // add size of the image for the next face/mipmap
                dataOffset += 3 - ((imageSize + 3) % 4); // add padding for odd sized image
            }
            width = Math.max(1.0, width * 0.5);
            height = Math.max(1.0, height * 0.5);
        }
    }
    /**
     * Checks if the given data starts with a KTX file identifier.
     * @param data the data to check
     * @returns true if the data is a KTX file or false otherwise
     */
    static IsValid(data) {
        if (data.byteLength >= 12) {
            // '«', 'K', 'T', 'X', ' ', '1', '1', '»', '\r', '\n', '\x1A', '\n'
            const identifier = new Uint8Array(data.buffer, data.byteOffset, 12);
            if (identifier[0] === 0xab &&
                identifier[1] === 0x4b &&
                identifier[2] === 0x54 &&
                identifier[3] === 0x58 &&
                identifier[4] === 0x20 &&
                identifier[5] === 0x31 &&
                identifier[6] === 0x31 &&
                identifier[7] === 0xbb &&
                identifier[8] === 0x0d &&
                identifier[9] === 0x0a &&
                identifier[10] === 0x1a &&
                identifier[11] === 0x0a) {
                return true;
            }
        }
        return false;
    }
}
KhronosTextureContainer.HEADER_LEN = 12 + 13 * 4; // identifier + header elements (not including key value meta-data pairs)
// load types
KhronosTextureContainer.COMPRESSED_2D = 0; // uses a gl.compressedTexImage2D()
KhronosTextureContainer.COMPRESSED_3D = 1; // uses a gl.compressedTexImage3D()
KhronosTextureContainer.TEX_2D = 2; // uses a gl.texImage2D()
KhronosTextureContainer.TEX_3D = 3; // uses a gl.texImage3D()
//# sourceMappingURL=khronosTextureContainer.js.map

/***/ }),

/***/ 220:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DefaultKTX2DecoderOptions: () => (/* binding */ DefaultKTX2DecoderOptions),
/* harmony export */   KhronosTextureContainer2: () => (/* binding */ KhronosTextureContainer2)
/* harmony export */ });
/* harmony import */ var _workerPool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(221);
/* harmony import */ var _tools_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(17);
/* harmony import */ var _Materials_Textures_ktx2decoderTypes_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(222);
/* harmony import */ var _khronosTextureContainer2Worker_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(223);





/**
 * Class that defines the default KTX2 decoder options.
 *
 * This class is useful for providing options to the KTX2 decoder to control how the source data is transcoded.
 */
class DefaultKTX2DecoderOptions {
    constructor() {
        this._isDirty = true;
        this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC = true;
        this._ktx2DecoderOptions = {};
    }
    /**
     * Gets the dirty flag
     */
    get isDirty() {
        return this._isDirty;
    }
    /**
     * force a (uncompressed) RGBA transcoded format if transcoding a UASTC source format and ASTC + BC7 are not available as a compressed transcoded format
     */
    get useRGBAIfASTCBC7NotAvailableWhenUASTC() {
        return this._useRGBAIfASTCBC7NotAvailableWhenUASTC;
    }
    set useRGBAIfASTCBC7NotAvailableWhenUASTC(value) {
        if (this._useRGBAIfASTCBC7NotAvailableWhenUASTC === value) {
            return;
        }
        this._useRGBAIfASTCBC7NotAvailableWhenUASTC = value;
        this._isDirty = true;
    }
    /**
     * force a (uncompressed) RGBA transcoded format if transcoding a UASTC source format and only BC1 or BC3 are available as a compressed transcoded format.
     * This property is true by default to favor speed over memory, because currently transcoding from UASTC to BC1/3 is slow because the transcoder transcodes
     * to uncompressed and then recompresses the texture
     */
    get useRGBAIfOnlyBC1BC3AvailableWhenUASTC() {
        return this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC;
    }
    set useRGBAIfOnlyBC1BC3AvailableWhenUASTC(value) {
        if (this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC === value) {
            return;
        }
        this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC = value;
        this._isDirty = true;
    }
    /**
     * force to always use (uncompressed) RGBA for transcoded format
     */
    get forceRGBA() {
        return this._forceRGBA;
    }
    set forceRGBA(value) {
        if (this._forceRGBA === value) {
            return;
        }
        this._forceRGBA = value;
        this._isDirty = true;
    }
    /**
     * force to always use (uncompressed) R8 for transcoded format
     */
    get forceR8() {
        return this._forceR8;
    }
    set forceR8(value) {
        if (this._forceR8 === value) {
            return;
        }
        this._forceR8 = value;
        this._isDirty = true;
    }
    /**
     * force to always use (uncompressed) RG8 for transcoded format
     */
    get forceRG8() {
        return this._forceRG8;
    }
    set forceRG8(value) {
        if (this._forceRG8 === value) {
            return;
        }
        this._forceRG8 = value;
        this._isDirty = true;
    }
    /**
     * list of transcoders to bypass when looking for a suitable transcoder. The available transcoders are:
     *      UniversalTranscoder_UASTC_ASTC
     *      UniversalTranscoder_UASTC_BC7
     *      UniversalTranscoder_UASTC_RGBA_UNORM
     *      UniversalTranscoder_UASTC_RGBA_SRGB
     *      UniversalTranscoder_UASTC_R8_UNORM
     *      UniversalTranscoder_UASTC_RG8_UNORM
     *      MSCTranscoder
     */
    get bypassTranscoders() {
        return this._bypassTranscoders;
    }
    set bypassTranscoders(value) {
        if (this._bypassTranscoders === value) {
            return;
        }
        this._bypassTranscoders = value;
        this._isDirty = true;
    }
    /** @internal */
    _getKTX2DecoderOptions() {
        if (!this._isDirty) {
            return this._ktx2DecoderOptions;
        }
        this._isDirty = false;
        const options = {
            useRGBAIfASTCBC7NotAvailableWhenUASTC: this._useRGBAIfASTCBC7NotAvailableWhenUASTC,
            forceRGBA: this._forceRGBA,
            forceR8: this._forceR8,
            forceRG8: this._forceRG8,
            bypassTranscoders: this._bypassTranscoders,
        };
        if (this.useRGBAIfOnlyBC1BC3AvailableWhenUASTC) {
            options.transcodeFormatDecisionTree = {
                UASTC: {
                    transcodeFormat: [_Materials_Textures_ktx2decoderTypes_js__WEBPACK_IMPORTED_MODULE_2__.TranscodeTarget.BC1_RGB, _Materials_Textures_ktx2decoderTypes_js__WEBPACK_IMPORTED_MODULE_2__.TranscodeTarget.BC3_RGBA],
                    yes: {
                        transcodeFormat: _Materials_Textures_ktx2decoderTypes_js__WEBPACK_IMPORTED_MODULE_2__.TranscodeTarget.RGBA32,
                        engineFormat: 32856 /* EngineFormat.RGBA8Format */,
                        roundToMultiple4: false,
                    },
                },
            };
        }
        this._ktx2DecoderOptions = options;
        return options;
    }
}
/**
 * Class for loading KTX2 files
 */
class KhronosTextureContainer2 {
    static GetDefaultNumWorkers() {
        if (typeof navigator !== "object" || !navigator.hardwareConcurrency) {
            return 1;
        }
        // Use 50% of the available logical processors but capped at 4.
        return Math.min(Math.floor(navigator.hardwareConcurrency * 0.5), 4);
    }
    static _Initialize(numWorkers) {
        if (KhronosTextureContainer2._WorkerPoolPromise || KhronosTextureContainer2._DecoderModulePromise) {
            return;
        }
        const urls = {
            jsDecoderModule: _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.GetBabylonScriptURL(this.URLConfig.jsDecoderModule, true),
            wasmUASTCToASTC: _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToASTC, true),
            wasmUASTCToBC7: _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToBC7, true),
            wasmUASTCToRGBA_UNORM: _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToRGBA_UNORM, true),
            wasmUASTCToRGBA_SRGB: _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToRGBA_SRGB, true),
            wasmUASTCToR8_UNORM: _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToR8_UNORM, true),
            wasmUASTCToRG8_UNORM: _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToRG8_UNORM, true),
            jsMSCTranscoder: _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.GetBabylonScriptURL(this.URLConfig.jsMSCTranscoder, true),
            wasmMSCTranscoder: _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.GetBabylonScriptURL(this.URLConfig.wasmMSCTranscoder, true),
            wasmZSTDDecoder: _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.GetBabylonScriptURL(this.URLConfig.wasmZSTDDecoder, true),
        };
        if (numWorkers && typeof Worker === "function" && typeof URL !== "undefined") {
            KhronosTextureContainer2._WorkerPoolPromise = new Promise((resolve) => {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                const workerContent = `${_khronosTextureContainer2Worker_js__WEBPACK_IMPORTED_MODULE_3__.applyConfig}(${_khronosTextureContainer2Worker_js__WEBPACK_IMPORTED_MODULE_3__.workerFunction})()`;
                const workerBlobUrl = URL.createObjectURL(new Blob([workerContent], { type: "application/javascript" }));
                resolve(new _workerPool_js__WEBPACK_IMPORTED_MODULE_0__.AutoReleaseWorkerPool(numWorkers, async () => await (0,_khronosTextureContainer2Worker_js__WEBPACK_IMPORTED_MODULE_3__.initializeWebWorker)(new Worker(workerBlobUrl), undefined, urls)));
            });
        }
        else {
            if (typeof KhronosTextureContainer2._KTX2DecoderModule === "undefined") {
                // eslint-disable-next-line github/no-then
                KhronosTextureContainer2._DecoderModulePromise = _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.LoadBabylonScriptAsync(urls.jsDecoderModule).then(() => {
                    KhronosTextureContainer2._KTX2DecoderModule = KTX2DECODER;
                    KhronosTextureContainer2._KTX2DecoderModule.MSCTranscoder.UseFromWorkerThread = false;
                    KhronosTextureContainer2._KTX2DecoderModule.WASMMemoryManager.LoadBinariesFromCurrentThread = true;
                    (0,_khronosTextureContainer2Worker_js__WEBPACK_IMPORTED_MODULE_3__.applyConfig)(urls, KhronosTextureContainer2._KTX2DecoderModule);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return new KhronosTextureContainer2._KTX2DecoderModule.KTX2Decoder();
                });
            }
            else {
                KhronosTextureContainer2._KTX2DecoderModule.MSCTranscoder.UseFromWorkerThread = false;
                KhronosTextureContainer2._KTX2DecoderModule.WASMMemoryManager.LoadBinariesFromCurrentThread = true;
                KhronosTextureContainer2._DecoderModulePromise = Promise.resolve(new KhronosTextureContainer2._KTX2DecoderModule.KTX2Decoder());
            }
        }
    }
    /**
     * Constructor
     * @param engine The engine to use
     * @param numWorkersOrOptions The number of workers for async operations. Specify `0` to disable web workers and run synchronously in the current context.
     */
    constructor(engine, numWorkersOrOptions = KhronosTextureContainer2.DefaultNumWorkers) {
        this._engine = engine;
        const workerPoolOption = (typeof numWorkersOrOptions === "object" && numWorkersOrOptions.workerPool) || KhronosTextureContainer2.WorkerPool;
        if (workerPoolOption) {
            KhronosTextureContainer2._WorkerPoolPromise = Promise.resolve(workerPoolOption);
        }
        else {
            // set the KTX2 decoder module
            if (typeof numWorkersOrOptions === "object") {
                KhronosTextureContainer2._KTX2DecoderModule = numWorkersOrOptions?.binariesAndModulesContainer?.jsDecoderModule;
            }
            else if (typeof KTX2DECODER !== "undefined") {
                KhronosTextureContainer2._KTX2DecoderModule = KTX2DECODER;
            }
            const numberOfWorkers = typeof numWorkersOrOptions === "number" ? numWorkersOrOptions : (numWorkersOrOptions.numWorkers ?? KhronosTextureContainer2.DefaultNumWorkers);
            KhronosTextureContainer2._Initialize(numberOfWorkers);
        }
    }
    /**
     * @internal
     */
    async _uploadAsync(data, internalTexture, options) {
        const caps = this._engine.getCaps();
        const compressedTexturesCaps = {
            astc: !!caps.astc,
            bptc: !!caps.bptc,
            s3tc: !!caps.s3tc,
            pvrtc: !!caps.pvrtc,
            etc2: !!caps.etc2,
            etc1: !!caps.etc1,
        };
        if (KhronosTextureContainer2._WorkerPoolPromise) {
            const workerPool = await KhronosTextureContainer2._WorkerPoolPromise;
            return await new Promise((resolve, reject) => {
                workerPool.push((worker, onComplete) => {
                    const onError = (error) => {
                        worker.removeEventListener("error", onError);
                        worker.removeEventListener("message", onMessage);
                        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                        reject(error);
                        onComplete();
                    };
                    const onMessage = (message) => {
                        if (message.data.action === "decoded") {
                            worker.removeEventListener("error", onError);
                            worker.removeEventListener("message", onMessage);
                            if (!message.data.success) {
                                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                                reject({ message: message.data.msg });
                            }
                            else {
                                try {
                                    this._createTexture(message.data.decodedData, internalTexture, options);
                                    resolve();
                                }
                                catch (err) {
                                    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                                    reject({ message: err });
                                }
                            }
                            onComplete();
                        }
                    };
                    worker.addEventListener("error", onError);
                    worker.addEventListener("message", onMessage);
                    worker.postMessage({ action: "setDefaultDecoderOptions", options: KhronosTextureContainer2.DefaultDecoderOptions._getKTX2DecoderOptions() });
                    const dataCopy = new Uint8Array(data.byteLength);
                    dataCopy.set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
                    worker.postMessage({ action: "decode", data: dataCopy, caps: compressedTexturesCaps, options }, [dataCopy.buffer]);
                });
            });
        }
        else if (KhronosTextureContainer2._DecoderModulePromise) {
            const decoder = await KhronosTextureContainer2._DecoderModulePromise;
            if (KhronosTextureContainer2.DefaultDecoderOptions.isDirty) {
                KhronosTextureContainer2._KTX2DecoderModule.KTX2Decoder.DefaultDecoderOptions = KhronosTextureContainer2.DefaultDecoderOptions._getKTX2DecoderOptions();
            }
            return await new Promise((resolve, reject) => {
                decoder
                    .decode(data, caps)
                    // eslint-disable-next-line github/no-then
                    .then((data) => {
                    this._createTexture(data, internalTexture);
                    resolve();
                })
                    // eslint-disable-next-line github/no-then
                    .catch((reason) => {
                    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                    reject({ message: reason });
                });
            });
        }
        throw new Error("KTX2 decoder module is not available");
    }
    _createTexture(data, internalTexture, options) {
        const oglTexture2D = 3553; // gl.TEXTURE_2D
        this._engine._bindTextureDirectly(oglTexture2D, internalTexture);
        if (options) {
            // return back some information about the decoded data
            options.transcodedFormat = data.transcodedFormat;
            options.isInGammaSpace = data.isInGammaSpace;
            options.hasAlpha = data.hasAlpha;
            options.transcoderName = data.transcoderName;
        }
        let isUncompressedFormat = true;
        switch (data.transcodedFormat) {
            case 0x8058 /* RGBA8 */:
                internalTexture.type = 0;
                internalTexture.format = 5;
                break;
            case 0x8229 /* R8 */:
                internalTexture.type = 0;
                internalTexture.format = 6;
                break;
            case 0x822b /* RG8 */:
                internalTexture.type = 0;
                internalTexture.format = 7;
                break;
            default:
                internalTexture.format = data.transcodedFormat;
                isUncompressedFormat = false;
                break;
        }
        internalTexture._gammaSpace = data.isInGammaSpace;
        internalTexture.generateMipMaps = data.mipmaps.length > 1;
        if (data.errors) {
            throw new Error("KTX2 container - could not transcode the data. " + data.errors);
        }
        for (let t = 0; t < data.mipmaps.length; ++t) {
            const mipmap = data.mipmaps[t];
            if (!mipmap || !mipmap.data) {
                throw new Error("KTX2 container - could not transcode one of the image");
            }
            if (isUncompressedFormat) {
                // uncompressed RGBA / R8 / RG8
                internalTexture.width = mipmap.width; // need to set width/height so that the call to _uploadDataToTextureDirectly uses the right dimensions
                internalTexture.height = mipmap.height;
                this._engine._uploadDataToTextureDirectly(internalTexture, mipmap.data, 0, t, undefined, true);
            }
            else {
                this._engine._uploadCompressedDataToTextureDirectly(internalTexture, data.transcodedFormat, mipmap.width, mipmap.height, mipmap.data, 0, t);
            }
        }
        internalTexture._extension = ".ktx2";
        internalTexture.width = data.mipmaps[0].width;
        internalTexture.height = data.mipmaps[0].height;
        internalTexture.isReady = true;
        this._engine._bindTextureDirectly(oglTexture2D, null);
    }
    /**
     * Checks if the given data starts with a KTX2 file identifier.
     * @param data the data to check
     * @returns true if the data is a KTX2 file or false otherwise
     */
    static IsValid(data) {
        if (data.byteLength >= 12) {
            // '«', 'K', 'T', 'X', ' ', '2', '0', '»', '\r', '\n', '\x1A', '\n'
            const identifier = new Uint8Array(data.buffer, data.byteOffset, 12);
            if (identifier[0] === 0xab &&
                identifier[1] === 0x4b &&
                identifier[2] === 0x54 &&
                identifier[3] === 0x58 &&
                identifier[4] === 0x20 &&
                identifier[5] === 0x32 &&
                identifier[6] === 0x30 &&
                identifier[7] === 0xbb &&
                identifier[8] === 0x0d &&
                identifier[9] === 0x0a &&
                identifier[10] === 0x1a &&
                identifier[11] === 0x0a) {
                return true;
            }
        }
        return false;
    }
}
/**
 * URLs to use when loading the KTX2 decoder module as well as its dependencies
 * If a url is null, the default url is used (pointing to https://preview.babylonjs.com)
 * Note that jsDecoderModule can't be null and that the other dependencies will only be loaded if necessary
 * Urls you can change:
 *     URLConfig.jsDecoderModule
 *     URLConfig.wasmUASTCToASTC
 *     URLConfig.wasmUASTCToBC7
 *     URLConfig.wasmUASTCToRGBA_UNORM
 *     URLConfig.wasmUASTCToRGBA_SRGB
 *     URLConfig.wasmUASTCToR8_UNORM
 *     URLConfig.wasmUASTCToRG8_UNORM
 *     URLConfig.jsMSCTranscoder
 *     URLConfig.wasmMSCTranscoder
 *     URLConfig.wasmZSTDDecoder
 * You can see their default values in this PG: https://playground.babylonjs.com/#EIJH8L#29
 */
KhronosTextureContainer2.URLConfig = {
    jsDecoderModule: "https://cdn.babylonjs.com/babylon.ktx2Decoder.js",
    wasmUASTCToASTC: null,
    wasmUASTCToBC7: null,
    wasmUASTCToRGBA_UNORM: null,
    wasmUASTCToRGBA_SRGB: null,
    wasmUASTCToR8_UNORM: null,
    wasmUASTCToRG8_UNORM: null,
    jsMSCTranscoder: null,
    wasmMSCTranscoder: null,
    wasmZSTDDecoder: null,
};
/**
 * Default number of workers used to handle data decoding
 */
KhronosTextureContainer2.DefaultNumWorkers = KhronosTextureContainer2.GetDefaultNumWorkers();
/**
 * Default configuration for the KTX2 decoder.
 * The options defined in this way have priority over those passed when creating a KTX2 texture with new Texture(...).
 */
KhronosTextureContainer2.DefaultDecoderOptions = new DefaultKTX2DecoderOptions();
//# sourceMappingURL=khronosTextureContainer2.js.map

/***/ }),

/***/ 221:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AutoReleaseWorkerPool: () => (/* binding */ AutoReleaseWorkerPool),
/* harmony export */   WorkerPool: () => (/* binding */ WorkerPool)
/* harmony export */ });
/**
 * Helper class to push actions to a pool of workers.
 */
class WorkerPool {
    /**
     * Constructor
     * @param workers Array of workers to use for actions
     */
    constructor(workers) {
        this._pendingActions = new Array();
        this._workerInfos = workers.map((worker) => ({
            workerPromise: Promise.resolve(worker),
            idle: true,
        }));
    }
    /**
     * Terminates all workers and clears any pending actions.
     */
    dispose() {
        for (const workerInfo of this._workerInfos) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises, github/no-then
            workerInfo.workerPromise.then((worker) => {
                worker.terminate();
            });
        }
        this._workerInfos.length = 0;
        this._pendingActions.length = 0;
    }
    /**
     * Pushes an action to the worker pool. If all the workers are active, the action will be
     * pended until a worker has completed its action.
     * @param action The action to perform. Call onComplete when the action is complete.
     */
    push(action) {
        if (!this._executeOnIdleWorker(action)) {
            this._pendingActions.push(action);
        }
    }
    _executeOnIdleWorker(action) {
        for (const workerInfo of this._workerInfos) {
            if (workerInfo.idle) {
                this._execute(workerInfo, action);
                return true;
            }
        }
        return false;
    }
    _execute(workerInfo, action) {
        workerInfo.idle = false;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises, github/no-then
        workerInfo.workerPromise.then((worker) => {
            action(worker, () => {
                const nextAction = this._pendingActions.shift();
                if (nextAction) {
                    this._execute(workerInfo, nextAction);
                }
                else {
                    workerInfo.idle = true;
                }
            });
        });
    }
}
/**
 * Similar to the WorkerPool class except it creates and destroys workers automatically with a maximum of `maxWorkers` workers.
 * Workers are terminated when it is idle for at least `idleTimeElapsedBeforeRelease` milliseconds.
 */
class AutoReleaseWorkerPool extends WorkerPool {
    constructor(maxWorkers, createWorkerAsync, options = AutoReleaseWorkerPool.DefaultOptions) {
        super([]);
        this._maxWorkers = maxWorkers;
        this._createWorkerAsync = createWorkerAsync;
        this._options = options;
    }
    push(action) {
        if (!this._executeOnIdleWorker(action)) {
            if (this._workerInfos.length < this._maxWorkers) {
                const workerInfo = {
                    workerPromise: this._createWorkerAsync(),
                    idle: false,
                };
                this._workerInfos.push(workerInfo);
                this._execute(workerInfo, action);
            }
            else {
                this._pendingActions.push(action);
            }
        }
    }
    _execute(workerInfo, action) {
        // Reset the idle timeout.
        if (workerInfo.timeoutId) {
            clearTimeout(workerInfo.timeoutId);
            delete workerInfo.timeoutId;
        }
        super._execute(workerInfo, (worker, onComplete) => {
            action(worker, () => {
                onComplete();
                if (workerInfo.idle) {
                    // Schedule the worker to be terminated after the elapsed time.
                    workerInfo.timeoutId = setTimeout(() => {
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises, github/no-then
                        workerInfo.workerPromise.then((worker) => {
                            worker.terminate();
                        });
                        const indexOf = this._workerInfos.indexOf(workerInfo);
                        if (indexOf !== -1) {
                            this._workerInfos.splice(indexOf, 1);
                        }
                    }, this._options.idleTimeElapsedBeforeRelease);
                }
            });
        });
    }
}
/**
 * Default options for the constructor.
 * Override to change the defaults.
 */
AutoReleaseWorkerPool.DefaultOptions = {
    idleTimeElapsedBeforeRelease: 1000,
};
//# sourceMappingURL=workerPool.js.map

/***/ }),

/***/ 222:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EngineFormat: () => (/* binding */ EngineFormat),
/* harmony export */   SourceTextureFormat: () => (/* binding */ SourceTextureFormat),
/* harmony export */   TranscodeTarget: () => (/* binding */ TranscodeTarget)
/* harmony export */ });
var SourceTextureFormat;
(function (SourceTextureFormat) {
    SourceTextureFormat[SourceTextureFormat["ETC1S"] = 0] = "ETC1S";
    // eslint-disable-next-line @typescript-eslint/naming-convention
    SourceTextureFormat[SourceTextureFormat["UASTC4x4"] = 1] = "UASTC4x4";
})(SourceTextureFormat || (SourceTextureFormat = {}));
var TranscodeTarget;
(function (TranscodeTarget) {
    TranscodeTarget[TranscodeTarget["ASTC_4X4_RGBA"] = 0] = "ASTC_4X4_RGBA";
    TranscodeTarget[TranscodeTarget["BC7_RGBA"] = 1] = "BC7_RGBA";
    TranscodeTarget[TranscodeTarget["BC3_RGBA"] = 2] = "BC3_RGBA";
    TranscodeTarget[TranscodeTarget["BC1_RGB"] = 3] = "BC1_RGB";
    TranscodeTarget[TranscodeTarget["PVRTC1_4_RGBA"] = 4] = "PVRTC1_4_RGBA";
    TranscodeTarget[TranscodeTarget["PVRTC1_4_RGB"] = 5] = "PVRTC1_4_RGB";
    TranscodeTarget[TranscodeTarget["ETC2_RGBA"] = 6] = "ETC2_RGBA";
    TranscodeTarget[TranscodeTarget["ETC1_RGB"] = 7] = "ETC1_RGB";
    TranscodeTarget[TranscodeTarget["RGBA32"] = 8] = "RGBA32";
    TranscodeTarget[TranscodeTarget["R8"] = 9] = "R8";
    TranscodeTarget[TranscodeTarget["RG8"] = 10] = "RG8";
})(TranscodeTarget || (TranscodeTarget = {}));
var EngineFormat;
(function (EngineFormat) {
    EngineFormat[EngineFormat["COMPRESSED_RGBA_BPTC_UNORM_EXT"] = 36492] = "COMPRESSED_RGBA_BPTC_UNORM_EXT";
    EngineFormat[EngineFormat["COMPRESSED_RGBA_ASTC_4X4_KHR"] = 37808] = "COMPRESSED_RGBA_ASTC_4X4_KHR";
    EngineFormat[EngineFormat["COMPRESSED_RGB_S3TC_DXT1_EXT"] = 33776] = "COMPRESSED_RGB_S3TC_DXT1_EXT";
    EngineFormat[EngineFormat["COMPRESSED_RGBA_S3TC_DXT5_EXT"] = 33779] = "COMPRESSED_RGBA_S3TC_DXT5_EXT";
    EngineFormat[EngineFormat["COMPRESSED_RGBA_PVRTC_4BPPV1_IMG"] = 35842] = "COMPRESSED_RGBA_PVRTC_4BPPV1_IMG";
    EngineFormat[EngineFormat["COMPRESSED_RGB_PVRTC_4BPPV1_IMG"] = 35840] = "COMPRESSED_RGB_PVRTC_4BPPV1_IMG";
    EngineFormat[EngineFormat["COMPRESSED_RGBA8_ETC2_EAC"] = 37496] = "COMPRESSED_RGBA8_ETC2_EAC";
    EngineFormat[EngineFormat["COMPRESSED_RGB8_ETC2"] = 37492] = "COMPRESSED_RGB8_ETC2";
    EngineFormat[EngineFormat["COMPRESSED_RGB_ETC1_WEBGL"] = 36196] = "COMPRESSED_RGB_ETC1_WEBGL";
    EngineFormat[EngineFormat["RGBA8Format"] = 32856] = "RGBA8Format";
    EngineFormat[EngineFormat["R8Format"] = 33321] = "R8Format";
    // eslint-disable-next-line @typescript-eslint/naming-convention
    EngineFormat[EngineFormat["RG8Format"] = 33323] = "RG8Format";
})(EngineFormat || (EngineFormat = {}));
//# sourceMappingURL=ktx2decoderTypes.js.map

/***/ }),

/***/ 223:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyConfig: () => (/* binding */ applyConfig),
/* harmony export */   initializeWebWorker: () => (/* binding */ initializeWebWorker),
/* harmony export */   workerFunction: () => (/* binding */ workerFunction)
/* harmony export */ });
function applyConfig(urls, binariesAndModulesContainer) {
    const KTX2DecoderModule = binariesAndModulesContainer?.jsDecoderModule || KTX2DECODER;
    if (urls) {
        if (urls.wasmUASTCToASTC) {
            KTX2DecoderModule.LiteTranscoder_UASTC_ASTC.WasmModuleURL = urls.wasmUASTCToASTC;
        }
        if (urls.wasmUASTCToBC7) {
            KTX2DecoderModule.LiteTranscoder_UASTC_BC7.WasmModuleURL = urls.wasmUASTCToBC7;
        }
        if (urls.wasmUASTCToRGBA_UNORM) {
            KTX2DecoderModule.LiteTranscoder_UASTC_RGBA_UNORM.WasmModuleURL = urls.wasmUASTCToRGBA_UNORM;
        }
        if (urls.wasmUASTCToRGBA_SRGB) {
            KTX2DecoderModule.LiteTranscoder_UASTC_RGBA_SRGB.WasmModuleURL = urls.wasmUASTCToRGBA_SRGB;
        }
        if (urls.wasmUASTCToR8_UNORM) {
            KTX2DecoderModule.LiteTranscoder_UASTC_R8_UNORM.WasmModuleURL = urls.wasmUASTCToR8_UNORM;
        }
        if (urls.wasmUASTCToRG8_UNORM) {
            KTX2DecoderModule.LiteTranscoder_UASTC_RG8_UNORM.WasmModuleURL = urls.wasmUASTCToRG8_UNORM;
        }
        if (urls.jsMSCTranscoder) {
            KTX2DecoderModule.MSCTranscoder.JSModuleURL = urls.jsMSCTranscoder;
        }
        if (urls.wasmMSCTranscoder) {
            KTX2DecoderModule.MSCTranscoder.WasmModuleURL = urls.wasmMSCTranscoder;
        }
        if (urls.wasmZSTDDecoder) {
            KTX2DecoderModule.ZSTDDecoder.WasmModuleURL = urls.wasmZSTDDecoder;
        }
    }
    if (binariesAndModulesContainer) {
        if (binariesAndModulesContainer.wasmUASTCToASTC) {
            KTX2DecoderModule.LiteTranscoder_UASTC_ASTC.WasmBinary = binariesAndModulesContainer.wasmUASTCToASTC;
        }
        if (binariesAndModulesContainer.wasmUASTCToBC7) {
            KTX2DecoderModule.LiteTranscoder_UASTC_BC7.WasmBinary = binariesAndModulesContainer.wasmUASTCToBC7;
        }
        if (binariesAndModulesContainer.wasmUASTCToRGBA_UNORM) {
            KTX2DecoderModule.LiteTranscoder_UASTC_RGBA_UNORM.WasmBinary = binariesAndModulesContainer.wasmUASTCToRGBA_UNORM;
        }
        if (binariesAndModulesContainer.wasmUASTCToRGBA_SRGB) {
            KTX2DecoderModule.LiteTranscoder_UASTC_RGBA_SRGB.WasmBinary = binariesAndModulesContainer.wasmUASTCToRGBA_SRGB;
        }
        if (binariesAndModulesContainer.wasmUASTCToR8_UNORM) {
            KTX2DecoderModule.LiteTranscoder_UASTC_R8_UNORM.WasmBinary = binariesAndModulesContainer.wasmUASTCToR8_UNORM;
        }
        if (binariesAndModulesContainer.wasmUASTCToRG8_UNORM) {
            KTX2DecoderModule.LiteTranscoder_UASTC_RG8_UNORM.WasmBinary = binariesAndModulesContainer.wasmUASTCToRG8_UNORM;
        }
        if (binariesAndModulesContainer.jsMSCTranscoder) {
            KTX2DecoderModule.MSCTranscoder.JSModule = binariesAndModulesContainer.jsMSCTranscoder;
        }
        if (binariesAndModulesContainer.wasmMSCTranscoder) {
            KTX2DecoderModule.MSCTranscoder.WasmBinary = binariesAndModulesContainer.wasmMSCTranscoder;
        }
        if (binariesAndModulesContainer.wasmZSTDDecoder) {
            KTX2DecoderModule.ZSTDDecoder.WasmBinary = binariesAndModulesContainer.wasmZSTDDecoder;
        }
    }
}
function workerFunction(KTX2DecoderModule) {
    if (typeof KTX2DecoderModule === "undefined" && typeof KTX2DECODER !== "undefined") {
        KTX2DecoderModule = KTX2DECODER;
    }
    let ktx2Decoder;
    onmessage = (event) => {
        if (!event.data) {
            return;
        }
        switch (event.data.action) {
            case "init": {
                const urls = event.data.urls;
                if (urls) {
                    if (urls.jsDecoderModule && typeof KTX2DecoderModule === "undefined") {
                        importScripts(urls.jsDecoderModule);
                        // assuming global namespace populated by the script (UMD pattern)
                        KTX2DecoderModule = KTX2DECODER;
                    }
                    applyConfig(urls);
                }
                if (event.data.wasmBinaries) {
                    applyConfig(undefined, { ...event.data.wasmBinaries, jsDecoderModule: KTX2DecoderModule });
                }
                ktx2Decoder = new KTX2DecoderModule.KTX2Decoder();
                postMessage({ action: "init" });
                break;
            }
            case "setDefaultDecoderOptions": {
                KTX2DecoderModule.KTX2Decoder.DefaultDecoderOptions = event.data.options;
                break;
            }
            case "decode":
                ktx2Decoder
                    .decode(event.data.data, event.data.caps, event.data.options)
                    // eslint-disable-next-line github/no-then
                    .then((data) => {
                    const buffers = [];
                    for (let mip = 0; mip < data.mipmaps.length; ++mip) {
                        const mipmap = data.mipmaps[mip];
                        if (mipmap && mipmap.data) {
                            buffers.push(mipmap.data.buffer);
                        }
                    }
                    postMessage({ action: "decoded", success: true, decodedData: data }, buffers);
                })
                    // eslint-disable-next-line github/no-then
                    .catch((reason) => {
                    postMessage({ action: "decoded", success: false, msg: reason });
                });
                break;
        }
    };
}
async function initializeWebWorker(worker, wasmBinaries, urls) {
    return await new Promise((resolve, reject) => {
        const onError = (error) => {
            worker.removeEventListener("error", onError);
            worker.removeEventListener("message", onMessage);
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(error);
        };
        const onMessage = (message) => {
            if (message.data.action === "init") {
                worker.removeEventListener("error", onError);
                worker.removeEventListener("message", onMessage);
                resolve(worker);
            }
        };
        worker.addEventListener("error", onError);
        worker.addEventListener("message", onMessage);
        worker.postMessage({
            action: "init",
            urls,
            wasmBinaries,
        });
    });
}
//# sourceMappingURL=khronosTextureContainer2Worker.js.map

/***/ })

}]);