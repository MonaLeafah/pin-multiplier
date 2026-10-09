(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.PinPacket=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const encoder=new TextEncoder();
  const crcTable=Uint32Array.from({length:256},(_,n)=>{
    for(let k=0;k<8;k++) n=(n&1)?0xedb88320^(n>>>1):n>>>1;
    return n>>>0;
  });
  function crc32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=crcTable[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
  // ZIP STORE: no third-party code, compression, timestamps, or network calls.
  function zip(files){
    if(!files.length||files.length>65535)throw new Error('Invalid packet size.');
    const parts=[],central=[];let offset=0,centralSize=0;
    const names=new Set();
    for(const file of files){
      if(!/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(file.name)||file.name.split('/').includes('..')||names.has(file.name))throw new Error('Invalid or duplicate file name.');
      names.add(file.name);
      const name=encoder.encode(file.name),data=typeof file.content==='string'?encoder.encode(file.content):file.content;
      if(!(data instanceof Uint8Array)||name.length>65535||data.length>0xffffffff)throw new Error('Invalid packet entry.');
      const crc=crc32(data),head=new Uint8Array(30),h=new DataView(head.buffer);
      h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint16(12,0x21,true);
      h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);
      parts.push(head,name,data);
      const center=new Uint8Array(46),c=new DataView(center.buffer);
      c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x800,true);c.setUint16(14,0x21,true);
      c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,name.length,true);c.setUint32(42,offset,true);
      central.push(center,name);centralSize+=46+name.length;offset+=30+name.length+data.length;
    }
    if(offset+centralSize>0xffffffff)throw new Error('Packet is too large.');
    const end=new Uint8Array(22),e=new DataView(end.buffer);
    e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,centralSize,true);e.setUint32(16,offset,true);
    const result=new Uint8Array(offset+centralSize+22);let cursor=0;
    for(const part of [...parts,...central,end]){result.set(part,cursor);cursor+=part.length;}
    return result;
  }
  return {zip,crc32};
});
