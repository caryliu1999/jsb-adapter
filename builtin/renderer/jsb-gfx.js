/****************************************************************************
 Copyright (c) 2018 Xiamen Yaji Software Co., Ltd.

  http://www.cocos.com
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/ 
 
import { enums, glTextureFmt } from "./enums";
import VertexFormat from "./jsb-vertex-format";
const gfx = window.gfx;

var _tmpGetSetDesc = {
    get: undefined,
    set: undefined,
    enumerable: true,
    configurable: true
};

gfx.Device.prototype.setBlendColor32 = gfx.Device.prototype.setBlendColor;
gfx.Device._getInstance = gfx.Device.getInstance;
gfx.Device.getInstance = function () {
    var device = gfx.Device._getInstance();
    device._gl = window.__gl;
    return device;
}

//FIXME:
// window.device._stats = { vb: 0 };
// window.device._caps = {
//     maxVextexTextures: 16,
//     maxFragUniforms: 1024,
//     maxTextureUints: 8,
//     maxVertexAttributes: 16,
//     maxDrawBuffers: 8,
//     maxColorAttatchments: 8
// };

var _p = gfx.Program.prototype;
_p._ctor = function(device, options) {
    if (device) {
        this.init(device, options.vert, options.frag);
    }
};

_p = gfx.VertexBuffer.prototype;
_p._ctor = function(device, format, usage, data, numVertices) {
    if (device && format) {
        this.init(device, format._nativeObj, usage, data, numVertices);
    }
    this._nativePtr = this.self();
};
_tmpGetSetDesc.get = _p.getCount;
_tmpGetSetDesc.set = undefined;
Object.defineProperty(_p, "count", _tmpGetSetDesc);

_p = gfx.IndexBuffer.prototype;
_p._ctor = function(device, format, usage, data, numIndices) {
    if (device) {
        this.init(device, format, usage, data, numIndices);
    }
    this._nativePtr = this.self();
};
_tmpGetSetDesc.get = _p.getCount;
_tmpGetSetDesc.set = undefined;
Object.defineProperty(_p, "count", _tmpGetSetDesc);

gfx.VertexFormat = VertexFormat;
Object.assign(gfx, enums);

function convertImages(images) {
    if (images) {
        for (let i = 0, len = images.length; i < len; ++i) {
            let image = images[i];
            if (image !== null) {
                if (image instanceof window.HTMLCanvasElement) {
                    if (image._data) {
                        images[i] = image._data._data;
                    }
                    else {
                        images[i] = null;
                    }
                }
                else if (image instanceof window.HTMLImageElement) {
                    images[i] = image._data;
                }
            }
        }
    }
}

function convertOptions(options) {
    let gl = window.__gl;
    if (options.images && options.images[0] instanceof HTMLImageElement) {
        var image = options.images[0];
        options.glInternalFormat = image._glInternalFormat;
        options.glFormat = image._glFormat;
        options.glType = image._glType;
        options.bpp = image._bpp;
        options.compressed = image._compressed;
    }
    else if (options.images && options.images[0] instanceof HTMLCanvasElement) {
        options.glInternalFormat = gl.RGBA;
        options.glFormat = gl.RGBA;
        options.glType = gl.UNSIGNED_BYTE;
        options.bpp = 32;
        options.compressed = false;
    }
    else {
        var gltf = glTextureFmt(options.format);
        options.glInternalFormat = gltf.internalFormat;
        options.glFormat = gltf.format;
        options.glType = gltf.pixelType;
        options.bpp = gltf.bpp;
        options.compressed = options.glFormat >= enums.TEXTURE_FMT_RGB_DXT1 &&
                             options.glFormat <= enums.TEXTURE_FMT_RGBA_PVRTC_4BPPV1;
    }

    convertImages(options.images);
}

_p = gfx.Texture2D.prototype;
_p._ctor = function(device, options) {
    if (device) {
        convertOptions(options);
        this.init(device, options);
    }
};
_p.destroy = function() { 
};
_p.update = function(options) {
    convertOptions(options);
    this.updateNative(options);
};
_p.updateSubImage = function(option) {
    var images = [option.image];
    convertImages(images);
    var data = new Uint32Array(8 + 
                               (images[0].length + 3) / 4);

    data[0] = option.x;
    data[1] = option.y;
    data[2] = option.width;
    data[3] = option.height;
    data[4] = option.level;
    data[5] = option.flipY;
    data[6] = false;
    data[7] = images[0].length;
    var imageData = new Uint8Array(data.buffer);
    imageData.set(images[0], 32);

    this.updateSubImageNative(data);
};
_tmpGetSetDesc.get = _p.getWidth;
_tmpGetSetDesc.set = undefined;
Object.defineProperty(_p, "_width", _tmpGetSetDesc);
_tmpGetSetDesc.get = _p.getHeight;
Object.defineProperty(_p, "_height", _tmpGetSetDesc);

_p = gfx.FrameBuffer.prototype;
_p._ctor = function(device, width, height, options) {
    if (device) {
        this.init(device, width, height, options);
    }
};

var TextHAlignment = {
    LEFT : 0,
    CENTER : 1,
    RIGHT : 2
};

var TextVAlignment = {
    TOP : 0,
    CENTER : 1,
    BOTTOM : 2
};

var DeviceTextAlign = {
    CENTER        : 0x33, /** Horizontal center and vertical center. */
    TOP           : 0x13, /** Horizontal center and vertical top. */
    TOP_RIGHT     : 0x12, /** Horizontal right and vertical top. */
    RIGHT         : 0x32, /** Horizontal right and vertical center. */
    BOTTOM_RIGHT  : 0x22, /** Horizontal right and vertical bottom. */
    BOTTOM        : 0x23, /** Horizontal center and vertical bottom. */
    BOTTOM_LEFT   : 0x21, /** Horizontal left and vertical bottom. */
    LEFT          : 0x31, /** Horizontal left and vertical center. */
    TOP_LEFT      : 0x11 /** Horizontal left and vertical top. */
}

gfx.RB_FMT_D16 = 0x81A5; // GL_DEPTH_COMPONENT16 hack for JSB

export default gfx;