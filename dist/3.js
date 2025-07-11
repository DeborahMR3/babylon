"use strict";
(self["webpackChunkbabylon"] = self["webpackChunkbabylon"] || []).push([[3],{

/***/ 193:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DDSTools: () => (/* binding */ DDSTools)
/* harmony export */ });
/* harmony import */ var _Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(12);
/* harmony import */ var _Misc_logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(19);
/* harmony import */ var _Misc_HighDynamicRange_cubemapToSphericalPolynomial_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(194);
/* harmony import */ var _textureTools_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(195);
/* harmony import */ var _Engines_AbstractEngine_abstractEngine_cubeTexture_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(205);
/* eslint-disable @typescript-eslint/naming-convention */






// Based on demo done by Brandon Jones - http://media.tojicode.com/webgl-samples/dds.html
// All values and structures referenced from:
// http://msdn.microsoft.com/en-us/library/bb943991.aspx/
const DDS_MAGIC = 0x20534444;
const //DDSD_CAPS = 0x1,
//DDSD_HEIGHT = 0x2,
//DDSD_WIDTH = 0x4,
//DDSD_PITCH = 0x8,
//DDSD_PIXELFORMAT = 0x1000,
DDSD_MIPMAPCOUNT = 0x20000;
//DDSD_LINEARSIZE = 0x80000,
//DDSD_DEPTH = 0x800000;
// var DDSCAPS_COMPLEX = 0x8,
//     DDSCAPS_MIPMAP = 0x400000,
//     DDSCAPS_TEXTURE = 0x1000;
const DDSCAPS2_CUBEMAP = 0x200;
// DDSCAPS2_CUBEMAP_POSITIVEX = 0x400,
// DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800,
// DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000,
// DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000,
// DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000,
// DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000,
// DDSCAPS2_VOLUME = 0x200000;
const //DDPF_ALPHAPIXELS = 0x1,
//DDPF_ALPHA = 0x2,
DDPF_FOURCC = 0x4, DDPF_RGB = 0x40, 
//DDPF_YUV = 0x200,
DDPF_LUMINANCE = 0x20000;
function FourCCToInt32(value) {
    return value.charCodeAt(0) + (value.charCodeAt(1) << 8) + (value.charCodeAt(2) << 16) + (value.charCodeAt(3) << 24);
}
function Int32ToFourCC(value) {
    return String.fromCharCode(value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff);
}
const FOURCC_DXT1 = FourCCToInt32("DXT1");
const FOURCC_DXT3 = FourCCToInt32("DXT3");
const FOURCC_DXT5 = FourCCToInt32("DXT5");
const FOURCC_DX10 = FourCCToInt32("DX10");
const FOURCC_D3DFMT_R16G16B16A16F = 113;
const FOURCC_D3DFMT_R32G32B32A32F = 116;
const DXGI_FORMAT_R32G32B32A32_FLOAT = 2;
const DXGI_FORMAT_R16G16B16A16_FLOAT = 10;
const DXGI_FORMAT_B8G8R8X8_UNORM = 88;
const headerLengthInt = 31; // The header length in 32 bit ints
// Offsets into the header array
const off_magic = 0;
const off_size = 1;
const off_flags = 2;
const off_height = 3;
const off_width = 4;
const off_mipmapCount = 7;
const off_pfFlags = 20;
const off_pfFourCC = 21;
const off_RGBbpp = 22;
const off_RMask = 23;
const off_GMask = 24;
const off_BMask = 25;
const off_AMask = 26;
// var off_caps1 = 27;
const off_caps2 = 28;
// var off_caps3 = 29;
// var off_caps4 = 30;
const off_dxgiFormat = 32;
/**
 * Class used to provide DDS decompression tools
 */
class DDSTools {
    /**
     * Gets DDS information from an array buffer
     * @param data defines the array buffer view to read data from
     * @returns the DDS information
     */
    static GetDDSInfo(data) {
        const header = new Int32Array(data.buffer, data.byteOffset, headerLengthInt);
        const extendedHeader = new Int32Array(data.buffer, data.byteOffset, headerLengthInt + 4);
        let mipmapCount = 1;
        if (header[off_flags] & DDSD_MIPMAPCOUNT) {
            mipmapCount = Math.max(1, header[off_mipmapCount]);
        }
        const fourCC = header[off_pfFourCC];
        const dxgiFormat = fourCC === FOURCC_DX10 ? extendedHeader[off_dxgiFormat] : 0;
        let textureType = 0;
        switch (fourCC) {
            case FOURCC_D3DFMT_R16G16B16A16F:
                textureType = 2;
                break;
            case FOURCC_D3DFMT_R32G32B32A32F:
                textureType = 1;
                break;
            case FOURCC_DX10:
                if (dxgiFormat === DXGI_FORMAT_R16G16B16A16_FLOAT) {
                    textureType = 2;
                    break;
                }
                if (dxgiFormat === DXGI_FORMAT_R32G32B32A32_FLOAT) {
                    textureType = 1;
                    break;
                }
        }
        return {
            width: header[off_width],
            height: header[off_height],
            mipmapCount: mipmapCount,
            isFourCC: (header[off_pfFlags] & DDPF_FOURCC) === DDPF_FOURCC,
            isRGB: (header[off_pfFlags] & DDPF_RGB) === DDPF_RGB,
            isLuminance: (header[off_pfFlags] & DDPF_LUMINANCE) === DDPF_LUMINANCE,
            isCube: (header[off_caps2] & DDSCAPS2_CUBEMAP) === DDSCAPS2_CUBEMAP,
            isCompressed: fourCC === FOURCC_DXT1 || fourCC === FOURCC_DXT3 || fourCC === FOURCC_DXT5,
            dxgiFormat: dxgiFormat,
            textureType: textureType,
        };
    }
    static _GetHalfFloatAsFloatRGBAArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, lod) {
        const destArray = new Float32Array(dataLength);
        const srcData = new Uint16Array(arrayBuffer, dataOffset);
        let index = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const srcPos = (x + y * width) * 4;
                destArray[index] = (0,_textureTools_js__WEBPACK_IMPORTED_MODULE_3__.FromHalfFloat)(srcData[srcPos]);
                destArray[index + 1] = (0,_textureTools_js__WEBPACK_IMPORTED_MODULE_3__.FromHalfFloat)(srcData[srcPos + 1]);
                destArray[index + 2] = (0,_textureTools_js__WEBPACK_IMPORTED_MODULE_3__.FromHalfFloat)(srcData[srcPos + 2]);
                if (DDSTools.StoreLODInAlphaChannel) {
                    destArray[index + 3] = lod;
                }
                else {
                    destArray[index + 3] = (0,_textureTools_js__WEBPACK_IMPORTED_MODULE_3__.FromHalfFloat)(srcData[srcPos + 3]);
                }
                index += 4;
            }
        }
        return destArray;
    }
    static _GetHalfFloatRGBAArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, lod) {
        if (DDSTools.StoreLODInAlphaChannel) {
            const destArray = new Uint16Array(dataLength);
            const srcData = new Uint16Array(arrayBuffer, dataOffset);
            let index = 0;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const srcPos = (x + y * width) * 4;
                    destArray[index] = srcData[srcPos];
                    destArray[index + 1] = srcData[srcPos + 1];
                    destArray[index + 2] = srcData[srcPos + 2];
                    destArray[index + 3] = (0,_textureTools_js__WEBPACK_IMPORTED_MODULE_3__.ToHalfFloat)(lod);
                    index += 4;
                }
            }
            return destArray;
        }
        return new Uint16Array(arrayBuffer, dataOffset, dataLength);
    }
    static _GetFloatRGBAArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, lod) {
        if (DDSTools.StoreLODInAlphaChannel) {
            const destArray = new Float32Array(dataLength);
            const srcData = new Float32Array(arrayBuffer, dataOffset);
            let index = 0;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const srcPos = (x + y * width) * 4;
                    destArray[index] = srcData[srcPos];
                    destArray[index + 1] = srcData[srcPos + 1];
                    destArray[index + 2] = srcData[srcPos + 2];
                    destArray[index + 3] = lod;
                    index += 4;
                }
            }
            return destArray;
        }
        return new Float32Array(arrayBuffer, dataOffset, dataLength);
    }
    static _GetFloatAsHalfFloatRGBAArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, lod) {
        const destArray = new Uint16Array(dataLength);
        const srcData = new Float32Array(arrayBuffer, dataOffset);
        let index = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                destArray[index] = (0,_textureTools_js__WEBPACK_IMPORTED_MODULE_3__.ToHalfFloat)(srcData[index]);
                destArray[index + 1] = (0,_textureTools_js__WEBPACK_IMPORTED_MODULE_3__.ToHalfFloat)(srcData[index + 1]);
                destArray[index + 2] = (0,_textureTools_js__WEBPACK_IMPORTED_MODULE_3__.ToHalfFloat)(srcData[index + 2]);
                if (DDSTools.StoreLODInAlphaChannel) {
                    destArray[index + 3] = (0,_textureTools_js__WEBPACK_IMPORTED_MODULE_3__.ToHalfFloat)(lod);
                }
                else {
                    destArray[index + 3] = (0,_textureTools_js__WEBPACK_IMPORTED_MODULE_3__.ToHalfFloat)(srcData[index + 3]);
                }
                index += 4;
            }
        }
        return destArray;
    }
    static _GetFloatAsUIntRGBAArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, lod) {
        const destArray = new Uint8Array(dataLength);
        const srcData = new Float32Array(arrayBuffer, dataOffset);
        let index = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const srcPos = (x + y * width) * 4;
                destArray[index] = (0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_0__.Clamp)(srcData[srcPos]) * 255;
                destArray[index + 1] = (0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_0__.Clamp)(srcData[srcPos + 1]) * 255;
                destArray[index + 2] = (0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_0__.Clamp)(srcData[srcPos + 2]) * 255;
                if (DDSTools.StoreLODInAlphaChannel) {
                    destArray[index + 3] = lod;
                }
                else {
                    destArray[index + 3] = (0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_0__.Clamp)(srcData[srcPos + 3]) * 255;
                }
                index += 4;
            }
        }
        return destArray;
    }
    static _GetHalfFloatAsUIntRGBAArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, lod) {
        const destArray = new Uint8Array(dataLength);
        const srcData = new Uint16Array(arrayBuffer, dataOffset);
        let index = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const srcPos = (x + y * width) * 4;
                destArray[index] = (0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_0__.Clamp)((0,_textureTools_js__WEBPACK_IMPORTED_MODULE_3__.FromHalfFloat)(srcData[srcPos])) * 255;
                destArray[index + 1] = (0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_0__.Clamp)((0,_textureTools_js__WEBPACK_IMPORTED_MODULE_3__.FromHalfFloat)(srcData[srcPos + 1])) * 255;
                destArray[index + 2] = (0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_0__.Clamp)((0,_textureTools_js__WEBPACK_IMPORTED_MODULE_3__.FromHalfFloat)(srcData[srcPos + 2])) * 255;
                if (DDSTools.StoreLODInAlphaChannel) {
                    destArray[index + 3] = lod;
                }
                else {
                    destArray[index + 3] = (0,_Maths_math_scalar_functions_js__WEBPACK_IMPORTED_MODULE_0__.Clamp)((0,_textureTools_js__WEBPACK_IMPORTED_MODULE_3__.FromHalfFloat)(srcData[srcPos + 3])) * 255;
                }
                index += 4;
            }
        }
        return destArray;
    }
    static _GetRGBAArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, rOffset, gOffset, bOffset, aOffset) {
        const byteArray = new Uint8Array(dataLength);
        const srcData = new Uint8Array(arrayBuffer, dataOffset);
        let index = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const srcPos = (x + y * width) * 4;
                byteArray[index] = srcData[srcPos + rOffset];
                byteArray[index + 1] = srcData[srcPos + gOffset];
                byteArray[index + 2] = srcData[srcPos + bOffset];
                byteArray[index + 3] = srcData[srcPos + aOffset];
                index += 4;
            }
        }
        return byteArray;
    }
    static _ExtractLongWordOrder(value) {
        if (value === 0 || value === 255 || value === -16777216) {
            return 0;
        }
        return 1 + DDSTools._ExtractLongWordOrder(value >> 8);
    }
    static _GetRGBArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, rOffset, gOffset, bOffset) {
        const byteArray = new Uint8Array(dataLength);
        const srcData = new Uint8Array(arrayBuffer, dataOffset);
        let index = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const srcPos = (x + y * width) * 3;
                byteArray[index] = srcData[srcPos + rOffset];
                byteArray[index + 1] = srcData[srcPos + gOffset];
                byteArray[index + 2] = srcData[srcPos + bOffset];
                index += 3;
            }
        }
        return byteArray;
    }
    static _GetLuminanceArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer) {
        const byteArray = new Uint8Array(dataLength);
        const srcData = new Uint8Array(arrayBuffer, dataOffset);
        let index = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const srcPos = x + y * width;
                byteArray[index] = srcData[srcPos];
                index++;
            }
        }
        return byteArray;
    }
    /**
     * Uploads DDS Levels to a Babylon Texture
     * @internal
     */
    static UploadDDSLevels(engine, texture, data, info, loadMipmaps, faces, lodIndex = -1, currentFace, destTypeMustBeFilterable = true) {
        let sphericalPolynomialFaces = null;
        if (info.sphericalPolynomial) {
            sphericalPolynomialFaces = [];
        }
        const ext = !!engine.getCaps().s3tc;
        // TODO WEBGPU Once generateMipMaps is split into generateMipMaps + hasMipMaps in InternalTexture this line can be removed
        texture.generateMipMaps = loadMipmaps;
        const header = new Int32Array(data.buffer, data.byteOffset, headerLengthInt);
        let fourCC, width, height, dataLength = 0, dataOffset;
        let byteArray, mipmapCount, mip;
        let internalCompressedFormat = 0;
        let blockBytes = 1;
        if (header[off_magic] !== DDS_MAGIC) {
            _Misc_logger_js__WEBPACK_IMPORTED_MODULE_1__.Logger.Error("Invalid magic number in DDS header");
            return;
        }
        if (!info.isFourCC && !info.isRGB && !info.isLuminance) {
            _Misc_logger_js__WEBPACK_IMPORTED_MODULE_1__.Logger.Error("Unsupported format, must contain a FourCC, RGB or LUMINANCE code");
            return;
        }
        if (info.isCompressed && !ext) {
            _Misc_logger_js__WEBPACK_IMPORTED_MODULE_1__.Logger.Error("Compressed textures are not supported on this platform.");
            return;
        }
        let bpp = header[off_RGBbpp];
        dataOffset = header[off_size] + 4;
        let computeFormats = false;
        if (info.isFourCC) {
            fourCC = header[off_pfFourCC];
            switch (fourCC) {
                case FOURCC_DXT1:
                    blockBytes = 8;
                    internalCompressedFormat = 33777;
                    break;
                case FOURCC_DXT3:
                    blockBytes = 16;
                    internalCompressedFormat = 33778;
                    break;
                case FOURCC_DXT5:
                    blockBytes = 16;
                    internalCompressedFormat = 33779;
                    break;
                case FOURCC_D3DFMT_R16G16B16A16F:
                    computeFormats = true;
                    bpp = 64;
                    break;
                case FOURCC_D3DFMT_R32G32B32A32F:
                    computeFormats = true;
                    bpp = 128;
                    break;
                case FOURCC_DX10: {
                    // There is an additionnal header so dataOffset need to be changed
                    dataOffset += 5 * 4; // 5 uints
                    let supported = false;
                    switch (info.dxgiFormat) {
                        case DXGI_FORMAT_R16G16B16A16_FLOAT:
                            computeFormats = true;
                            bpp = 64;
                            supported = true;
                            break;
                        case DXGI_FORMAT_R32G32B32A32_FLOAT:
                            computeFormats = true;
                            bpp = 128;
                            supported = true;
                            break;
                        case DXGI_FORMAT_B8G8R8X8_UNORM:
                            info.isRGB = true;
                            info.isFourCC = false;
                            bpp = 32;
                            supported = true;
                            break;
                    }
                    if (supported) {
                        break;
                    }
                }
                // eslint-disable-next-line no-fallthrough
                default:
                    _Misc_logger_js__WEBPACK_IMPORTED_MODULE_1__.Logger.Error(["Unsupported FourCC code:", Int32ToFourCC(fourCC)]);
                    return;
            }
        }
        const rOffset = DDSTools._ExtractLongWordOrder(header[off_RMask]);
        const gOffset = DDSTools._ExtractLongWordOrder(header[off_GMask]);
        const bOffset = DDSTools._ExtractLongWordOrder(header[off_BMask]);
        const aOffset = DDSTools._ExtractLongWordOrder(header[off_AMask]);
        if (computeFormats) {
            internalCompressedFormat = engine._getRGBABufferInternalSizedFormat(info.textureType);
        }
        mipmapCount = 1;
        if (header[off_flags] & DDSD_MIPMAPCOUNT && loadMipmaps !== false) {
            mipmapCount = Math.max(1, header[off_mipmapCount]);
        }
        const startFace = currentFace || 0;
        const caps = engine.getCaps();
        for (let face = startFace; face < faces; face++) {
            width = header[off_width];
            height = header[off_height];
            for (mip = 0; mip < mipmapCount; ++mip) {
                if (lodIndex === -1 || lodIndex === mip) {
                    // In case of fixed LOD, if the lod has just been uploaded, early exit.
                    const i = lodIndex === -1 ? mip : 0;
                    if (!info.isCompressed && info.isFourCC) {
                        texture.format = 5;
                        dataLength = width * height * 4;
                        let floatArray = null;
                        if (engine._badOS || engine._badDesktopOS || (!caps.textureHalfFloat && !caps.textureFloat)) {
                            // Required because iOS has many issues with float and half float generation
                            if (bpp === 128) {
                                floatArray = DDSTools._GetFloatAsUIntRGBAArrayBuffer(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, i);
                                if (sphericalPolynomialFaces && i == 0) {
                                    sphericalPolynomialFaces.push(DDSTools._GetFloatRGBAArrayBuffer(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, i));
                                }
                            }
                            else if (bpp === 64) {
                                floatArray = DDSTools._GetHalfFloatAsUIntRGBAArrayBuffer(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, i);
                                if (sphericalPolynomialFaces && i == 0) {
                                    sphericalPolynomialFaces.push(DDSTools._GetHalfFloatAsFloatRGBAArrayBuffer(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, i));
                                }
                            }
                            texture.type = 0;
                        }
                        else {
                            const floatAvailable = caps.textureFloat && ((destTypeMustBeFilterable && caps.textureFloatLinearFiltering) || !destTypeMustBeFilterable);
                            const halfFloatAvailable = caps.textureHalfFloat && ((destTypeMustBeFilterable && caps.textureHalfFloatLinearFiltering) || !destTypeMustBeFilterable);
                            const destType = (bpp === 128 || (bpp === 64 && !halfFloatAvailable)) && floatAvailable
                                ? 1
                                : (bpp === 64 || (bpp === 128 && !floatAvailable)) && halfFloatAvailable
                                    ? 2
                                    : 0;
                            let dataGetter;
                            let dataGetterPolynomial = null;
                            switch (bpp) {
                                case 128: {
                                    switch (destType) {
                                        case 1:
                                            dataGetter = DDSTools._GetFloatRGBAArrayBuffer;
                                            dataGetterPolynomial = null;
                                            break;
                                        case 2:
                                            dataGetter = DDSTools._GetFloatAsHalfFloatRGBAArrayBuffer;
                                            dataGetterPolynomial = DDSTools._GetFloatRGBAArrayBuffer;
                                            break;
                                        case 0:
                                            dataGetter = DDSTools._GetFloatAsUIntRGBAArrayBuffer;
                                            dataGetterPolynomial = DDSTools._GetFloatRGBAArrayBuffer;
                                            break;
                                    }
                                    break;
                                }
                                default: {
                                    // 64 bpp
                                    switch (destType) {
                                        case 1:
                                            dataGetter = DDSTools._GetHalfFloatAsFloatRGBAArrayBuffer;
                                            dataGetterPolynomial = null;
                                            break;
                                        case 2:
                                            dataGetter = DDSTools._GetHalfFloatRGBAArrayBuffer;
                                            dataGetterPolynomial = DDSTools._GetHalfFloatAsFloatRGBAArrayBuffer;
                                            break;
                                        case 0:
                                            dataGetter = DDSTools._GetHalfFloatAsUIntRGBAArrayBuffer;
                                            dataGetterPolynomial = DDSTools._GetHalfFloatAsFloatRGBAArrayBuffer;
                                            break;
                                    }
                                    break;
                                }
                            }
                            texture.type = destType;
                            floatArray = dataGetter(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, i);
                            if (sphericalPolynomialFaces && i == 0) {
                                sphericalPolynomialFaces.push(dataGetterPolynomial ? dataGetterPolynomial(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, i) : floatArray);
                            }
                        }
                        if (floatArray) {
                            engine._uploadDataToTextureDirectly(texture, floatArray, face, i);
                        }
                    }
                    else if (info.isRGB) {
                        texture.type = 0;
                        if (bpp === 24) {
                            texture.format = 4;
                            dataLength = width * height * 3;
                            byteArray = DDSTools._GetRGBArrayBuffer(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, rOffset, gOffset, bOffset);
                            engine._uploadDataToTextureDirectly(texture, byteArray, face, i);
                        }
                        else {
                            // 32
                            texture.format = 5;
                            dataLength = width * height * 4;
                            byteArray = DDSTools._GetRGBAArrayBuffer(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, rOffset, gOffset, bOffset, aOffset);
                            engine._uploadDataToTextureDirectly(texture, byteArray, face, i);
                        }
                    }
                    else if (info.isLuminance) {
                        const unpackAlignment = engine._getUnpackAlignement();
                        const unpaddedRowSize = width;
                        const paddedRowSize = Math.floor((width + unpackAlignment - 1) / unpackAlignment) * unpackAlignment;
                        dataLength = paddedRowSize * (height - 1) + unpaddedRowSize;
                        byteArray = DDSTools._GetLuminanceArrayBuffer(width, height, data.byteOffset + dataOffset, dataLength, data.buffer);
                        texture.format = 1;
                        texture.type = 0;
                        engine._uploadDataToTextureDirectly(texture, byteArray, face, i);
                    }
                    else {
                        dataLength = (((Math.max(4, width) / 4) * Math.max(4, height)) / 4) * blockBytes;
                        byteArray = new Uint8Array(data.buffer, data.byteOffset + dataOffset, dataLength);
                        texture.type = 0;
                        engine._uploadCompressedDataToTextureDirectly(texture, internalCompressedFormat, width, height, byteArray, face, i);
                    }
                }
                dataOffset += bpp ? width * height * (bpp / 8) : dataLength;
                width *= 0.5;
                height *= 0.5;
                width = Math.max(1.0, width);
                height = Math.max(1.0, height);
            }
            if (currentFace !== undefined) {
                // Loading a single face
                break;
            }
        }
        if (sphericalPolynomialFaces && sphericalPolynomialFaces.length > 0) {
            info.sphericalPolynomial = _Misc_HighDynamicRange_cubemapToSphericalPolynomial_js__WEBPACK_IMPORTED_MODULE_2__.CubeMapToSphericalPolynomialTools.ConvertCubeMapToSphericalPolynomial({
                size: header[off_width],
                right: sphericalPolynomialFaces[0],
                left: sphericalPolynomialFaces[1],
                up: sphericalPolynomialFaces[2],
                down: sphericalPolynomialFaces[3],
                front: sphericalPolynomialFaces[4],
                back: sphericalPolynomialFaces[5],
                format: 5,
                type: 1,
                gammaSpace: false,
            });
        }
        else {
            info.sphericalPolynomial = undefined;
        }
    }
}
/**
 * Gets or sets a boolean indicating that LOD info is stored in alpha channel (false by default)
 */
DDSTools.StoreLODInAlphaChannel = false;
//# sourceMappingURL=dds.js.map

/***/ }),

/***/ 205:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Materials_Textures_internalTexture_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(51);
/* harmony import */ var _Misc_logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(19);
/* harmony import */ var _Misc_fileTools_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(24);
/* harmony import */ var _Misc_guid_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(55);
/* harmony import */ var _abstractEngine_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(41);
/* harmony import */ var _Materials_Textures_Loaders_textureLoaderManager_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(53);
/* harmony import */ var _Misc_urlTools_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(206);







_abstractEngine_js__WEBPACK_IMPORTED_MODULE_4__.AbstractEngine.prototype._partialLoadFile = function (url, index, loadedFiles, onfinish, onErrorCallBack = null) {
    const onload = (data) => {
        loadedFiles[index] = data;
        loadedFiles._internalCount++;
        if (loadedFiles._internalCount === 6) {
            onfinish(loadedFiles);
        }
    };
    const onerror = (request, exception) => {
        if (onErrorCallBack && request) {
            onErrorCallBack(request.status + " " + request.statusText, exception);
        }
    };
    this._loadFile(url, onload, undefined, undefined, true, onerror);
};
_abstractEngine_js__WEBPACK_IMPORTED_MODULE_4__.AbstractEngine.prototype._cascadeLoadFiles = function (scene, onfinish, files, onError = null) {
    const loadedFiles = [];
    loadedFiles._internalCount = 0;
    for (let index = 0; index < 6; index++) {
        this._partialLoadFile(files[index], index, loadedFiles, onfinish, onError);
    }
};
_abstractEngine_js__WEBPACK_IMPORTED_MODULE_4__.AbstractEngine.prototype._cascadeLoadImgs = function (scene, texture, onfinish, files, onError = null, mimeType) {
    const loadedImages = [];
    loadedImages._internalCount = 0;
    for (let index = 0; index < 6; index++) {
        this._partialLoadImg(files[index], index, loadedImages, scene, texture, onfinish, onError, mimeType);
    }
};
_abstractEngine_js__WEBPACK_IMPORTED_MODULE_4__.AbstractEngine.prototype._partialLoadImg = function (url, index, loadedImages, scene, texture, onfinish, onErrorCallBack = null, mimeType) {
    const tokenPendingData = (0,_Misc_guid_js__WEBPACK_IMPORTED_MODULE_3__.RandomGUID)();
    const onload = (img) => {
        loadedImages[index] = img;
        loadedImages._internalCount++;
        if (scene) {
            scene.removePendingData(tokenPendingData);
        }
        if (loadedImages._internalCount === 6 && onfinish) {
            onfinish(texture, loadedImages);
        }
    };
    const onerror = (message, exception) => {
        if (scene) {
            scene.removePendingData(tokenPendingData);
        }
        if (onErrorCallBack) {
            onErrorCallBack(message, exception);
        }
    };
    (0,_Misc_fileTools_js__WEBPACK_IMPORTED_MODULE_2__.LoadImage)(url, onload, onerror, scene ? scene.offlineProvider : null, mimeType);
    if (scene) {
        scene.addPendingData(tokenPendingData);
    }
};
_abstractEngine_js__WEBPACK_IMPORTED_MODULE_4__.AbstractEngine.prototype.createCubeTextureBase = function (rootUrl, scene, files, noMipmap, onLoad = null, onError = null, format, forcedExtension = null, createPolynomials = false, lodScale = 0, lodOffset = 0, fallback = null, beforeLoadCubeDataCallback = null, imageHandler = null, useSRGBBuffer = false, buffer = null) {
    const texture = fallback ? fallback : new _Materials_Textures_internalTexture_js__WEBPACK_IMPORTED_MODULE_0__.InternalTexture(this, 7 /* InternalTextureSource.Cube */);
    texture.isCube = true;
    texture.url = rootUrl;
    texture.generateMipMaps = !noMipmap;
    texture._lodGenerationScale = lodScale;
    texture._lodGenerationOffset = lodOffset;
    texture._useSRGBBuffer = !!useSRGBBuffer && this._caps.supportSRGBBuffers && (this.version > 1 || this.isWebGPU || !!noMipmap);
    if (texture !== fallback) {
        texture.label = rootUrl.substring(0, 60); // default label, can be overriden by the caller
    }
    if (!this._doNotHandleContextLost) {
        texture._extension = forcedExtension;
        texture._files = files;
        texture._buffer = buffer;
    }
    const originalRootUrl = rootUrl;
    if (this._transformTextureUrl && !fallback) {
        rootUrl = this._transformTextureUrl(rootUrl);
    }
    const extension = forcedExtension ?? (0,_Misc_urlTools_js__WEBPACK_IMPORTED_MODULE_6__.GetExtensionFromUrl)(rootUrl);
    const loaderPromise = (0,_Materials_Textures_Loaders_textureLoaderManager_js__WEBPACK_IMPORTED_MODULE_5__._GetCompatibleTextureLoader)(extension);
    const localOnError = (message, exception) => {
        // if an error was thrown during load, dispose the texture, otherwise it will stay in the cache
        texture.dispose();
        if (onError) {
            onError(message, exception);
        }
        else if (message) {
            _Misc_logger_js__WEBPACK_IMPORTED_MODULE_1__.Logger.Warn(message);
        }
    };
    const onInternalError = (request, exception) => {
        if (rootUrl === originalRootUrl) {
            if (request) {
                localOnError(request.status + " " + request.statusText, exception);
            }
        }
        else {
            // fall back to the original url if the transformed url fails to load
            _Misc_logger_js__WEBPACK_IMPORTED_MODULE_1__.Logger.Warn(`Failed to load ${rootUrl}, falling back to the ${originalRootUrl}`);
            this.createCubeTextureBase(originalRootUrl, scene, files, !!noMipmap, onLoad, localOnError, format, forcedExtension, createPolynomials, lodScale, lodOffset, texture, beforeLoadCubeDataCallback, imageHandler, useSRGBBuffer, buffer);
        }
    };
    if (loaderPromise) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises, github/no-then
        loaderPromise.then((loader) => {
            const onLoadData = (data) => {
                if (beforeLoadCubeDataCallback) {
                    beforeLoadCubeDataCallback(texture, data);
                }
                loader.loadCubeData(data, texture, createPolynomials, onLoad, (message, exception) => {
                    localOnError(message, exception);
                });
            };
            if (buffer) {
                onLoadData(buffer);
            }
            else if (files && files.length === 6) {
                if (loader.supportCascades) {
                    this._cascadeLoadFiles(scene, (images) => onLoadData(images.map((image) => new Uint8Array(image))), files, localOnError);
                }
                else {
                    localOnError("Textures type does not support cascades.");
                }
            }
            else {
                this._loadFile(rootUrl, (data) => onLoadData(new Uint8Array(data)), undefined, undefined, true, onInternalError);
            }
        });
    }
    else {
        if (!files || files.length === 0) {
            throw new Error("Cannot load cubemap because files were not defined, or the correct loader was not found.");
        }
        this._cascadeLoadImgs(scene, texture, (texture, imgs) => {
            if (imageHandler) {
                imageHandler(texture, imgs);
            }
        }, files, localOnError);
    }
    this._internalTexturesCache.push(texture);
    return texture;
};
//# sourceMappingURL=abstractEngine.cubeTexture.js.map

/***/ }),

/***/ 206:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GetExtensionFromUrl: () => (/* binding */ GetExtensionFromUrl)
/* harmony export */ });
/**
 * Gets the file extension from a URL.
 * @param url The URL to get the file extension from.
 * @returns The file extension, or an empty string if no extension is found.
 */
function GetExtensionFromUrl(url) {
    const urlWithoutUriParams = url.split("?")[0];
    const lastDot = urlWithoutUriParams.lastIndexOf(".");
    const extension = lastDot > -1 ? urlWithoutUriParams.substring(lastDot).toLowerCase() : "";
    return extension;
}
//# sourceMappingURL=urlTools.js.map

/***/ })

}]);