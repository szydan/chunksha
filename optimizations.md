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

// optimizations version 4
// use heap to store ABCDE and it got slower 
// 79.008
// use heap for WORDS - this gave a big boost
// measuring things in node does not make any sense 
// as typed arrays are slow in node (node uses buffers)


// optimizations version 5
// removed the DataView when writing the first 16 words to heap
