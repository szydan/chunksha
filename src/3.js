// optimizations version 2
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

// optimizations version 3
// avoid copying data to intermediate buffer
// 63.669  64.839

function Sha1Asm(stdlib, foreign, heap) {
  'use asm';
  var h8 = new stdlib.Int8Array(heap);
  var h32 = new stdlib.Int32Array(heap);
  
  function singleBlockHash() {

  }

  return {
    singleBlockHash: singleBlockHash
  }
};  


function Sha1(debug, maxChunkSize) {
  this.debug = debug;
  this.BLOCK_SIZE = 64;
  this.block = new ArrayBuffer(this.BLOCK_SIZE);
  this.blockView = new DataView(this.block);

  this.lastBlock;
  this.lastBlockView;

  this.totalMsgLengthInBytes = 0;

  // this.H = new ArrayBuffer(20);
  // this.Hview = new DataView(this.H);
  // //initial values
  // this.Hview.setInt32(0, 1732584193);
  // this.Hview.setInt32(4, -271733879);
  // this.Hview.setInt32(8, -1732584194);
  // this.Hview.setInt32(12, 271733878);
  // this.Hview.setInt32(16, -1009589776);
  
  //use heap and TypedArrays instead of DataViews
  //heap used by the asm.js
  //first 20 bytes reserved for hash 
  //next 320 bytes reserved for words
  this.maxChunkSize = maxChunkSize || 64 * 1024; // 64kB 
  this.heap = new ArrayBuffer(this._ceilHeapSize(this.maxChunkSize + 320 + 20));
  this.h8 = new Int8Array(this.heap);
  this.h32 = new Int32Array(this.heap);
  this.h32[0] =  1732584193;
  this.h32[1] = -271733879;
  this.h32[2] = -1732584194;
  this.h32[3] =  271733878;
  this.h32[4] = -1009589776;
  this.core = new Sha1Asm(
    {
      Int32Array: Int32Array,
      Int8Array: Int8Array,
      DataView: DataView
    }, 
    {},
    this.heap
  );
}

Sha1.prototype._ceilHeapSize = function (size) {
  // The asm.js spec says:
  // The heap object's byteLength must be either
  // 2^n for n in [12, 24) or 2^24 * n for n ≥ 1.
  // Also, byteLengths smaller than 2^16 are deprecated.
  var p;
  // If v is smaller than 2^16, the smallest possible solution
  // is 2^16.
  if (size <= 65536)
      return 65536;
  // If v < 2^24, we round up to 2^n,
  // otherwise we round up to 2^24 * n.
  if (size < 16777216) {
      for (p = 1; p < size; p = p << 1);
  } else {
      for (p = 16777216; p < size; p += 16777216);
  }
  return p;
}

Sha1.prototype.processBlock = function () {
  if (this.blockView.byteLength !== this.BLOCK_SIZE) {
    throw new Error('Wrong block size')
  }
  
  // var A = this.Hview.getInt32(0);
  // var B = this.Hview.getInt32(4);
  // var C = this.Hview.getInt32(8);
  // var D = this.Hview.getInt32(12);
  // var E = this.Hview.getInt32(16);

  var A = this.h32[0] | 0;
  var B = this.h32[1] | 0;
  var C = this.h32[2] | 0;
  var D = this.h32[3] | 0;
  var E = this.h32[4] | 0;

  var W = new ArrayBuffer(320);
  var viewW = new DataView(W);
  // copy first 64 bytes
  for (var i = 0; i < 64; i++) {
    viewW.setInt8(i, this.blockView.getInt8(i));
  }


  for (var i = 0; i < 64; i++) {
    console.log(viewW.getInt8(i));
  }
  console.log("================")


  var TEMP;
  var WORD;
  var j;

  // first 16 words
  for (j = 0; (j | 0) < 64; j = j + 4 | 0) {
    WORD = this.blockView.getInt32(j)
    
    console.log(WORD)

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

  // this.Hview.setInt32(0,  (this.Hview.getInt32(0)  + A) | 0);
  // this.Hview.setInt32(4,  (this.Hview.getInt32(4)  + B) | 0);
  // this.Hview.setInt32(8,  (this.Hview.getInt32(8)  + C) | 0);
  // this.Hview.setInt32(12, (this.Hview.getInt32(12) + D) | 0);
  // this.Hview.setInt32(16, (this.Hview.getInt32(16) + E) | 0);

  this.h32[0] = ((this.h32[0] | 0) + A) | 0;
  this.h32[1] = ((this.h32[1] | 0) + B) | 0;
  this.h32[2] = ((this.h32[2] | 0) + C) | 0;
  this.h32[3] = ((this.h32[3] | 0) + D) | 0;
  this.h32[4] = ((this.h32[4] | 0) + E) | 0;
};



// as a  start chunk is ArrayBuffer
Sha1.prototype.update = function (msgChunk) {
  // profile update function - measure the most costly part
  var msgChunkView = new DataView(msgChunk);

  if(this.lastBlock && this.lastBlock.byteLength + msgChunk.byteLength < this.BLOCK_SIZE) {
    // just create new lastBlock which will contain both 
    newLastBlock = new ArrayBuffer(this.lastBlock.byteLength + msgChunk.byteLength);
    newLastBlockView = new DataView(newLastBlock);
    for (var i = 0; i < this.lastBlock.byteLength; i++) {
      newLastBlockView.setInt8(i, this.lastBlockView.getInt8(i));
    }  
    for (var i = this.lastBlock.byteLength; i < this.lastBlock.byteLength + msgChunk.byteLength; i++) {
      newLastBlockView.setInt8(i, msgChunkView.getInt8(i - this.lastBlock.byteLength));
    }
    this.lastBlock = newLastBlock;
    this.lastBlockView = newLastBlockView;
    return;
  } 
  if(this.lastBlock && this.lastBlock.byteLength + msgChunk.byteLength === this.BLOCK_SIZE) {
    // copy the lastBlock and msgChunk into block 
    var i;
    for (i=0; i < this.lastBlock.byteLength; i++) {
      this.blockView.setInt8(i, this.lastBlockView.getInt8(i));
    }
    for (i=this.lastBlock.byteLength; i < this.lastBlock.byteLength + msgChunk.byteLength; i++) {
      this.blockView.setInt8(i, msgChunkView.getInt8(i - this.lastBlock.byteLength));
    }
    // process block
    this.processBlock();
    this.totalMsgLengthInBytes += this.BLOCK_SIZE;
    // set lastBlock = null
    this.lastBlock = null;
    this.lastBlockView = null;
    return;
  } 
  
  var offset = 0;
  if(this.lastBlock && this.lastBlock.byteLength + msgChunk.byteLength > this.BLOCK_SIZE) {
    // first copy the lastBlock into block
    var i = 0;
    for (i=0; i < this.lastBlock.byteLength; i++) {
      this.blockView.setInt8(i, this.lastBlockView.getInt8(i));
    }
    // fill the remaining portion of the block 
    for (i = this.lastBlock.byteLength; i < this.BLOCK_SIZE; i++) {
      this.blockView.setInt8(i, msgChunkView.getInt8(offset));
      offset++;
    }
    this.lastBlock = null;
    this.lastBlockView = null;
    this.processBlock();
    this.totalMsgLengthInBytes += this.BLOCK_SIZE;
  }

  
  // now process the next blocks as long as there is enough bytes in the chunk 
  while (msgChunk.byteLength - offset >= this.BLOCK_SIZE) {
    // load block 
    for (var i=0; i< this.BLOCK_SIZE; i++) {
      this.blockView.setInt8(i, msgChunkView.getInt8(offset + i));
    }
    offset += this.BLOCK_SIZE;
    // process block
    this.processBlock();
    this.totalMsgLengthInBytes += this.BLOCK_SIZE;
  } 

  var lastBlockLength = msgChunk.byteLength - offset;
  if (lastBlockLength > 0) {
    this.lastBlock = new ArrayBuffer(lastBlockLength);
    this.lastBlockView = new DataView(this.lastBlock);
    // here copy to lastBlock
    for (i = 0; i < lastBlockLength; i++) {
      this.lastBlockView.setInt8(i, msgChunkView.getInt8(offset + i));
    }
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
  return this.heap.slice(0, 20);
};

Sha1.prototype.getHex = function () {

  function checkEndian(){
    var a = new ArrayBuffer(4);
    var b = new Uint8Array(a);
    var c = new Uint32Array(a);
    b[0] = 0xa1;
    b[1] = 0xb2;
    b[2] = 0xc3;
    b[3] = 0xd4;
    if(c[0] == 0xd4c3b2a1) return "little endian";
    if(c[0] == 0xa1b2c3d4) return "big endian";
    else throw new Error("Something crazy just happened"); 
  }



  var hex = function (arrayBuffer) {
    // if little-endian flip bytes to big-endian
    if (checkEndian() === "little endian") {
      var view = new DataView(arrayBuffer);
      view.setInt32(0, view.getInt32(0, true));
      view.setInt32(4, view.getInt32(4, true));
      view.setInt32(8, view.getInt32(8, true));
      view.setInt32(12, view.getInt32(12, true));
      view.setInt32(16, view.getInt32(16, true));
    }

    var i, x, hex_tab = '0123456789abcdef', res = [], binarray = new Uint8Array(arrayBuffer);
    for (i = 0; i < binarray.length; i++) {
        x = binarray[i];
        res[i] = hex_tab.charAt(x >> 4 & 15) + hex_tab.charAt(x >> 0 & 15);
    }
    return res.join('');
  };
  if (this.done === true) {
    //return hex(this.H);
    return hex(this.heap.slice(0, 20));
  } else {
    return hex(this.get());
  }
};

/*
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
*/

function read(sha1, file, n, chunkSize, totalParts, startTime, callback) {
  var start = n * chunkSize;
  var end = start + chunkSize;
  if (n === totalParts - 1) {
    end = file.size;
  }

  var reader = new FileReader();
  reader.onload = function(e) {
    sha1.update(e.target.result);
    
    callback({name: 'progress', data: end/file.size*100});

    if (n === totalParts - 1) {
      var stopTime = new Date().getTime();
      console.log('Execution time: ' + ((stopTime - startTime)/1000) );
      console.log(sha1.getHex());
      return;
    }
    read(sha1, file, n+1, chunkSize, totalParts, startTime, callback);
  };

  var blob = file.slice(start, end);
  reader.readAsArrayBuffer(blob);
}


function handleFile (file, callback) {
  var start = new Date().getTime();
  var chunkSize = 1 * 1024 * 1024;
  var sha1 = new Sha1();
  var totalParts = Math.ceil(file.size/chunkSize);
  
  // all this do in a worker
  // as file can be passed 
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm 
  read(sha1, file, 0, chunkSize, totalParts, start, callback);
}


onmessage = function(e){
  handleFile(e.data, function (e) {
    postMessage(e);
  });
}


//=========================================================
if (typeof module !== 'undefined') {
  module.exports = Sha1;
}
