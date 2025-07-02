"use strict";
(self["webpackChunkbabylon"] = self["webpackChunkbabylon"] || []).push([[8],{

/***/ 213:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Dispose: () => (/* binding */ Dispose),
/* harmony export */   DumpData: () => (/* binding */ DumpData),
/* harmony export */   DumpDataAsync: () => (/* binding */ DumpDataAsync),
/* harmony export */   DumpFramebuffer: () => (/* binding */ DumpFramebuffer),
/* harmony export */   DumpTools: () => (/* binding */ DumpTools)
/* harmony export */ });
/* harmony import */ var _Materials_effectRenderer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202);
/* harmony import */ var _tools_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(17);
/* harmony import */ var _Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(12);
/* harmony import */ var _Engines_engineStore_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(10);





let DumpToolsEngine;
let EnginePromise = null;
async function _CreateDumpRendererAsync() {
    if (!EnginePromise) {
        EnginePromise = new Promise((resolve, reject) => {
            let canvas;
            let engine = null;
            const options = {
                preserveDrawingBuffer: true,
                depth: false,
                stencil: false,
                alpha: true,
                premultipliedAlpha: false,
                antialias: false,
                failIfMajorPerformanceCaveat: false,
            };
            Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 77))
                // eslint-disable-next-line github/no-then
                .then(({ ThinEngine: thinEngineClass }) => {
                const engineInstanceCount = _Engines_engineStore_js__WEBPACK_IMPORTED_MODULE_3__.EngineStore.Instances.length;
                try {
                    canvas = new OffscreenCanvas(100, 100); // will be resized later
                    engine = new thinEngineClass(canvas, false, options);
                }
                catch (e) {
                    if (engineInstanceCount < _Engines_engineStore_js__WEBPACK_IMPORTED_MODULE_3__.EngineStore.Instances.length) {
                        // The engine was created by another instance, let's use it
                        _Engines_engineStore_js__WEBPACK_IMPORTED_MODULE_3__.EngineStore.Instances.pop()?.dispose();
                    }
                    // The browser either does not support OffscreenCanvas or WebGL context in OffscreenCanvas, fallback on a regular canvas
                    canvas = document.createElement("canvas");
                    engine = new thinEngineClass(canvas, false, options);
                }
                // remove this engine from the list of instances to avoid using it for other purposes
                _Engines_engineStore_js__WEBPACK_IMPORTED_MODULE_3__.EngineStore.Instances.pop();
                // However, make sure to dispose it when no other engines are left
                _Engines_engineStore_js__WEBPACK_IMPORTED_MODULE_3__.EngineStore.OnEnginesDisposedObservable.add((e) => {
                    // guaranteed to run when no other instances are left
                    // only dispose if it's not the current engine
                    if (engine && e !== engine && !engine.isDisposed && _Engines_engineStore_js__WEBPACK_IMPORTED_MODULE_3__.EngineStore.Instances.length === 0) {
                        // Dump the engine and the associated resources
                        Dispose();
                    }
                });
                engine.getCaps().parallelShaderCompile = undefined;
                const renderer = new _Materials_effectRenderer_js__WEBPACK_IMPORTED_MODULE_0__.EffectRenderer(engine);
                // eslint-disable-next-line @typescript-eslint/no-floating-promises, github/no-then
                __webpack_require__.e(/* import() */ 20).then(__webpack_require__.bind(__webpack_require__, 243)).then(({ passPixelShader }) => {
                    if (!engine) {
                        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                        reject("Engine is not defined");
                        return;
                    }
                    const wrapper = new _Materials_effectRenderer_js__WEBPACK_IMPORTED_MODULE_0__.EffectWrapper({
                        engine,
                        name: passPixelShader.name,
                        fragmentShader: passPixelShader.shader,
                        samplerNames: ["textureSampler"],
                    });
                    DumpToolsEngine = {
                        canvas,
                        engine,
                        renderer,
                        wrapper,
                    };
                    resolve(DumpToolsEngine);
                });
            })
                // eslint-disable-next-line github/no-then
                .catch(reject);
        });
    }
    return await EnginePromise;
}
/**
 * Dumps the current bound framebuffer
 * @param width defines the rendering width
 * @param height defines the rendering height
 * @param engine defines the hosting engine
 * @param successCallback defines the callback triggered once the data are available
 * @param mimeType defines the mime type of the result
 * @param fileName defines the filename to download. If present, the result will automatically be downloaded
 * @param quality The quality of the image if lossy mimeType is used (e.g. image/jpeg, image/webp). See {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob | HTMLCanvasElement.toBlob()}'s `quality` parameter.
 * @returns a void promise
 */
// Should have "Async" in the name but this is a public API and we can't break it now
// eslint-disable-next-line no-restricted-syntax
async function DumpFramebuffer(width, height, engine, successCallback, mimeType = "image/png", fileName, quality) {
    // Read the contents of the framebuffer
    const bufferView = await engine.readPixels(0, 0, width, height);
    const data = new Uint8Array(bufferView.buffer);
    DumpData(width, height, data, successCallback, mimeType, fileName, true, undefined, quality);
}
/**
 * Dumps an array buffer
 * @param width defines the rendering width
 * @param height defines the rendering height
 * @param data the data array
 * @param mimeType defines the mime type of the result
 * @param fileName defines the filename to download. If present, the result will automatically be downloaded
 * @param invertY true to invert the picture in the Y dimension
 * @param toArrayBuffer true to convert the data to an ArrayBuffer (encoded as `mimeType`) instead of a base64 string
 * @param quality The quality of the image if lossy mimeType is used (e.g. image/jpeg, image/webp). See {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob | HTMLCanvasElement.toBlob()}'s `quality` parameter.
 * @returns a promise that resolve to the final data
 */
async function DumpDataAsync(width, height, data, mimeType = "image/png", fileName, invertY = false, toArrayBuffer = false, quality) {
    return await new Promise((resolve) => {
        DumpData(width, height, data, (result) => resolve(result), mimeType, fileName, invertY, toArrayBuffer, quality);
    });
}
/**
 * Dumps an array buffer
 * @param width defines the rendering width
 * @param height defines the rendering height
 * @param data the data array
 * @param successCallback defines the callback triggered once the data are available
 * @param mimeType defines the mime type of the result
 * @param fileName defines the filename to download. If present, the result will automatically be downloaded
 * @param invertY true to invert the picture in the Y dimension
 * @param toArrayBuffer true to convert the data to an ArrayBuffer (encoded as `mimeType`) instead of a base64 string
 * @param quality The quality of the image if lossy mimeType is used (e.g. image/jpeg, image/webp). See {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob | HTMLCanvasElement.toBlob()}'s `quality` parameter.
 */
function DumpData(width, height, data, successCallback, mimeType = "image/png", fileName, invertY = false, toArrayBuffer = false, quality) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises, github/no-then
    _CreateDumpRendererAsync().then((renderer) => {
        renderer.engine.setSize(width, height, true);
        // Convert if data are float32
        if (data instanceof Float32Array) {
            const data2 = new Uint8Array(data.length);
            let n = data.length;
            while (n--) {
                const v = data[n];
                data2[n] = Math.round((0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_2__.Clamp)(v) * 255);
            }
            data = data2;
        }
        // Create the image
        const texture = renderer.engine.createRawTexture(data, width, height, 5, false, !invertY, 1);
        renderer.renderer.setViewport();
        renderer.renderer.applyEffectWrapper(renderer.wrapper);
        renderer.wrapper.effect._bindTexture("textureSampler", texture);
        renderer.renderer.draw();
        if (toArrayBuffer) {
            _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.ToBlob(renderer.canvas, (blob) => {
                const fileReader = new FileReader();
                fileReader.onload = (event) => {
                    const arrayBuffer = event.target.result;
                    if (successCallback) {
                        successCallback(arrayBuffer);
                    }
                };
                fileReader.readAsArrayBuffer(blob);
            }, mimeType, quality);
        }
        else {
            _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.EncodeScreenshotCanvasData(renderer.canvas, successCallback, mimeType, fileName, quality);
        }
        texture.dispose();
    });
}
/**
 * Dispose the dump tools associated resources
 */
function Dispose() {
    if (DumpToolsEngine) {
        DumpToolsEngine.wrapper.dispose();
        DumpToolsEngine.renderer.dispose();
        DumpToolsEngine.engine.dispose();
    }
    else {
        // in cases where the engine is not yet created, we need to wait for it to dispose it
        // eslint-disable-next-line @typescript-eslint/no-floating-promises, github/no-then
        EnginePromise?.then((dumpToolsEngine) => {
            dumpToolsEngine.wrapper.dispose();
            dumpToolsEngine.renderer.dispose();
            dumpToolsEngine.engine.dispose();
        });
    }
    EnginePromise = null;
    DumpToolsEngine = null;
}
/**
 * Object containing a set of static utilities functions to dump data from a canvas
 * @deprecated use functions
 */
const DumpTools = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    DumpData,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    DumpDataAsync,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    DumpFramebuffer,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Dispose,
};
/**
 * This will be executed automatically for UMD and es5.
 * If esm dev wants the side effects to execute they will have to run it manually
 * Once we build native modules those need to be exported.
 * @internal
 */
const InitSideEffects = () => {
    // References the dependencies.
    _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.DumpData = DumpData;
    _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.DumpDataAsync = DumpDataAsync;
    _tools_js__WEBPACK_IMPORTED_MODULE_1__.Tools.DumpFramebuffer = DumpFramebuffer;
};
InitSideEffects();
//# sourceMappingURL=dumpTools.js.map

/***/ })

}]);