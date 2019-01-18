parcelRequire=function(e,r,n,t){var i="function"==typeof parcelRequire&&parcelRequire,o="function"==typeof require&&require;function u(n,t){if(!r[n]){if(!e[n]){var f="function"==typeof parcelRequire&&parcelRequire;if(!t&&f)return f(n,!0);if(i)return i(n,!0);if(o&&"string"==typeof n)return o(n);var c=new Error("Cannot find module '"+n+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[n][1][r]||r},p.cache={};var l=r[n]=new u.Module(n);e[n][0].call(l.exports,p,l,l.exports,this)}return r[n].exports;function p(e){return u(p.resolve(e))}}u.isParcelRequire=!0,u.Module=function(e){this.id=e,this.bundle=u,this.exports={}},u.modules=e,u.cache=r,u.parent=i,u.register=function(r,n){e[r]=[function(e,r){r.exports=n},{}]};for(var f=0;f<n.length;f++)u(n[f]);if(n.length){var c=u(n[n.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=c:"function"==typeof define&&define.amd?define(function(){return c}):t&&(this[t]=c)}return u}({"OZd1":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.fromHex=a,exports.toHex=o,exports.bytesConcat=i,exports.bs58checkEncode=c,exports.bs58checkDecode=p,exports.bs58checkPrefixPick=l,exports.getContractHexKey=h,exports.encodeRawBytes=f,exports.decodeRawBytes=g,exports.default=exports.watermark=exports.prefix=void 0;var e=require("util"),t=s(require("bn.js")),n=s(require("bs58check")),r=s(require("elliptic"));function s(e){return e&&e.__esModule?e:{default:e}}function a(e){return new Uint8Array(r.default.utils.toArray(e,"hex"))}function o(e){return r.default.utils.toHex(e)}function i(e,t){const n=new Uint8Array(e.length+t.length);return n.set(e,0),n.set(t,e.length),n}function c(e,t){return n.default.encode(i(t,e))}function p(e,t){return n.default.decode(e).slice(t?t.length:l(e).bytes.length)}const _={block_hash:new Uint8Array([1,52]),operation_hash:new Uint8Array([5,116]),operation_list_hash:new Uint8Array([133,233]),operation_list_list_hash:new Uint8Array([29,159,109]),protocol_hash:new Uint8Array([2,170]),context_hash:new Uint8Array([79,199]),ed25519_public_key_hash:new Uint8Array([6,161,159]),secp256k1_public_key_hash:new Uint8Array([6,161,161]),p256_public_key_hash:new Uint8Array([6,161,164]),cryptobox_public_key_hash:new Uint8Array([153,103]),ed25519_seed:new Uint8Array([13,15,58,7]),ed25519_public_key:new Uint8Array([13,15,37,217]),secp256k1_secret_key:new Uint8Array([17,162,224,201]),p256_secret_key:new Uint8Array([16,81,238,189]),ed25519_encrypted_seed:new Uint8Array([7,90,60,179,41]),secp256k1_encrypted_secret_key:new Uint8Array([9,237,241,174,150]),p256_encrypted_secret_key:new Uint8Array([9,48,57,115,171]),secp256k1_public_key:new Uint8Array([3,254,226,86]),p256_public_key:new Uint8Array([3,178,139,127]),secp256k1_scalar:new Uint8Array([38,248,136]),secp256k1_element:new Uint8Array([5,92,0]),ed25519_secret_key:new Uint8Array([43,246,78,7]),ed25519_signature:new Uint8Array([9,245,205,134,18]),secp256k1_signature:new Uint8Array([13,115,101,19,63]),p256_signature:new Uint8Array([54,240,44,52]),generic_signature:new Uint8Array([4,130,43]),chain_id:new Uint8Array([7,82,0]),contract_hash:new Uint8Array([2,90,121])};function l(e){const t={15:{Net:"chain_id"},30:{id:"cryptobox_public_key_hash"},36:{tz1:"ed25519_public_key_hash",tz2:"secp256k1_public_key_hash",tz3:"p256_public_key_hash",KT1:"contract_hash"},51:{B:"block_hash",o:"operation_hash",P:"protocol_hash"},52:{Lo:"operation_list_hash",Co:"context_hash"},53:{LLo:"operation_list_list_hash",SSp:"secp256k1_scalar"},54:{edsk:"ed25519_seed",edpk:"ed25519_public_key",spsk:"secp256k1_secret_key",p2sk:"p256_secret_key",GSp:"secp256k1_element"},55:{sppk:"secp256k1_public_key",p2pk:"p256_public_key"},88:{edesk:"ed25519_encrypted_seed",spesk:"secp256k1_encrypted_secret_key",p2esk:"p256_encrypted_secret_key"},96:{sig:"generic_signature"},98:{edsk:"ed25519_secret_key",p2sig:"p256_signature"},99:{edsig:"ed25519_signature",spsig1:"secp256k1_signature"}}[e.length];if(t)for(const n in t){const r=n.length;if(e.slice(0,r)===n)return{bytes:_[t[n]],name:t[n]}}throw`No prefix found for: ${e}`}function h(e){if(36!==e.length||"KT1"!==e.slice(0,3))throw`invalid contract: ${e}`;const t=o(p(e,_.contract_hash));return[[0,2],[2,4],[4,6],[6,8],[8,10],[10,void 0]].map(e=>t.slice(e[0],e[1])).join("/")}exports.prefix=_;const u={block_header:e=>i(new Uint8Array([1]),e),endorsement:e=>i(new Uint8Array([2]),e),operation:()=>new Uint8Array([3]),custom:e=>e};exports.watermark=u;const y={"00":"parameter","01":"storage","02":"code","03":"False","04":"Elt","05":"Left","06":"None","07":"Pair","08":"Right","09":"Some","0A":"True","0B":"Unit","0C":"PACK","0D":"UNPACK","0E":"BLAKE2B","0F":"SHA256",10:"SHA512",11:"ABS",12:"ADD",13:"AMOUNT",14:"AND",15:"BALANCE",16:"CAR",17:"CDR",18:"CHECK_SIGNATURE",19:"COMPARE","1A":"CONCAT","1B":"CONS","1C":"CREATE_ACCOUNT","1D":"CREATE_CONTRACT","1E":"IMPLICIT_ACCOUNT","1F":"DIP",20:"DROP",21:"DUP",22:"EDIV",23:"EMPTY_MAP",24:"EMPTY_SET",25:"EQ",26:"EXEC",27:"FAILWITH",28:"GE",29:"GET","2A":"GT","2B":"HASH_KEY","2C":"IF","2D":"IF_CONS","2E":"IF_LEFT","2F":"IF_NONE",30:"INT",31:"LAMBDA",32:"LE",33:"LEFT",34:"LOOP",35:"LSL",36:"LSR",37:"LT",38:"MAP",39:"MEM","3A":"MUL","3B":"NEG","3C":"NEQ","3D":"NIL","3E":"NONE","3F":"NOT",40:"NOW",41:"OR",42:"PAIR",43:"PUSH",44:"RIGHT",45:"SIZE",46:"SOME",47:"SOURCE",48:"SENDER",49:"SELF","4A":"STEPS_TO_QUOTA","4B":"SUB","4C":"SWAP","4D":"TRANSFER_TOKENS","4E":"SET_DELEGATE","4F":"UNIT",50:"UPDATE",51:"XOR",52:"ITER",53:"LOOP_LEFT",54:"ADDRESS",55:"CONTRACT",56:"ISNAT",57:"CAST",58:"RENAME",59:"bool","5A":"contract","5B":"int","5C":"key","5D":"key_hash","5E":"lambda","5F":"list",60:"map",61:"big_map",62:"nat",63:"option",64:"or",65:"pair",66:"set",67:"signature",68:"string",69:"bytes","6A":"mutez","6B":"timestamp","6C":"unit","6D":"operation","6E":"address","6F":"SLICE"},d=(()=>{const e={};for(const t in y)e[y[t]]=t;return e})(),A={"00":"int","01":"string","02":"seq","03":{name:"prim",len:0,annots:!1},"04":{name:"prim",len:0,annots:!0},"05":{name:"prim",len:1,annots:!1},"06":{name:"prim",len:1,annots:!0},"07":{name:"prim",len:2,annots:!1},"08":{name:"prim",len:2,annots:!0},"09":{name:"prim",len:3,annots:!0},"0A":"bytes"},k={0:{false:"03",true:"04"},1:{false:"05",true:"06"},2:{false:"07",true:"08"},3:{true:"09"}};function f(n){const r=n=>{const s=[];if(n instanceof Array){s.push("02");const e=n.map(e=>r(e)).join(""),t=e.length/2;s.push(t.toString(16).padStart(8,"0")),s.push(e)}else if(n instanceof Object)if(n.prim){const t=n.args?n.args.length:0;if(s.push(k[t][!!n.annots]),s.push(d[n.prim]),n.args&&n.args.forEach(e=>{s.push(r(e))}),n.annots){const t=n.annots.map(t=>o((new e.TextEncoder).encode(t))).join("20");s.push((t.length/2).toString(16).padStart(8,"0")),s.push(t)}}else if(n.bytes){const e=n.bytes.length/2;s.push("0A"),s.push(e.toString(16).padStart(8,"0")),s.push(n.bytes)}else if(n.int){const e=new t.default(n.int,10),r="-"===e.toString(2)[0]?"1":"0",a=e.toString(2).replace("-",""),o=a.length>6?a.length+7-(a.length-6)%7:6,i=a.padStart(o,"0").match(/\d{6,7}/g).reverse();i[0]=r+i[0];const c=i.map((e,t)=>parseInt((t===i.length-1?"0":"1")+e,2).toString(16).padStart(2,"0")).join("");s.push("00"),s.push(c)}else if(n.string){const t=(new e.TextEncoder).encode(n.string),r=[].slice.call(t).map(e=>e.toString(16).padStart(2,"0")).join(""),a=t.length;s.push("01"),s.push(a.toString(16).padStart(8,"0")),s.push(r)}return s.join("")};return r(n).toUpperCase()}function g(n){n=n.toUpperCase();let r=0;const s=e=>n.slice(r,r+e),a=()=>{const n=s(2),o=A[n];if(o instanceof Object){r+=2;const t=y[s(2)];r+=2;const n={prim:t,args:Array.apply(null,new Array(o.len)).map(()=>a()),annots:void 0};if(o.len||delete n.args,o.annots){const t=2*parseInt(s(8),16);r+=8;const a=s(t).match(/[\dA-F]{2}/g);if(r+=t,a){const t=new Uint8Array(a.map(e=>parseInt(e,16))),r=new e.TextDecoder("utf-8").decode(t);n.annots=r.split(" ")}}else delete n.annots;return n}if("0A"===n){r+=2;const e=s(8);r+=8;const t=2*parseInt(e,16),n=s(t);return r+=t,{bytes:n}}if("01"===n){r+=2;const t=s(8);r+=8;const n=2*parseInt(t,16),a=s(n);r+=n;const o=a.match(/[\dA-F]{2}/g);if(o instanceof Array){const t=new Uint8Array(o.map(e=>parseInt(e,16)));return{string:new e.TextDecoder("utf-8").decode(t)}}throw"Input bytes error"}if("00"===n){r+=2;const e=parseInt(s(2),16).toString(2).padStart(8,"0");r+=2;e[1];const n=[e.slice(2)];let a="1"===e[0];for(;a;){const e=parseInt(s(2),16).toString(2).padStart(8,"0");r+=2,n.push(e.slice(1)),a="1"===e[0]}return{int:new t.default(n.reverse().join(""),2).toString(10)}}if("02"===n){r+=2;const e=s(8);r+=8;const t=2*parseInt(e,16),n=(s(t),r+t),o=[];for(;n>r;)o.push(a());return o}throw`Invalid raw bytes: Byte:${n} Index:${r}`};return a()}var E={fromHex:a,toHex:o,prefix:_,watermark:u,bs58checkEncode:c,bs58checkDecode:p,bs58checkPrefixPick:l,getContractHexKey:h,bytesConcat:i,encodeRawBytes:f,decodeRawBytes:g};exports.default=E;
},{}],"7UtD":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.blake2bHash=o,exports.getMnemonic=d,exports.decryptKey=l,exports.getKeyFromSecretKey=k,exports.getKeyFromSeed=_,exports.getKeyFromWords=b,exports.signOperation=h,exports.default=void 0;var e=a(require("bip39")),t=a(require("./codec")),r=a(require("elliptic")),c=a(require("blakejs")),n=a(require("crypto")),s=i(require("tweetnacl"));function i(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)if(Object.prototype.hasOwnProperty.call(e,r)){var c=Object.defineProperty&&Object.getOwnPropertyDescriptor?Object.getOwnPropertyDescriptor(e,r):{};c.get||c.set?Object.defineProperty(t,r,c):t[r]=e[r]}return t.default=e,t}function a(e){return e&&e.__esModule?e:{default:e}}function o(e,t=32){return c.default.blake2b(e,null,t)}function d(t){return e.default.generateMnemonic(t)}class u{constructor(e,r,c){this.name=e,this.secret_key=r,this.pub_key=c,this.address={ed25519:()=>t.default.bs58checkEncode(o(this.pub_key,20),t.default.prefix.ed25519_public_key_hash),secp256k1:()=>t.default.bs58checkEncode(o(this.pub_key,20),t.default.prefix.secp256k1_public_key_hash),p256:()=>t.default.bs58checkEncode(o(this.pub_key,20),t.default.prefix.p256_public_key_hash)}[this.name]()}getSecretKey(){return{ed25519:()=>t.default.bs58checkEncode(this.secret_key,t.default.prefix.ed25519_secret_key),secp256k1:()=>t.default.bs58checkEncode(this.secret_key,t.default.prefix.secp256k1_secret_key),p256:()=>t.default.bs58checkEncode(this.secret_key,t.default.prefix.p256_secret_key)}[this.name]()}getPublicKey(){return{ed25519:()=>t.default.bs58checkEncode(this.pub_key,t.default.prefix.ed25519_public_key),secp256k1:()=>t.default.bs58checkEncode(this.pub_key,t.default.prefix.secp256k1_public_key),p256:()=>t.default.bs58checkEncode(this.pub_key,t.default.prefix.p256_public_key)}[this.name]()}}function f(e){new r.default.eddsa("ed25519");const t=s.default.sign.keyPair[32===e.length?"fromSeed":"fromSecretKey"](e);return new u("ed25519",t.secretKey,t.publicKey)}function p(e){const t=new r.default.ec("secp256k1").keyFromPrivate(e),c=new Uint8Array([2].concat(t.getPublic().getX().toArray()));return new u("secp256k1",e,c)}function y(e){const t=new r.default.ec("p256").keyFromPrivate(e),c=new Uint8Array([3].concat(t.getPublic().getX().toArray()));return new u("p256",e,c)}function l(e,r){const c=t.default.bs58checkPrefixPick(e),i=t.default.bs58checkDecode(e,c.bytes),a=i.slice(0,8),o=i.slice(8),d=n.default.pbkdf2Sync(r,a,32768,32,"sha512"),u=s.secretbox.open(o,new Uint8Array(24),d),l={ed25519_encrypted_seed:f,secp256k1_encrypted_secret_key:p,p256_encrypted_secret_key:y};if(c.name in l)return l[c.name](u);throw"No valid prefix for encrypted key found"}function k(e){const r=t.default.bs58checkPrefixPick(e),c=t.default.bs58checkDecode(e,r.bytes),n={ed25519_secret_key:f,secp256k1_secret_key:p,p256_encrypted_secret_key:y};if(r.name in n)return n[r.name](c);throw"No valid prefix for secret key found"}function _(e){const r="string"==typeof e?t.default.bs58checkDecode(e):e,c=s.default.sign.keyPair.fromSeed(r);return new u("ed25519",c.secretKey,c.publicKey)}function b(t,r){const c=t instanceof Array?t.join(" "):t;return _(e.default.mnemonicToSeed(c,r).slice(0,32))}function h(e,c){const n="string"==typeof e?t.default.fromHex(e):e,i=o(t.default.bytesConcat(t.default.watermark.operation(),n)),a=t.default.bs58checkPrefixPick(c),d={ed25519_secret_key:t.default.prefix.ed25519_signature,secp256k1_secret_key:t.default.prefix.secp256k1_signature,p256_secret_key:t.default.prefix.p256_signature},u=t.default.bs58checkDecode(c,a.bytes);if(a.name in d){const e={ed25519_secret_key:()=>s.default.sign.keyPair.fromSecretKey(u).secretKey,secp256k1_secret_key:()=>new r.default.ec("secp256k1").keyFromPrivate(u),p256_secret_key:()=>new r.default.ec("p256").keyFromPrivate(u)}[a.name](),c="ed25519_secret_key"===a.name?new Uint8Array(s.default.sign.detached(i,e)):(e=>new Uint8Array(e.r.toArray().concat(e.s.toArray())))(e.sign(i,{canonical:!0}));return t.default.bs58checkEncode(c,d[a.name])}throw`invalid prefix for: ${c}`}var m={getMnemonic:d,getKeyFromSeed:_,getKeyFromWords:b,decryptKey:l,getKeyFromSecretKey:k,signOperation:h};exports.default=m;
},{"./codec":"OZd1"}],"Focm":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var o=d(require("./PsddFKi3/codec")),e=d(require("./PsddFKi3/crypto"));function d(o){return o&&o.__esModule?o:{default:o}}const t={PsddFKi3:{codec:o.default,crypto:e.default}},c={codec:t.PsddFKi3.codec,crypto:t.PsddFKi3.crypto,modProtocol(o){if(!(o in t))throw`Protocol:${o} doesn't exist in protocols`;c.codec=t[o].codec,c.crypto=t[o].crypto}};var r=c;exports.default=r;
},{"./PsddFKi3/codec":"OZd1","./PsddFKi3/crypto":"7UtD"}]},{},["Focm"], null)
//# sourceMappingURL=/index.map