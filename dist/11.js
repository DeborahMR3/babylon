"use strict";
(self["webpackChunkbabylon"] = self["webpackChunkbabylon"] || []).push([[11],{

/***/ 224:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _TGATextureLoader: () => (/* binding */ _TGATextureLoader)
/* harmony export */ });
/* harmony import */ var _Misc_tga_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(225);

/**
 * Implementation of the TGA Texture Loader.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
class _TGATextureLoader {
    constructor() {
        /**
         * Defines whether the loader supports cascade loading the different faces.
         */
        this.supportCascades = false;
    }
    /**
     * Uploads the cube texture data to the WebGL texture. It has already been bound.
     */
    loadCubeData() {
        // eslint-disable-next-line no-throw-literal
        throw ".env not supported in Cube.";
    }
    /**
     * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
     * @param data contains the texture data
     * @param texture defines the BabylonJS internal texture
     * @param callback defines the method to call once ready to upload
     */
    loadData(data, texture, callback) {
        const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        const header = (0,_Misc_tga_js__WEBPACK_IMPORTED_MODULE_0__.GetTGAHeader)(bytes);
        callback(header.width, header.height, texture.generateMipMaps, false, () => {
            (0,_Misc_tga_js__WEBPACK_IMPORTED_MODULE_0__.UploadContent)(texture, bytes);
        });
    }
}
//# sourceMappingURL=tgaTextureLoader.js.map

/***/ }),

/***/ 225:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GetTGAHeader: () => (/* binding */ GetTGAHeader),
/* harmony export */   TGATools: () => (/* binding */ TGATools),
/* harmony export */   UploadContent: () => (/* binding */ UploadContent)
/* harmony export */ });
/* harmony import */ var _Misc_logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(19);

//private static _TYPE_NO_DATA = 0;
const _TYPE_INDEXED = 1;
const _TYPE_RGB = 2;
const _TYPE_GREY = 3;
const _TYPE_RLE_INDEXED = 9;
const _TYPE_RLE_RGB = 10;
const _TYPE_RLE_GREY = 11;
const _ORIGIN_MASK = 0x30;
const _ORIGIN_SHIFT = 0x04;
const _ORIGIN_BL = 0x00;
const _ORIGIN_BR = 0x01;
const _ORIGIN_UL = 0x02;
const _ORIGIN_UR = 0x03;
/**
 * Gets the header of a TGA file
 * @param data defines the TGA data
 * @returns the header
 */
function GetTGAHeader(data) {
    let offset = 0;
    const header = {
        id_length: data[offset++],
        colormap_type: data[offset++],
        image_type: data[offset++],
        colormap_index: data[offset++] | (data[offset++] << 8),
        colormap_length: data[offset++] | (data[offset++] << 8),
        colormap_size: data[offset++],
        origin: [data[offset++] | (data[offset++] << 8), data[offset++] | (data[offset++] << 8)],
        width: data[offset++] | (data[offset++] << 8),
        height: data[offset++] | (data[offset++] << 8),
        pixel_size: data[offset++],
        flags: data[offset++],
    };
    return header;
}
/**
 * Uploads TGA content to a Babylon Texture
 * @internal
 */
function UploadContent(texture, data) {
    // Not enough data to contain header ?
    if (data.length < 19) {
        _Misc_logger_js__WEBPACK_IMPORTED_MODULE_0__.Logger.Error("Unable to load TGA file - Not enough data to contain header");
        return;
    }
    // Read Header
    let offset = 18;
    const header = GetTGAHeader(data);
    // Assume it's a valid Targa file.
    if (header.id_length + offset > data.length) {
        _Misc_logger_js__WEBPACK_IMPORTED_MODULE_0__.Logger.Error("Unable to load TGA file - Not enough data");
        return;
    }
    // Skip not needed data
    offset += header.id_length;
    let use_rle = false;
    let use_pal = false;
    let use_grey = false;
    // Get some informations.
    switch (header.image_type) {
        case _TYPE_RLE_INDEXED:
            use_rle = true;
        // eslint-disable-next-line no-fallthrough
        case _TYPE_INDEXED:
            use_pal = true;
            break;
        case _TYPE_RLE_RGB:
            use_rle = true;
        // eslint-disable-next-line no-fallthrough
        case _TYPE_RGB:
            // use_rgb = true;
            break;
        case _TYPE_RLE_GREY:
            use_rle = true;
        // eslint-disable-next-line no-fallthrough
        case _TYPE_GREY:
            use_grey = true;
            break;
    }
    let pixel_data;
    // var numAlphaBits = header.flags & 0xf;
    const pixel_size = header.pixel_size >> 3;
    const pixel_total = header.width * header.height * pixel_size;
    // Read palettes
    let palettes;
    if (use_pal) {
        palettes = data.subarray(offset, (offset += header.colormap_length * (header.colormap_size >> 3)));
    }
    // Read LRE
    if (use_rle) {
        pixel_data = new Uint8Array(pixel_total);
        let c, count, i;
        let localOffset = 0;
        const pixels = new Uint8Array(pixel_size);
        while (offset < pixel_total && localOffset < pixel_total) {
            c = data[offset++];
            count = (c & 0x7f) + 1;
            // RLE pixels
            if (c & 0x80) {
                // Bind pixel tmp array
                for (i = 0; i < pixel_size; ++i) {
                    pixels[i] = data[offset++];
                }
                // Copy pixel array
                for (i = 0; i < count; ++i) {
                    pixel_data.set(pixels, localOffset + i * pixel_size);
                }
                localOffset += pixel_size * count;
            }
            // Raw pixels
            else {
                count *= pixel_size;
                for (i = 0; i < count; ++i) {
                    pixel_data[localOffset + i] = data[offset++];
                }
                localOffset += count;
            }
        }
    }
    // RAW Pixels
    else {
        pixel_data = data.subarray(offset, (offset += use_pal ? header.width * header.height : pixel_total));
    }
    // Load to texture
    let x_start, y_start, x_step, y_step, y_end, x_end;
    switch ((header.flags & _ORIGIN_MASK) >> _ORIGIN_SHIFT) {
        default:
        case _ORIGIN_UL:
            x_start = 0;
            x_step = 1;
            x_end = header.width;
            y_start = 0;
            y_step = 1;
            y_end = header.height;
            break;
        case _ORIGIN_BL:
            x_start = 0;
            x_step = 1;
            x_end = header.width;
            y_start = header.height - 1;
            y_step = -1;
            y_end = -1;
            break;
        case _ORIGIN_UR:
            x_start = header.width - 1;
            x_step = -1;
            x_end = -1;
            y_start = 0;
            y_step = 1;
            y_end = header.height;
            break;
        case _ORIGIN_BR:
            x_start = header.width - 1;
            x_step = -1;
            x_end = -1;
            y_start = header.height - 1;
            y_step = -1;
            y_end = -1;
            break;
    }
    // Load the specify method
    const func = "_getImageData" + (use_grey ? "Grey" : "") + header.pixel_size + "bits";
    const imageData = TGATools[func](header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end);
    const engine = texture.getEngine();
    engine._uploadDataToTextureDirectly(texture, imageData);
}
/**
 * @internal
 */
function GetImageData8bits(header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end) {
    const image = pixel_data, colormap = palettes;
    const width = header.width, height = header.height;
    let color, i = 0, x, y;
    const imageData = new Uint8Array(width * height * 4);
    for (y = y_start; y !== y_end; y += y_step) {
        for (x = x_start; x !== x_end; x += x_step, i++) {
            color = image[i];
            imageData[(x + width * y) * 4 + 3] = 255;
            imageData[(x + width * y) * 4 + 2] = colormap[color * 3 + 0];
            imageData[(x + width * y) * 4 + 1] = colormap[color * 3 + 1];
            imageData[(x + width * y) * 4 + 0] = colormap[color * 3 + 2];
        }
    }
    return imageData;
}
/**
 * @internal
 */
function GetImageData16bits(header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end) {
    const image = pixel_data;
    const width = header.width, height = header.height;
    let color, i = 0, x, y;
    const imageData = new Uint8Array(width * height * 4);
    for (y = y_start; y !== y_end; y += y_step) {
        for (x = x_start; x !== x_end; x += x_step, i += 2) {
            color = image[i + 0] + (image[i + 1] << 8); // Inversed ?
            const r = ((((color & 0x7c00) >> 10) * 255) / 0x1f) | 0;
            const g = ((((color & 0x03e0) >> 5) * 255) / 0x1f) | 0;
            const b = (((color & 0x001f) * 255) / 0x1f) | 0;
            imageData[(x + width * y) * 4 + 0] = r;
            imageData[(x + width * y) * 4 + 1] = g;
            imageData[(x + width * y) * 4 + 2] = b;
            imageData[(x + width * y) * 4 + 3] = color & 0x8000 ? 0 : 255;
        }
    }
    return imageData;
}
/**
 * @internal
 */
function GetImageData24bits(header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end) {
    const image = pixel_data;
    const width = header.width, height = header.height;
    let i = 0, x, y;
    const imageData = new Uint8Array(width * height * 4);
    for (y = y_start; y !== y_end; y += y_step) {
        for (x = x_start; x !== x_end; x += x_step, i += 3) {
            imageData[(x + width * y) * 4 + 3] = 255;
            imageData[(x + width * y) * 4 + 2] = image[i + 0];
            imageData[(x + width * y) * 4 + 1] = image[i + 1];
            imageData[(x + width * y) * 4 + 0] = image[i + 2];
        }
    }
    return imageData;
}
/**
 * @internal
 */
function GetImageData32bits(header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end) {
    const image = pixel_data;
    const width = header.width, height = header.height;
    let i = 0, x, y;
    const imageData = new Uint8Array(width * height * 4);
    for (y = y_start; y !== y_end; y += y_step) {
        for (x = x_start; x !== x_end; x += x_step, i += 4) {
            imageData[(x + width * y) * 4 + 2] = image[i + 0];
            imageData[(x + width * y) * 4 + 1] = image[i + 1];
            imageData[(x + width * y) * 4 + 0] = image[i + 2];
            imageData[(x + width * y) * 4 + 3] = image[i + 3];
        }
    }
    return imageData;
}
/**
 * @internal
 */
function GetImageDataGrey8bits(header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end) {
    const image = pixel_data;
    const width = header.width, height = header.height;
    let color, i = 0, x, y;
    const imageData = new Uint8Array(width * height * 4);
    for (y = y_start; y !== y_end; y += y_step) {
        for (x = x_start; x !== x_end; x += x_step, i++) {
            color = image[i];
            imageData[(x + width * y) * 4 + 0] = color;
            imageData[(x + width * y) * 4 + 1] = color;
            imageData[(x + width * y) * 4 + 2] = color;
            imageData[(x + width * y) * 4 + 3] = 255;
        }
    }
    return imageData;
}
/**
 * @internal
 */
function GetImageDataGrey16bits(header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end) {
    const image = pixel_data;
    const width = header.width, height = header.height;
    let i = 0, x, y;
    const imageData = new Uint8Array(width * height * 4);
    for (y = y_start; y !== y_end; y += y_step) {
        for (x = x_start; x !== x_end; x += x_step, i += 2) {
            imageData[(x + width * y) * 4 + 0] = image[i + 0];
            imageData[(x + width * y) * 4 + 1] = image[i + 0];
            imageData[(x + width * y) * 4 + 2] = image[i + 0];
            imageData[(x + width * y) * 4 + 3] = image[i + 1];
        }
    }
    return imageData;
}
/**
 * Based on jsTGALoader - Javascript loader for TGA file
 * By Vincent Thibault
 * @see http://blog.robrowser.com/javascript-tga-loader.html
 */
const TGATools = {
    /**
     * Gets the header of a TGA file
     * @param data defines the TGA data
     * @returns the header
     */
    GetTGAHeader,
    /**
     * Uploads TGA content to a Babylon Texture
     * @internal
     */
    UploadContent,
    /** @internal */
    _getImageData8bits: GetImageData8bits,
    /** @internal */
    _getImageData16bits: GetImageData16bits,
    /** @internal */
    _getImageData24bits: GetImageData24bits,
    /** @internal */
    _getImageData32bits: GetImageData32bits,
    /** @internal */
    _getImageDataGrey8bits: GetImageDataGrey8bits,
    /** @internal */
    _getImageDataGrey16bits: GetImageDataGrey16bits,
};
//# sourceMappingURL=tga.js.map

/***/ })

}]);