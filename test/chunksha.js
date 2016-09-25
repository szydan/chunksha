var expect = require('expect.js')
var ChunkSha = require('../src/chunksha.js');
var chunkSha = new ChunkSha();

describe('ChunkSha computation', function () {

  function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
      var charcode = str.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
                    0x80 | (charcode & 0x3f));
      } 
      else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
                    0x80 | ((charcode>>6) & 0x3f),
                    0x80 | (charcode & 0x3f));
      }
      // surrogate pair
      else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                    | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
                    0x80 | ((charcode>>12) & 0x3f),
                    0x80 | ((charcode>>6) & 0x3f),
                    0x80 | (charcode & 0x3f));
      }
    }
    return utf8;
  }

  function textToArrayBuffer(str) {
    var data = toUTF8Array(str);
    var arrayBuffer = new ArrayBuffer(data.length);
    var view   = new Int8Array(arrayBuffer);
    for (var i=0;i<data.length;i++){
      view[i] = data[i];
    } 
    return arrayBuffer;     
  }



  function compareArrayBuffers(expected, actual) {
      var actual8 = new Int8Array(actual);
      var expected8 = new Int8Array(expected);
      expect(actual.byteLength).to.equal(expected.byteLength);
      for (var i = 0; i < actual.byteLength; i++) {
        if (actual8[i] !== expected8[i]) {
          console.log("EXPECTED RAW " + expected8.join(' '))
          console.log("ACTUAL   RAW " + actual8.join(' '));
          expect().fail()
          break;
        }
      }
  }

  function hexStringToArrayBuffer(hexString) {
    var n = hexString.length / 2;
    var arrayBuffer = new ArrayBuffer(n);
    var view = new Int8Array(arrayBuffer);
    for (i = 0; i < n; i++) {
      var s = hexString.substring(i*2, (i+1)*2);
      view[i] = parseInt(s, 16);
    }
    return arrayBuffer;
  }

  it('arrayBuffer with string abc', function () {
    var buffer1 = new ArrayBuffer(3);
    var view1   = new Int8Array(buffer1);
    view1[0] = 97;
    view1[1] = 98;
    view1[2] = 99;

    var expectedHex = 'a9993e364706816aba3e25717850c26c9cd0d89d'
    var expectedRaw = hexStringToArrayBuffer(expectedHex);

    var chunkSha = new ChunkSha();
    chunkSha.update(buffer1);
    
    var actualRaw = chunkSha.get();
    var actualHex = chunkSha.getHex();    
    compareArrayBuffers(expectedRaw, actualRaw)
    expect(actualHex).to.equal(expectedHex)
  });


  it('arrayBuffer with string of 55 bytes (64 - 1 - 8 = 55) bytes - so it still fits into single block', function () {
    var buffer1 = new ArrayBuffer(55);
    var view1   = new Int8Array(buffer1);
    view1[0] = 97;
    view1[1] = 98;
    view1[2] = 99;
    for (var i=3;i<55;i++) {
      view1[i] = 48; // character 0
    }

    var expectedHex = '7436c2889938b563dabe64f7599702935d4d67a1'
    var expectedRaw = hexStringToArrayBuffer(expectedHex);
    
    var chunkSha = new ChunkSha();
    chunkSha.update(buffer1);
    
    var actualRaw = chunkSha.get();
    var actualHex = chunkSha.getHex();    
    compareArrayBuffers(expectedRaw, actualRaw)
    expect(actualHex).to.equal(expectedHex)
  });


  it('arrayBuffer with string  >  55 bytes (64 - 1 - 8 = 55) bytes - so it does NOT fit into single block', function () {
    var buffer1 = new ArrayBuffer(56);
    var view1   = new Int8Array(buffer1);
    view1[0] = 97;
    view1[1] = 98;
    view1[2] = 99;
    for (var i=3;i<56;i++) {
      view1[i] = 48; // character 0
    }

    var expectedHex = '025884cbafa3b98ac12ef2f521ada49bd1e87784'
    var expectedRaw = hexStringToArrayBuffer(expectedHex);

    var chunkSha = new ChunkSha();
    chunkSha.update(buffer1);

    var actualRaw = chunkSha.get();
    var actualHex = chunkSha.getHex();    
    compareArrayBuffers(expectedRaw, actualRaw)
    expect(actualHex).to.equal(expectedHex)
  });



  it('arrayBuffer with string  >  55 bytes (64 - 1 - 8 = 55) bytes - so it does NOT fit into single block added twice', function () {
    var buffer1 = new ArrayBuffer(56);
    var view1   = new Int8Array(buffer1);
    view1[0] = 97;
    view1[1] = 98;
    view1[2] = 99;
    for (var i=3;i<56;i++) {
      view1[i] = 48; // character 0
    }
    var buffer2 = new ArrayBuffer(56);
    var view2   = new Int8Array(buffer2);
    view2[0] = 97;
    view2[1] = 98;
    view2[2] = 99;
    for (var i=3;i<56;i++) {
      view2[i] = 48; // character 0
    }


    var expectedHex = '34769c5492b0c2aff5f4f8522d2edfbae8b037e0'
    var expectedRaw = hexStringToArrayBuffer(expectedHex);

    var chunkSha = new ChunkSha();
    chunkSha.update(buffer1);
    chunkSha.update(buffer2);
    
    var actualRaw = chunkSha.get();
    var actualHex = chunkSha.getHex();    
    compareArrayBuffers(expectedRaw, actualRaw)
    expect(actualHex).to.equal(expectedHex)
  });

  it('arrayBuffer chunks 64 64 and 3', function () {
    var buffer1 = new ArrayBuffer(64);
    var view1   = new Int8Array(buffer1);
    view1[0] = 97;
    view1[1] = 98;
    view1[2] = 99;
    for (var i=3;i<64;i++) {
      view1[i] = 48; // character 0
    }

    var buffer2 = new ArrayBuffer(64);
    var view2   = new Int8Array(buffer2);
    view2[0] = 97;
    view2[1] = 98;
    view2[2] = 99;
    for (var i=3;i<64;i++) {
      view2[i] = 48; // character 0
    }

    var buffer3 = new ArrayBuffer(3);
    var view3   = new Int8Array(buffer3);
    view3[0] = 97;
    view3[1] = 98;
    view3[2] = 99;


    var expectedHex = '67a0d3923b7c73d0547fc2b7ca0050207f32a855'
    var expectedRaw = hexStringToArrayBuffer(expectedHex);


    var chunkSha = new ChunkSha();
    chunkSha.update(buffer1);
    chunkSha.update(buffer2);
    chunkSha.update(buffer3);
    
    var actualRaw = chunkSha.get();
    var actualHex = chunkSha.getHex();    
    compareArrayBuffers(expectedRaw, actualRaw)
    expect(actualHex).to.equal(expectedHex)
  });  


  xit('arrayBuffer with string  >  55 bytes (64 - 1 - 8 = 55) bytes - loop to benchmark', function () {
    this.timeout(0);
    var buffer1 = new ArrayBuffer(56);
    var view1   = new Int8Array(buffer1);
    view1[0] = 97;
    view1[1] = 98;
    view1[2] = 99;
    for (var i=3;i<56;i++) {
      view1[i] = 48; // character 0
    }
    var expectedHex = '025884cbafa3b98ac12ef2f521ada49bd1e87784'
    var expectedRaw = hexStringToArrayBuffer(expectedHex);

    var startTime = new Date().getTime();
    for (var i = 0; i < 100000; i++) {
      var chunkSha = new ChunkSha();
      chunkSha.update(buffer1);
    
      var actualRaw = chunkSha.get();
      var actualHex = chunkSha.getHex();    
      compareArrayBuffers(expectedRaw, actualRaw)
      expect(actualHex).to.equal(expectedHex)
    }
    var stopTime = new Date().getTime();
    console.log("Took: " + (stopTime - startTime))
  });


  it('arrayBuffer with string abcabc', function () {
    var buffer1 = new ArrayBuffer(67);
    var view1   = new Int8Array(buffer1);
    view1[0] = 97;
    view1[1] = 98;
    view1[2] = 99;
    for (var i=3;i<64;i++){
      view1[i] = 0;
    }  
    for (var i=0; i<64;i++) {
      view1[i] = view1[i] ^ 0x36;
    }
    view1[64] = 97;
    view1[65] = 98;
    view1[66] = 99;

    var expectedHex = 'ceca8aa613f7a3a7207a95bf83ba1b4d2573be83'
    var expectedRaw = hexStringToArrayBuffer(expectedHex);

    var chunkSha = new ChunkSha();
    chunkSha.update(buffer1);
    
    var actualRaw = chunkSha.get();
    var actualHex = chunkSha.getHex();    
    compareArrayBuffers(expectedRaw, actualRaw)
    expect(actualHex).to.equal(expectedHex)
  });


  it('arrayBuffer o_pad_key + correct hash(i_pad_key,abc)', function () {
    var buffer1 = new ArrayBuffer(64+20);
    var view1   = new Int8Array(buffer1);
    var x = [61,62,63,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,
    // correct hash inner hash from abc abc 
    -50,-54,-118,-90,19,-9,-93,-89,32,122,-107,-65,-125,-70,27,77,37,115,-66,-125];

    for (var i=0;i<64+20;i++){
      view1[i] = x[i];
    }  

    var expectedHex = '5b333a389b4e9a2358ac5392bf2a64dc68e3c943'
    var expectedRaw = hexStringToArrayBuffer(expectedHex);

    var chunkSha = new ChunkSha();
    chunkSha.update(buffer1);
    
    var actualRaw = chunkSha.get();
    var actualHex = chunkSha.getHex();    

    compareArrayBuffers(expectedRaw, actualRaw)
    expect(actualHex).to.equal(expectedHex)
  });


  it('hmac abc abc', function () {
    var dataArrayBuffer = textToArrayBuffer('abc');
    var keyArrayBuffer = textToArrayBuffer('abc');

    var expectedHex = '5b333a389b4e9a2358ac5392bf2a64dc68e3c943'
    var expectedRaw = hexStringToArrayBuffer(expectedHex);

    var chunkShaHmac = new ChunkSha(keyArrayBuffer);
    chunkShaHmac.update(dataArrayBuffer);

    var actualRaw = chunkShaHmac.get();
    var actualHex = chunkShaHmac.getHex();    
    compareArrayBuffers(expectedRaw, actualRaw)
    expect(actualHex).to.equal(expectedHex)
  });  

  describe('rfc2202 hmac-sha1 test cases', function () {

    it('1 data="Hi There"   key=0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b', function () {
      var keyArrayBuffer = hexStringToArrayBuffer('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b');
      var dataArrayBuffer = textToArrayBuffer('Hi There');
 
      var expectedHex = 'b617318655057264e28bc0b6fb378c8ef146be00';
      var expectedRaw = hexStringToArrayBuffer(expectedHex);
      
      var chunkShaHmac = new ChunkSha(keyArrayBuffer);
      chunkShaHmac.update(dataArrayBuffer);

      var actualRaw = chunkShaHmac.get();
      var actualHex = chunkShaHmac.getHex();    
      compareArrayBuffers(expectedRaw, actualRaw)
      expect(actualHex).to.equal(expectedHex)
    });  

    it('2 data="what do ya want for nothing?" key="Jefe"', function () {
      var dataArrayBuffer = textToArrayBuffer('what do ya want for nothing?');
      var keyArrayBuffer = textToArrayBuffer('Jefe')
 
      var expectedHex = 'effcdf6ae5eb2fa2d27416d5f184df9c259a7c79';
      var expectedRaw = hexStringToArrayBuffer(expectedHex);
      
      var chunkShaHmac = new ChunkSha(keyArrayBuffer);
      chunkShaHmac.update(dataArrayBuffer);

      var actualRaw = chunkShaHmac.get();
      var actualHex = chunkShaHmac.getHex();    
      compareArrayBuffers(expectedRaw, actualRaw)
      expect(actualHex).to.equal(expectedHex)
    });

    it('3 data=0xdd repeated 50 times   key=0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', function () {
      var keyArrayBuffer = hexStringToArrayBuffer('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      var dataHexString = ''
      for (var i = 0; i < 50; i++) {
        dataHexString += 'dd';
      }
      var dataArrayBuffer = hexStringToArrayBuffer(dataHexString);
 
      var expectedHex = '125d7342b9ac11cd91a39af48aa17b4f63f175d3';
      var expectedRaw = hexStringToArrayBuffer(expectedHex);
      
      var chunkShaHmac = new ChunkSha(keyArrayBuffer);
      chunkShaHmac.update(dataArrayBuffer);

      var actualRaw = chunkShaHmac.get();
      var actualHex = chunkShaHmac.getHex();    
      compareArrayBuffers(expectedRaw, actualRaw)
      expect(actualHex).to.equal(expectedHex)
    });  

    it('4 data=0xcd repeated 50 times   key=0x0102030405060708090a0b0c0d0e0f10111213141516171819', function () {
      var keyArrayBuffer = hexStringToArrayBuffer('0102030405060708090a0b0c0d0e0f10111213141516171819');
      var dataHexString = ''
      for (var i = 0; i < 50; i++) {
        dataHexString += 'cd';
      }
      var dataArrayBuffer = hexStringToArrayBuffer(dataHexString);
 
      var expectedHex = '4c9007f4026250c6bc8414f9bf50c86c2d7235da';
      var expectedRaw = hexStringToArrayBuffer(expectedHex);
      
      var chunkShaHmac = new ChunkSha(keyArrayBuffer);
      chunkShaHmac.update(dataArrayBuffer);

      var actualRaw = chunkShaHmac.get();
      var actualHex = chunkShaHmac.getHex();    
      compareArrayBuffers(expectedRaw, actualRaw)
      expect(actualHex).to.equal(expectedHex)
    });  

    it('5 data="Test With Truncation"   key=0x0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c', function () {
      var keyArrayBuffer = hexStringToArrayBuffer('0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c');
      var dataArrayBuffer = textToArrayBuffer('Test With Truncation');
 
      var expectedHex = '4c1a03424b55e07fe7f27be1d58bb9324a9a5a04';
      var expectedRaw = hexStringToArrayBuffer(expectedHex);
      
      var chunkShaHmac = new ChunkSha(keyArrayBuffer);
      chunkShaHmac.update(dataArrayBuffer);

      var actualRaw = chunkShaHmac.get();
      var actualHex = chunkShaHmac.getHex();    
      compareArrayBuffers(expectedRaw, actualRaw)
      expect(actualHex).to.equal(expectedHex)
    });  

    it('6 data="Test Using Larger Than Block-Size Key - Hash Key First" key=0xaa repeated 80 times', function () {
      var keyHexString = ''
      for (var i = 0; i < 80; i++) {
        keyHexString += 'aa';
      }
      var keyArrayBuffer = hexStringToArrayBuffer(keyHexString);
      var buffer1 = textToArrayBuffer('Test Using Larger Than Block-Size Key - Hash Key First');
 
      var expectedHex = 'aa4ae5e15272d00e95705637ce8a3b55ed402112';
      var expectedRaw = hexStringToArrayBuffer(expectedHex);
      
      var chunkShaHmac = new ChunkSha(keyArrayBuffer);
      chunkShaHmac.update(buffer1);

      var actualRaw = chunkShaHmac.get();
      var actualHex = chunkShaHmac.getHex();    
      compareArrayBuffers(expectedRaw, actualRaw)
      expect(actualHex).to.equal(expectedHex)
    });  

    it('7 data="Test Using Larger Than Block-Size Key and Larger Than One Block-Size Data" key=0xaa repeated 80 times', function () {
      var keyHexString = ''
      for (var i = 0; i < 80; i++) {
        keyHexString += 'aa';
      }
      var keyArrayBuffer = hexStringToArrayBuffer(keyHexString);
      var buffer1 = textToArrayBuffer('Test Using Larger Than Block-Size Key and Larger Than One Block-Size Data');
    
      var expectedHex = 'e8e99d0f45237d786d6bbaa7965c7808bbff1a91';
      var expectedRaw = hexStringToArrayBuffer(expectedHex);
      
      var chunkShaHmac = new ChunkSha(keyArrayBuffer);
      chunkShaHmac.update(buffer1);

      var actualRaw = chunkShaHmac.get();
      var actualHex = chunkShaHmac.getHex();    
      compareArrayBuffers(expectedRaw, actualRaw)
      expect(actualHex).to.equal(expectedHex)
    });  
  });


});
