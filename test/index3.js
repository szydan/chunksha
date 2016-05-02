var expect = require('expect.js')
var Sha1 = require('../src/3.js');
var sha1 = new Sha1();

describe('test', function () {

  xit('Int32', function () {

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

    console.log(checkEndian());

    var b = new ArrayBuffer(4);
    var view  = new DataView(b);
    var view32   = new Int32Array(b);

    // 01100111 01000101 00100011 00000001  big-endian
    var i = 1732584193;
    view.setInt32(0, i); // big-endian

    expect(view.getInt32(0), i); // big-endian
    
    expect(view.getInt32(0, true), i); // little-endian
    expect(view32[0], i);  
  });
});


/*

describe('circular shift left', function () {
  it('by 2', function () {
    var i32        = parseInt('00000000000000000000000011001100', 2) | 0;
    var expected32 = parseInt('00000000000000000000001100110000', 2) | 0;
    expect(sha1._S(i32, 2)).to.equal(expected32);
  });
  it('by 4', function () {
    var i32        = parseInt('00000000000000000000000000001111', 2) | 0;
    var expected32 = parseInt('00000000000000000000000011110000', 2) | 0;
    expect(sha1._S(i32, 4)).to.equal(expected32);
  });
  it('by 10', function () {
    var i32        = parseInt('00000000000000000000000000001111', 2) | 0;
    var expected32 = parseInt('00000000000000000011110000000000', 2) | 0;
    expect(sha1._S(i32, 10)).to.equal(expected32);
  });
});

describe('getting block functions', function () {
  var B = parseInt('00000000000000000000000000001010', 2) | 0;
  var C = parseInt('00000000000000000000000000000101', 2) | 0;
  var D = parseInt('00000000000000000000000000001111', 2) | 0;

  it('_getF stage 1', function () {
    var f = sha1._getF(0);
    // B & C) | ~B & D
    expect(f(B,C,D)).to.equal(parseInt('00000000000000000000000000000101', 2) | 0)
  });
  it('_getF stage 2', function () {
    var f = sha1._getF(20);
    // B ^ C ^ D
    expect(f(B,C,D)).to.equal(parseInt('00000000000000000000000000000000', 2) | 0)
  });
  it('_getF stage 3', function () {
    var f = sha1._getF(40);
    // (B AND C) OR (B AND D) OR (C AND D)
    expect(f(B,C,D)).to.equal(parseInt('00000000000000000000000000001111', 2) | 0)
  });
  it('_getF stage 4', function () {
    var f = sha1._getF(60);
    // B ^ C ^ D
    expect(f(B,C,D)).to.equal(parseInt('00000000000000000000000000000000', 2) | 0)
  });

})

describe('gettings words from block', function () {

  var block = new ArrayBuffer(64); // 64 * 8bit = 512
  var blockView = new DataView(block);
  blockView.setInt32(0 * 4,  parseInt('00000000000000000000000000000000', 2));
  blockView.setInt32(1 * 4,  parseInt('00000000000000000000000000000001', 2));
  blockView.setInt32(2 * 4,  parseInt('00000000000000000000000000000010', 2));
  blockView.setInt32(3 * 4,  parseInt('00000000000000000000000000000011', 2));
  blockView.setInt32(4 * 4,  parseInt('00000000000000000000000000000100', 2));
  blockView.setInt32(5 * 4,  parseInt('00000000000000000000000000000101', 2));

  blockView.setInt32(8 * 4,  parseInt('00000000000000000000000000001000', 2));
  blockView.setInt32(9 * 4,  parseInt('00000000000000000000000000001001', 2));
  blockView.setInt32(10 * 4, parseInt('00000000000000000000000000001010', 2));
  blockView.setInt32(11 * 4, parseInt('00000000000000000000000000001011', 2));

  blockView.setInt32(13 * 4, parseInt('00000000000000000000000000001101', 2));
  blockView.setInt32(14 * 4, parseInt('00000000000000000000000000001110', 2));
  blockView.setInt32(15 * 4, parseInt('00000000000000000000000000001111', 2));


  var data = new ArrayBuffer(320);
  var dataView = new DataView(data);
  for (var j=0; j<16*4; j=j+4) {
    dataView.setInt32(j, blockView.getInt32(j));
  }

  //var W = block32[j-3] ^ block32[j-8] ^ block32[j-14] ^ block32[j-16];
  //return this._S(W, 1);
  it('j = 16', function() {
    // (13 ^ 8 ^ 2 ^ 0) <<< 1
    var actual = sha1._getW(dataView, 16);
    dataView.setInt32(16*4, actual);
    expect(actual).to.equal(parseInt('0000000000000000000000000000001110', 2) | 0);
  });
  it('j = 17', function() {
    // (14 ^ 9 ^ 3 ^ 1) <<< 1
    var actual = sha1._getW(dataView, 17);
    dataView.setInt32(17*4, actual);
    expect(actual).to.equal(parseInt('0000000000000000000000000000001010', 2) | 0);
  });
  it('j = 18', function() {
    // (15 ^ 10 ^ 4 ^ 2) <<< 1
    var actual = sha1._getW(dataView, 18);
    dataView.setInt32(18*4, actual);
    expect(actual).to.equal(parseInt('0000000000000000000000000000000110', 2) | 0);
  });

  it('j = 19', function() {
    // (16 ^ 11 ^ 5 ^ 3) <<< 1
    var actual = sha1._getW(dataView, 19);
    dataView.setInt32(19*4, actual);
    expect(actual).to.equal(parseInt('0000000000000000000000000000000110', 2) | 0);
  });

});

describe('initialization', function () {

  it('constants', function() {
    expect(sha1.Hview.getInt32(0)).to.equal(1732584193);
    expect(sha1.Hview.getInt32(4)).to.equal(-271733879);
    expect(sha1.Hview.getInt32(8)).to.equal(-1732584194);
    expect(sha1.Hview.getInt32(12)).to.equal(271733878);
    expect(sha1.Hview.getInt32(16)).to.equal(-1009589776);
  })
});

*/
describe('sha1 computation', function () {

  it('arrayBuffer with string abc', function () {
    var buffer1 = new ArrayBuffer(3);
    var view1   = new Int8Array(buffer1);
    view1[0] = 97;
    view1[1] = 98;
    view1[2] = 99;

    var expectedAbcHex = 'a9993e364706816aba3e25717850c26c9cd0d89d'
    var expectedBuffer = new ArrayBuffer(20);
    var expectedAbcHashedInt8Array = new Int8Array(expectedBuffer);

    for (i = 0; i<20;i++) {
      expectedAbcHashedInt8Array[i] = parseInt( expectedAbcHex.substring(i*2, (i+1)*2, 16));
    }

    var sha1 = new Sha1();
    sha1.update(buffer1);
    expect(sha1.get()).to.eql(expectedBuffer)
    expect(sha1.getHex()).to.equal(expectedAbcHex)
  });


  xit('arrayBuffer with string of 55 bytes (64 - 1 - 8 = 55) bytes - so it still fits into single block', function () {
    var buffer1 = new ArrayBuffer(55);
    var view1   = new Int8Array(buffer1);
    view1[0] = 97;
    view1[1] = 98;
    view1[2] = 99;
    for (var i=3;i<55;i++) {
      view1[i] = 48; // character 0
    }

    var expectedAbcHex = '7436c2889938b563dabe64f7599702935d4d67a1'

    var sha1 = new Sha1();
    sha1.update(buffer1);
    expect(sha1.getHex()).to.equal(expectedAbcHex)
  });


  xit('arrayBuffer with string  >  55 bytes (64 - 1 - 8 = 55) bytes - so it does NOT fit into single block', function () {
    var buffer1 = new ArrayBuffer(56);
    var view1   = new Int8Array(buffer1);
    view1[0] = 97;
    view1[1] = 98;
    view1[2] = 99;
    for (var i=3;i<56;i++) {
      view1[i] = 48; // character 0
    }

    var expectedAbcHex = '025884cbafa3b98ac12ef2f521ada49bd1e87784'

    var sha1 = new Sha1();
    sha1.update(buffer1);
    expect(sha1.getHex()).to.equal(expectedAbcHex)
  });



  xit('arrayBuffer with string  >  55 bytes (64 - 1 - 8 = 55) bytes - so it does NOT fit into single block added twice', function () {
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


    var expectedAbcHex = '34769c5492b0c2aff5f4f8522d2edfbae8b037e0'

    var sha1 = new Sha1();
    sha1.update(buffer1);
    sha1.update(buffer2);
    expect(sha1.getHex()).to.equal(expectedAbcHex)
  });

  xit('arrayBuffer chunks 64 64 and 3', function () {
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


    var sha1 = new Sha1();
    sha1.update(buffer1);
    sha1.update(buffer2);
    sha1.update(buffer3);
    expect(sha1.getHex()).to.equal('67a0d3923b7c73d0547fc2b7ca0050207f32a855')
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
    var expectedAbcHex = '025884cbafa3b98ac12ef2f521ada49bd1e87784'

    var startTime = new Date().getTime();
    for (var i = 0; i < 100000; i++) {
      var sha1 = new Sha1();
      sha1.update(buffer1);
      expect(sha1.getHex()).to.equal(expectedAbcHex)
    }
    var stopTime = new Date().getTime();
    console.log("Took: " + (stopTime - startTime))
  });


});
