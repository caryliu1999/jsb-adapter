/****************************************************************************
 Copyright (c) 2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and  non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
'use strict';

let RenderFlow = cc.RenderFlow;
const LOCAL_TRANSFORM = RenderFlow.FLAG_LOCAL_TRANSFORM;
const COLOR = RenderFlow.FLAG_COLOR;
const OPACITY = RenderFlow.FLAG_OPACITY;
const UPDATE_RENDER_DATA = RenderFlow.FLAG_UPDATE_RENDER_DATA;
const CUSTOM_IA_RENDER = RenderFlow.FLAG_CUSTOM_IA_RENDER;

const POSITION_ON = 1 << 0;

cc.js.getset(cc.Node.prototype, "_renderFlag", function () {
    return 0;
}, function (flag) {
    if (flag === 0) return;

    let comp = this._renderComponent;
    let assembler = comp && comp._assembler;

    if (((flag & UPDATE_RENDER_DATA) || (flag & CUSTOM_IA_RENDER)) && assembler) {
        if (assembler.delayUpdateRenderData) {
            comp._renderHandle.delayUpdateRenderData();
        }
        else {
            assembler.updateRenderData(comp);
        }
    }
    if (flag & COLOR) {
        // Update uniform
        comp && comp._updateColor();
        if (assembler) {
            // Update vertex
            assembler.updateColor(comp, this._color._val);
        }
    }
});

cc.PrivateNode.prototype._posDirty = function (sendEvent) {
    let parent = this.parent;
    if (parent) {
        // Position correction for transform calculation
        this._trs[1] = this._originPos.x - (parent._anchorPoint.x - 0.5) * parent._contentSize.width;
        this._trs[2] = this._originPos.y - (parent._anchorPoint.y - 0.5) * parent._contentSize.height;
    }

    this.setLocalDirty(cc.Node._LocalDirtyFlag.POSITION);
    if (sendEvent === true && (this._eventMask & POSITION_ON)) {
        this.emit(cc.Node.EventType.POSITION_CHANGED);
    }
}