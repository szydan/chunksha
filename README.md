chunksha
========
Library to compute hash of a file in the browser 

## Why

There is a crypto api in the browser why not use it ?
Few things:
 
 * digest methods of crypto api accepts only single argument 
which is a byteArray to compute hash from so there is no update method to compute hash in chunks 
 * no progress report callback
 * no way to compute a hash of very large files 
 
 
## Goal

This is just a toy project to implement sha1 and fulfill the above

## Tests

To run tests for each version run 

```
npm install mocha
mocha test/index2.js 
```

## Benchamarks

Currently the implementation is very slow - do not use it ;-)
But the goal is to make it as fast as rusha.js 

Benchmark using files sample files.
All file tests done in the browser
The 100k iteration test done in nodejs
All times in seconds

#### verion 1
In the browser 28 times slower than rusha.js

 
file        |   size   | rusha.js | 1.js     | sha1
------------|----------|----------|----------|-----------------------  
medium.mp4  |   2.5 MB |  0.08 s  |   1.19 s | dce6ae98c6a7187b3e08b389edbeff47e9d2e8a3    
medium.zip  |  24.3 MB |  0.4 s   |  11.16 s | b1ec91671e35882cd684db2b3b4c598db55a2544    
good-big.zip| 492.1 MB |  8.22 s  | 237.6 s  | 77d201055db8403e4079715bfccd8b442814cb34    
wrong.zip   | 840.7 MB | 14.6 s   | 400.1 s  | f7aa6d9265c8ec5f52b07f69f98c2740c91c4ce1    
100k iter   | 55 bytes |          |  74.2 s  |


#### version 2

In the browser 19 times slower than rusha.js

file        |   size   | rusha.js | 1.js     | sha1
------------|----------|----------|----------|-----------------------  
medium.mp4  |   2.5 MB |  0.08 s  |   0.79 s | dce6ae98c6a7187b3e08b389edbeff47e9d2e8a3    
medium.zip  |  24.3 MB |  0.4 s   |   7.75 s | b1ec91671e35882cd684db2b3b4c598db55a2544    
good-big.zip| 492.1 MB |  8.22 s  | 156.4 s  | 77d201055db8403e4079715bfccd8b442814cb34    
wrong.zip   | 840.7 MB | 14.6 s   | 275.0 s  | f7aa6d9265c8ec5f52b07f69f98c2740c91c4ce1    
100k iter   | 55 bytes |          |  65.4 s  |

#### version 4

In the browser 1.5 times slower than rusha.js

file        |   size   | rusha.js | 1.js     | sha1
------------|----------|----------|----------|-----------------------  
medium.mp4  |   2.5 MB |  0.08 s  |   0.094 s| dce6ae98c6a7187b3e08b389edbeff47e9d2e8a3    
medium.zip  |  24.3 MB |  0.4 s   |   0.62 s | b1ec91671e35882cd684db2b3b4c598db55a2544    
good-big.zip| 492.1 MB |  8.22 s  |  12.12s  | 77d201055db8403e4079715bfccd8b442814cb34    
wrong.zip   | 840.7 MB | 14.6 s   |  22.14s  | f7aa6d9265c8ec5f52b07f69f98c2740c91c4ce1    
mernis.tar.gz  1.56 GB | 16.643   |  40.0 s  | 9aced1b7344c25b8c56fd330f66c19ae8cb9133a 
100k iter   | 55 bytes |          |  65.4 s  |


