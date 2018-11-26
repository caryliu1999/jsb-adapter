// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  

const gfx = window.gfx;

export default class InputAssembler {
  constructor(vb, ib, pt = gfx.PT_TRIANGLES) {
    this._vertexBuffer = vb;
    this._indexBuffer = ib;
    this._primitiveType = pt;
    this._start = 0;
    this._count = -1;

    // TODO: instancing data
    // this._stream = 0;
  }

  getPrimitiveCount () {
    if (this._count !== -1) {
      return this._count;
    }

    if (this._indexBuffer) {
      return this._indexBuffer.count;
    }

    return this._vertexBuffer.count;
  }
}