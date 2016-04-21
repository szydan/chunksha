// optimizations
// 74.2 s
// remove debug statements from processBlock
// rotate 30 bits
// 65.2 s
// split into 4 loops
// _getK
// 67.4
// rotate 5 bits
// split into 5 loops
// 66.3
// _getF
// 63.9
// _getW
// 63.9
// avoid j*4 while looping
// 63.1

var getDataType = function (data) {
    if (typeof data === 'string') {
        return 'string';
    }
    if (data instanceof Array) {
        return 'array';
    }
    if (typeof global !== 'undefined' && global.Buffer && global.Buffer.isBuffer(data)) {
        return 'buffer';
    }
    if (data instanceof ArrayBuffer) {
        return 'arraybuffer';
    }
    if (data.buffer instanceof ArrayBuffer) {
        return 'view';
    }
    if (data instanceof Blob) {
        return 'blob';
    }
    throw new Error('Unsupported data type.');
}


function Sha1(debug) {
  this.debug = debug;
  this.BLOCK_SIZE = 64;
  this.block = new ArrayBuffer(this.BLOCK_SIZE);
  this.blockView = new DataView(this.block);

  this.lastBlock;
  this.lastBlockView;

  this.totalMsgLengthInBytes = 0;

  this.H = new ArrayBuffer(20);
  this.Hview = new DataView(this.H);
  // initial values
  this.Hview.setInt32(0, 1732584193);
  this.Hview.setInt32(4, -271733879);
  this.Hview.setInt32(8, -1732584194);
  this.Hview.setInt32(12, 271733878);
  this.Hview.setInt32(16, -1009589776);
}

Sha1.prototype.processBlock = function () {
  if (this.blockView.byteLength !== this.BLOCK_SIZE) {
    throw new Error('Wrong block size')
  }

  var A = this.Hview.getInt32(0);
  var B = this.Hview.getInt32(4);
  var C = this.Hview.getInt32(8);
  var D = this.Hview.getInt32(12);
  var E = this.Hview.getInt32(16);

  var W = new ArrayBuffer(320);
  var viewW = new DataView(W);
  // copy first 64 bytes
  for (var i = 0; i < 64; i++) {
    viewW.setInt8(i, this.blockView.getInt8(i));
  }

  var TEMP;
  var WORD;
  var j;

  // first 16 words
  for (j = 0; (j | 0) < 64; j = j + 4 | 0) {
    WORD = this.blockView.getInt32(j)
    viewW.setInt32(j, WORD);
    TEMP = ((A << 5 | A >>> 27) + ((B & C | ~B & D) | 0 )) | 0;
    TEMP = (TEMP + E) | 0;
    TEMP = (TEMP + WORD) | 0;
    TEMP = (TEMP + 1518500249) | 0;
    E = D;
    D = C;
    C = B << 30 | B >>> 2;
    B = A;
    A = TEMP;
  }

  for (j = 64; (j | 0) < 80; j = j + 4 | 0) {
    WORD = viewW.getInt32( j - 12 ) ^ viewW.getInt32( j - 32 ) ^ viewW.getInt32( j - 56  ) ^ viewW.getInt32( j - 64 );
    WORD =  WORD << 1 | WORD >>> 31;
    viewW.setInt32(j, WORD);

    TEMP = ((A << 5 | A >>> 27) + ((B & C | ~B & D) | 0 )) | 0;
    TEMP = (TEMP + E) | 0;
    TEMP = (TEMP + WORD) | 0;
    TEMP = (TEMP + 1518500249) | 0;
    E = D;
    D = C;
    C = B << 30 | B >>> 2;
    B = A;
    A = TEMP;
  }
  for (j = 80; (j | 0) < 160; j = j + 4 | 0) {
    WORD = viewW.getInt32( j - 12 ) ^ viewW.getInt32( j - 32 ) ^ viewW.getInt32( j - 56  ) ^ viewW.getInt32( j - 64 );
    WORD =  WORD << 1 | WORD >>> 31;
    viewW.setInt32(j, WORD);

    TEMP = ((A << 5 | A >>> 27) + ((B ^ C ^ D) | 0)) | 0;
    TEMP = (TEMP + E) | 0;
    TEMP = (TEMP + WORD) | 0;
    TEMP = (TEMP + 1859775393) | 0;
    E = D;
    D = C;
    C = B << 30 | B >>> 2;
    B = A;
    A = TEMP;
  }
  for (j = 160; (j | 0) < 240; j = j + 4 | 0) {
    WORD = viewW.getInt32( j - 12 ) ^ viewW.getInt32( j - 32 ) ^ viewW.getInt32( j - 56  ) ^ viewW.getInt32( j - 64 );
    WORD =  WORD << 1 | WORD >>> 31;
    viewW.setInt32(j, WORD);

    TEMP = ((A << 5 | A >>> 27) + ((B & C | B & D | C & D) | 0)) | 0;
    TEMP = (TEMP + E) | 0;
    TEMP = (TEMP + WORD) | 0;
    TEMP = (TEMP - 1894007588) | 0;
    E = D;
    D = C;
    C = B << 30 | B >>> 2;
    B = A;
    A = TEMP;
  }
  for (j = 240; (j | 0) < 320; j = j + 4 | 0) {
    WORD = viewW.getInt32( j - 12 ) ^ viewW.getInt32( j - 32 ) ^ viewW.getInt32( j - 56  ) ^ viewW.getInt32( j - 64 );
    WORD =  WORD << 1 | WORD >>> 31;
    viewW.setInt32(j, WORD);

    TEMP = ((A << 5 | A >>> 27) + ((B ^ C ^ D) | 0)) | 0;
    TEMP = (TEMP + E) | 0;
    TEMP = (TEMP + WORD) | 0;
    TEMP = (TEMP - 899497514) | 0;
    E = D;
    D = C;
    C = B << 30 | B >>> 2;
    B = A;
    A = TEMP;
  }

  this.Hview.setInt32(0,  (this.Hview.getInt32(0)  + A) | 0);
  this.Hview.setInt32(4,  (this.Hview.getInt32(4)  + B) | 0);
  this.Hview.setInt32(8,  (this.Hview.getInt32(8)  + C) | 0);
  this.Hview.setInt32(12, (this.Hview.getInt32(12) + D) | 0);
  this.Hview.setInt32(16, (this.Hview.getInt32(16) + E) | 0);
};


// circular left shift
// X 32 bit integer
// n number of positions to shift 0 <= n <= 32
Sha1.prototype._S = function (X, n) {
  return (X << n | X >>> 32 - n) | 0;
}

Sha1.prototype._getK = function(j) {
  if (j >=0 && j <= 19) {
    return parseInt('5A827999', 16) | 0;
  } else if (j >=20 && j <= 39) {
    return parseInt('6ED9EBA1', 16) | 0;
  } else if (j >=40 && j <= 59) {
    return parseInt('8F1BBCDC', 16) | 0;
  } else if (j >=60 && j <= 79) {
    return parseInt('CA62C1D6', 16) | 0;
  } else {
    throw new Error('Wrong j value: ' + j)
  }
}

Sha1.prototype._getF = function(j) {
  if (j >=0 && j <= 19) {
    return function (B, C, D) {
      return (B & C | ~B & D) | 0;
    };
  } else if (j >=20 && j <= 39) {
    return function (B, C, D) {
      return (B ^ C ^ D) | 0;
    };
  } else if (j >=40 && j <= 59) {
    return function (B, C, D) {
      return (B & C | B & D | C & D) | 0;
    };
  } else if (j >=60 && j <= 79) {
    return function (B, C, D) {
      return (B ^ C ^ D) | 0;
    };
  } else {
    throw new Error('Wrong j value: ' + j)
  }
};


Sha1.prototype._getW = function(blockView, j) {
  if (j < 16) {
    return blockView.getInt32(j * 4);
  } else if (j > 15 && j < 80) {
    // XOR ^
    var i1 = (j-3)*4 | 0;
    var i2 = (j-8)*4 | 0;
    var i3 = (j-14)*4| 0;
    var i4 = (j-16)*4| 0;

    var W =
      blockView.getInt32( i1 ) ^ blockView.getInt32( i2 ) ^ blockView.getInt32( i3  ) ^ blockView.getInt32( i4 );
    return this._S(W, 1);
  } else {
    throw new Error('Wrong j value: ' + j);
  }
};


// as a  start chunk is ArrayBuffer
Sha1.prototype.update = function (msgChunk) {
  var chunkDataType = getDataType(msgChunk);
  var chunkLengthInBytes = msgChunk.byteLength || msgChunk.length || msgChunk.size || 0;
  var buffer8;
  switch (chunkDataType) {
    case 'arraybuffer':
      if (this.lastBlock) {
        buffer8 = new Int8Array(this.lastBlock.byteLength + chunkLengthInBytes);
        buffer8.set(this.lastBlock)
        buffer8.set(msgChunk, this.lastBlock.byteLength);
      } else {
        buffer8 = new Int8Array(msgChunk);
      }
      break;
  }


  var offset = 0;
  if (this.debug) {
    console.log("buffer.byteLength: " + buffer8.byteLength)
  }

  while (offset + this.BLOCK_SIZE <= buffer8.byteLength) {
    this.block = buffer8.buffer.slice(offset, offset + this.BLOCK_SIZE);
    this.blockView = new DataView(this.block);
    this.processBlock();
    this.totalMsgLengthInBytes += this.BLOCK_SIZE;
    offset += this.BLOCK_SIZE;
  }
  var lastChunkLength = buffer8.byteLength - offset;
  if (lastChunkLength > 0) {
    if (this.debug) {
      console.log("last chunk length: " + lastChunkLength)
    }
    this.lastBlock = new ArrayBuffer(lastChunkLength);
    this.lastBlockView = new DataView(this.lastBlock);
    // here copy to lastBlock
    for (var i = 0; i < lastChunkLength; i++) {
      this.lastBlockView.setInt8(i, buffer8[offset + i]);
    }
  } else {
    this.lastBlock = null;
    this.lastBlockView = null;
  }
};


Sha1.prototype._writeTotalMessageSize = function () {
    var totalMsgLengthInBits = this.totalMsgLengthInBytes * 8;
    var hex = totalMsgLengthInBits.toString(16);
    // pad the hex string so it is 16 characters long
    while(hex.length < 16) {
      hex = '0'+ hex;
    }

    this.blockView.setInt8(56, parseInt(hex.substring(0, 2), 16));
    this.blockView.setInt8(57, parseInt(hex.substring(2, 4), 16));
    this.blockView.setInt8(58, parseInt(hex.substring(4, 6), 16));
    this.blockView.setInt8(59, parseInt(hex.substring(6, 8), 16));

    this.blockView.setInt8(60, parseInt(hex.substring(8, 10), 16));
    this.blockView.setInt8(61, parseInt(hex.substring(10,12), 16));
    this.blockView.setInt8(62, parseInt(hex.substring(12,14), 16));
    this.blockView.setInt8(63, parseInt(hex.substring(14), 16));
}

Sha1.prototype.get = function () {
  // examine last block
  if (!this.lastBlock) {
    // create 1 last padded block
    this.block = new ArrayBuffer(this.BLOCK_SIZE);
    this.blockView = new DataView(this.block);
    // add 1
    this.blockView.setInt8(0, -128);
    // add total msg size
    this._writeTotalMessageSize();
    this.processBlock();
  } else {
    // there is a lastBlock
    // add 1
    this.block = new ArrayBuffer(this.BLOCK_SIZE);
    this.blockView = new DataView(this.block);

    this.totalMsgLengthInBytes += this.lastBlock.byteLength;
    for (var i = 0; i < this.lastBlock.byteLength; i++){
      this.blockView.setInt8(i, this.lastBlockView.getInt8(i));
    }
    this.blockView.setInt8(this.lastBlock.byteLength, -128);

    if (this.lastBlock.byteLength <= this.BLOCK_SIZE - 8 - 1) {
      // length will fit
      // we do not need to pad as it was initialized with zeros
      this._writeTotalMessageSize();
      this.processBlock();

    } else {
      // length will NOT
      // fit we have to pad 0 till the end and create one more block
      // we do not need to pad as it was initialized with zeros
      this.processBlock();
      // create 1 extra block
      this.block = new ArrayBuffer(this.BLOCK_SIZE);
      this.blockView = new DataView(this.block);
      this._writeTotalMessageSize();
      this.processBlock();
    }
  }

  this.done = true;
  return this.H;
};

Sha1.prototype.getHex = function () {
  var hex = function (arrayBuffer) {
      var i, x, hex_tab = '0123456789abcdef', res = [], binarray = new Uint8Array(arrayBuffer);
      for (i = 0; i < binarray.length; i++) {
          x = binarray[i];
          res[i] = hex_tab.charAt(x >> 4 & 15) + hex_tab.charAt(x >> 0 & 15);
      }
      return res.join('');
  };
  if (this.done === true) {
    return hex(this.H);
  } else {
    return hex(this.get());
  }
};

//=========================================================
if (typeof module !== 'undefined') {
  module.exports = Sha1;
}
