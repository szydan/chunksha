var expect = require('expect.js')
var ChunkSha = require('../src/4.js');
var chunkSha = new ChunkSha();

describe('ChunkSha computation', function () {

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

    var chunkSha = new ChunkSha();
    chunkSha.update(buffer1);
    expect(chunkSha.get()).to.eql(expectedBuffer)
    expect(chunkSha.getHex()).to.equal(expectedAbcHex)
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

    var expectedAbcHex = '7436c2889938b563dabe64f7599702935d4d67a1'

    var chunkSha = new ChunkSha();
    chunkSha.update(buffer1);
    expect(chunkSha.getHex()).to.equal(expectedAbcHex)
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

    var expectedAbcHex = '025884cbafa3b98ac12ef2f521ada49bd1e87784'

    var chunkSha = new ChunkSha();
    chunkSha.update(buffer1);
    expect(chunkSha.getHex()).to.equal(expectedAbcHex)
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


    var expectedAbcHex = '34769c5492b0c2aff5f4f8522d2edfbae8b037e0'

    var chunkSha = new ChunkSha();
    chunkSha.update(buffer1);
    chunkSha.update(buffer2);
    expect(chunkSha.getHex()).to.equal(expectedAbcHex)
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


    var chunkSha = new ChunkSha();
    chunkSha.update(buffer1);
    chunkSha.update(buffer2);
    chunkSha.update(buffer3);
    expect(chunkSha.getHex()).to.equal('67a0d3923b7c73d0547fc2b7ca0050207f32a855')
  });  


  it('arrayBuffer with string  >  55 bytes (64 - 1 - 8 = 55) bytes - loop to benchmark', function () {
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
      var chunkSha = new ChunkSha();
      chunkSha.update(buffer1);
      expect(chunkSha.getHex()).to.equal(expectedAbcHex)
    }
    var stopTime = new Date().getTime();
    console.log("Took: " + (stopTime - startTime))
  });


});
