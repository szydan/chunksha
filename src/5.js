(function (window) {

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




function ChunkSha(debug, maxChunkSize) {
  this.endianness = checkEndian();
  this.debug = debug;
  this.BLOCK_SIZE = 64;
  this.block = new ArrayBuffer(this.BLOCK_SIZE);
  this.block8 = new Int8Array(this.block);
  this.block32 = new Int32Array(this.block);
  this.lastBlock;
  this.lastBlock8;
  this.lastBlock32;
  
  this.totalMsgLengthInBytes = 0;

  //use heap and TypedArrays instead of DataViews
  //heap used by the asm.js
  //first 20 bytes reserved for hash 
  //next 320 bytes reserved for words
  this.maxChunkSize = maxChunkSize || 64 * 1024; // 64kB 
  this.heap = new ArrayBuffer(this._ceilHeapSize(20 + 320 + this.maxChunkSize));
  this.h8 = new Int8Array(this.heap);
  this.h32 = new Int32Array(this.heap);
  this.h32[0] =  1732584193;
  this.h32[1] = -271733879;
  this.h32[2] = -1732584194;
  this.h32[3] =  271733878;
  this.h32[4] = -1009589776;
  // this.core = new Sha1Asm(
  //   {
  //     Int32Array: Int32Array,
  //     Int8Array: Int8Array,
  //     DataView: DataView
  //   }, 
  //   {},
  //   this.heap
  // );
}

ChunkSha.prototype._ceilHeapSize = function (size) {
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

ChunkSha.prototype.processBlock = function () {
  if (this.block8.byteLength !== this.BLOCK_SIZE) {
    throw new Error('Wrong block size')
  }

  var A = this.h32[0] | 0;
  var B = this.h32[1] | 0;
  var C = this.h32[2] | 0;
  var D = this.h32[3] | 0;
  var E = this.h32[4] | 0;

  // in future this will not be needed as we will write data directly to heap
  if (this.endianness === 'little endian') {
    for (var i = 20; i < 84; i = i + 4) {
      // flip bytes to big endiane only if little endiane platform
      this.h8[i]   = this.block8[i-17];
      this.h8[i+1] = this.block8[i-18];
      this.h8[i+2] = this.block8[i-19];
      this.h8[i+3] = this.block8[i-20];
    }
  } else {
    for (var i = 20; i < 84; i = i + 1) {
      this.h8[i] = this.block8[i-20];
    }
  }

  var TEMP;
  var WORD;
  var j;

  // first 16 words
  for (j = 0; (j | 0) < 16; j = j + 1 | 0) {
    WORD = this.h32[5 + j] | 0;
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

  for (j = 16; (j | 0) < 20; j = j + 1 | 0) {
    WORD = this.h32[5 + j - 3] ^ this.h32[5 + j - 8] ^ this.h32[5 + j - 14] ^ this.h32[5 + j - 16];
    WORD =  WORD << 1 | WORD >>> 31;
    this.h32[5 + j] = WORD;

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
  
  for (j = 20; (j | 0) < 40; j = j + 1 | 0) {
    WORD = this.h32[5 + j - 3] ^ this.h32[5 + j - 8] ^ this.h32[5 + j - 14] ^ this.h32[5 + j - 16];
    WORD =  WORD << 1 | WORD >>> 31;
    this.h32[5 + j] = WORD;

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
  
  for (j = 40; (j | 0) < 60; j = j + 1 | 0) {
    WORD = this.h32[5 + j - 3] ^ this.h32[5 + j - 8] ^ this.h32[5 + j - 14] ^ this.h32[5 + j - 16];
    WORD =  WORD << 1 | WORD >>> 31;
    this.h32[5 + j] = WORD;

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
  
  for (j = 60; (j | 0) < 80; j = j + 1 | 0) {
    WORD = this.h32[5 + j - 3] ^ this.h32[5 + j - 8] ^ this.h32[5 + j - 14] ^ this.h32[5 + j - 16];
    WORD =  WORD << 1 | WORD >>> 31;
    this.h32[5 + j] = WORD;

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

  this.h32[0] = ((this.h32[0] | 0) + A) | 0;
  this.h32[1] = ((this.h32[1] | 0) + B) | 0;
  this.h32[2] = ((this.h32[2] | 0) + C) | 0;
  this.h32[3] = ((this.h32[3] | 0) + D) | 0;
  this.h32[4] = ((this.h32[4] | 0) + E) | 0;
};



// as a  start chunk is ArrayBuffer
ChunkSha.prototype.update = function (msgChunk) {
  var msgChunk8 = new Int8Array(msgChunk);

  if(this.lastBlock && this.lastBlock.byteLength + msgChunk.byteLength < this.BLOCK_SIZE) {
    // just create new lastBlock which will contain both 
    newLastBlock = new ArrayBuffer(this.lastBlock.byteLength + msgChunk.byteLength);
    newLastBlock8 = new Int8Array(newLastBlock);
    newLastBlock8.set(this.lastBlock8);
    newLastBlock8.set(msgChunk8, this.lastBlock.byteLength);
    this.lastBlock = newLastBlock;
    this.lastBlock8 = newLastBlock8;
    return;
  } 
  if(this.lastBlock && this.lastBlock.byteLength + msgChunk.byteLength === this.BLOCK_SIZE) {
    // copy the lastBlock and msgChunk into block 
    this.block8.set(this.lastBlock8);
    this.block8.set(msgChunk8, this.lastBlock.byteLength)
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
    this.block8.set(this.lastBlock8);
    // fill the remaining portion of the block 
    for (var i = this.lastBlock.byteLength; i < this.BLOCK_SIZE; i++) {
      this.block8[i] = msgChunk8[offset];
      offset++;
    }
    this.processBlock();
    this.totalMsgLengthInBytes += this.BLOCK_SIZE;
    this.lastBlock = null;
    this.lastBlockView = null;
  }

  
  // now process the next blocks as long as there is enough bytes in the chunk 
  while (msgChunk.byteLength - offset >= this.BLOCK_SIZE) {
    // load block 
    for (var i=0; i< this.BLOCK_SIZE; i++) {
      this.block8[i] = msgChunk8[offset + i];
    }
    offset += this.BLOCK_SIZE;
    // process block
    this.processBlock();
    this.totalMsgLengthInBytes += this.BLOCK_SIZE;
  } 

  var lastBlockLength = msgChunk.byteLength - offset;
  if (lastBlockLength > 0) {
    this.lastBlock = new ArrayBuffer(lastBlockLength);
    this.lastBlock8 = new Int8Array(this.lastBlock);
    // here copy to lastBlock
    for (i = 0; i < lastBlockLength; i++) {
      this.lastBlock8[i] = msgChunk8[offset + i];
    }
  }
};


ChunkSha.prototype._writeTotalMessageSize = function () {
    var totalMsgLengthInBits = this.totalMsgLengthInBytes * 8;
    var hex = totalMsgLengthInBits.toString(16);
    // pad the hex string so it is 16 characters long
    while(hex.length < 16) {
      hex = '0'+ hex;
    }

    this.block8[56] = parseInt(hex.substring(0, 2), 16);
    this.block8[57] = parseInt(hex.substring(2, 4), 16);
    this.block8[58] = parseInt(hex.substring(4, 6), 16);
    this.block8[59] = parseInt(hex.substring(6, 8), 16);

    this.block8[60] = parseInt(hex.substring(8, 10), 16);
    this.block8[61] = parseInt(hex.substring(10,12), 16);
    this.block8[62] = parseInt(hex.substring(12,14), 16);
    this.block8[63] = parseInt(hex.substring(14), 16);
}

ChunkSha.prototype.get = function () {
  // examine last block
  if (!this.lastBlock) {
    // create 1 last padded block
    this.block = new ArrayBuffer(this.BLOCK_SIZE);
    this.block8 = new Int8Array(this.block);
    this.block32 = new Int32Array(this.block);
    // add 1
    this.block8[0] = -128;
    // add total msg size
    this._writeTotalMessageSize();
    this.processBlock();
  } else {
    // there is a lastBlock
    // add 1
    this.block = new ArrayBuffer(this.BLOCK_SIZE);
    this.block8 = new Int8Array(this.block);
    this.block32 = new Int32Array(this.block);
    
    this.totalMsgLengthInBytes += this.lastBlock.byteLength;
    this.block8.set(this.lastBlock8);
    this.block8[this.lastBlock.byteLength] = -128;

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
      this.block8 = new Int8Array(this.block);
      this.block32 = new Int32Array(this.block);
      this._writeTotalMessageSize();
      this.processBlock();
      }
  }

  this.done = true;
  return this.heap.slice(0, 20);
};

ChunkSha.prototype.getHex = function () {
  var self = this;

  var hex = function (arrayBuffer) {
    // if little-endian flip bytes to big-endian
    if (self.endianness === "little endian") {
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
    return hex(this.heap.slice(0, 20));
  } else {
    return hex(this.get());
  }
};


function read(chunkSha, file, n, chunkSize, totalParts, startTime, callback) {
  var start = n * chunkSize;
  var end = start + chunkSize;
  if (n === totalParts - 1) {
    end = file.size;
  }
  var blob = file.slice(start, end);

  var reader
  // here for firefox !!! make sure that it is used only for firefox !!!
  if (typeof FileReaderSync !== 'undefined') {
    reader = new FileReaderSync();
    chunkSha.update(reader.readAsArrayBuffer(blob));
    callback({name: 'progress', data: end/file.size*100});
    if (n === totalParts - 1) {
      var stopTime = new Date().getTime();
      callback({name: 'hash', data: chunkSha.getHex()});
      callback({name: 'totalTime', data: ((stopTime - startTime)/1000)});
      return;
    }
    read(chunkSha, file, n+1, chunkSize, totalParts, startTime, callback);
  } else {
    reader = new FileReader();
    reader.onload = function(e) {
      chunkSha.update(e.target.result);
      callback({name: 'progress', data: end/file.size*100});
      if (n === totalParts - 1) {
        var stopTime = new Date().getTime();
        callback({name: 'hash', data: chunkSha.getHex()});
        callback({name: 'totalTime', data: ((stopTime - startTime)/1000)});
        return;
      }
      read(chunkSha, file, n+1, chunkSize, totalParts, startTime, callback);
    };
    reader.readAsArrayBuffer(blob);
  }
}


function handleFile (file, callback) {
  var start = new Date().getTime();
  var chunkSize = 1 * 1024 * 1024;
  var chunkSha = new ChunkSha();
  var totalParts = Math.ceil(file.size/chunkSize);
  read(chunkSha, file, 0, chunkSize, totalParts, start, callback);
}

this.onmessage = function onMessage(e) {
  handleFile(e.data, function (e) {
    postMessage(e);
  });
}


//=========================================================
if (typeof module !== 'undefined') {
  module.exports = ChunkSha;
} else if(window !== undefined) {
  window.ChunkSha = ChunkSha;
}

// here we have to check as for the worker window is not available
})(typeof window !== 'undefined' ? window : undefined);

