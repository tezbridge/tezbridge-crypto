parcelRequire=function(e,r,n,t){var i="function"==typeof parcelRequire&&parcelRequire,o="function"==typeof require&&require;function u(n,t){if(!r[n]){if(!e[n]){var f="function"==typeof parcelRequire&&parcelRequire;if(!t&&f)return f(n,!0);if(i)return i(n,!0);if(o&&"string"==typeof n)return o(n);var c=new Error("Cannot find module '"+n+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[n][1][r]||r},p.cache={};var l=r[n]=new u.Module(n);e[n][0].call(l.exports,p,l,l.exports,this)}return r[n].exports;function p(e){return u(p.resolve(e))}}u.isParcelRequire=!0,u.Module=function(e){this.id=e,this.bundle=u,this.exports={}},u.modules=e,u.cache=r,u.parent=i,u.register=function(r,n){e[r]=[function(e,r){r.exports=n},{}]};for(var f=0;f<n.length;f++)u(n[f]);if(n.length){var c=u(n[n.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=c:"function"==typeof define&&define.amd?define(function(){return c}):t&&(this[t]=c)}return u}({"TYUR":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.bytesConcat=r,exports.bs58checkEncode=s,exports.bs58checkDecode=a,exports.bs58checkPrefixPick=c,exports.getContractHexKey=o,exports.decodeRawBytes=A,exports.default=exports.watermark=exports.prefix=void 0;var e=n(require("bs58check")),t=n(require("elliptic"));function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){const n=new Uint8Array(e.length+t.length);return n.set(e,0),n.set(t,e.length),n}function s(t,n){return e.default.encode(r(n,t))}function a(t,n){return e.default.decode(t).slice(n?n.length:c(t).bytes.length)}const i={block_hash:new Uint8Array([1,52]),operation_hash:new Uint8Array([5,116]),operation_list_hash:new Uint8Array([133,233]),operation_list_list_hash:new Uint8Array([29,159,109]),protocol_hash:new Uint8Array([2,170]),context_hash:new Uint8Array([79,199]),ed25519_public_key_hash:new Uint8Array([6,161,159]),secp256k1_public_key_hash:new Uint8Array([6,161,161]),p256_public_key_hash:new Uint8Array([6,161,164]),cryptobox_public_key_hash:new Uint8Array([153,103]),ed25519_seed:new Uint8Array([13,15,58,7]),ed25519_public_key:new Uint8Array([13,15,37,217]),secp256k1_secret_key:new Uint8Array([17,162,224,201]),p256_secret_key:new Uint8Array([16,81,238,189]),ed25519_encrypted_seed:new Uint8Array([7,90,60,179,41]),secp256k1_encrypted_secret_key:new Uint8Array([9,237,241,174,150]),p256_encrypted_secret_key:new Uint8Array([9,48,57,115,171]),secp256k1_public_key:new Uint8Array([3,254,226,86]),p256_public_key:new Uint8Array([3,178,139,127]),secp256k1_scalar:new Uint8Array([38,248,136]),secp256k1_element:new Uint8Array([5,92,0]),ed25519_secret_key:new Uint8Array([43,246,78,7]),ed25519_signature:new Uint8Array([9,245,205,134,18]),secp256k1_signature:new Uint8Array([13,115,101,19,63]),p256_signature:new Uint8Array([54,240,44,52]),generic_signature:new Uint8Array([4,130,43]),chain_id:new Uint8Array([7,82,0]),contract_hash:new Uint8Array([2,90,121])};function c(e){const t={15:{Net:"chain_id"},30:{id:"cryptobox_public_key_hash"},36:{tz1:"ed25519_public_key_hash",tz2:"secp256k1_public_key_hash",tz3:"p256_public_key_hash",KT1:"contract_hash"},51:{B:"block_hash",o:"operation_hash",P:"protocol_hash"},52:{Lo:"operation_list_hash",Co:"context_hash"},53:{LLo:"operation_list_list_hash",SSp:"secp256k1_scalar"},54:{edsk:"ed25519_seed",edpk:"ed25519_public_key",spsk:"secp256k1_secret_key",p2sk:"p256_secret_key",GSp:"secp256k1_element"},55:{sppk:"secp256k1_public_key",p2pk:"p256_public_key"},88:{edesk:"ed25519_encrypted_seed",spesk:"secp256k1_encrypted_secret_key",p2esk:"p256_encrypted_secret_key"},96:{sig:"generic_signature"},98:{edsk:"ed25519_secret_key",p2sig:"p256_signature"},99:{edsig:"ed25519_signature",spsig1:"secp256k1_signature"}}[e.length];if(t)for(const n in t){const r=n.length;if(e.slice(0,r)===n)return{bytes:i[t[n]],name:t[n]}}throw`No prefix found for: ${e}`}function o(e){if(36!==e.length||"KT1"!==e.slice(0,3))throw`invalid contract: ${e}`;const n=a(e,i.contract_hash),r=t.default.utils.toHex(n);return[[0,2],[2,4],[4,6],[6,8],[8,10],[10,void 0]].map(e=>r.slice(e[0],e[1])).join("/")}exports.prefix=i;const _={block_header:e=>r(new Uint8Array([1]),e),endorsement:e=>r(new Uint8Array([2]),e),operation:()=>new Uint8Array([3]),custom:e=>e};exports.watermark=_;const p={"00":"parameter","01":"storage","02":"code","03":"False","04":"Elt","05":"Left","06":"None","07":"Pair","08":"Right","09":"Some","0A":"True","0B":"Unit","0C":"PACK","0D":"UNPACK","0E":"BLAKE2B","0F":"SHA256",10:"SHA512",11:"ABS",12:"ADD",13:"AMOUNT",14:"AND",15:"BALANCE",16:"CAR",17:"CDR",18:"CHECK_SIGNATURE",19:"COMPARE","1A":"CONCAT","1B":"CONS","1C":"CREATE_ACCOUNT","1D":"CREATE_CONTRACT","1E":"IMPLICIT_ACCOUNT","1F":"DIP",20:"DROP",21:"DUP",22:"EDIV",23:"EMPTY_MAP",24:"EMPTY_SET",25:"EQ",26:"EXEC",27:"FAILWITH",28:"GE",29:"GET","2A":"GT","2B":"HASH_KEY","2C":"IF","2D":"IF_CONS","2E":"IF_LEFT","2F":"IF_NONE",30:"INT",31:"LAMBDA",32:"LE",33:"LEFT",34:"LOOP",35:"LSL",36:"LSR",37:"LT",38:"MAP",39:"MEM","3A":"MUL","3B":"NEG","3C":"NEQ","3D":"NIL","3E":"NONE","3F":"NOT",40:"NOW",41:"OR",42:"PAIR",43:"PUSH",44:"RIGHT",45:"SIZE",46:"SOME",47:"SOURCE",48:"SENDER",49:"SELF","4A":"STEPS_TO_QUOTA","4B":"SUB","4C":"SWAP","4D":"TRANSFER_TOKENS","4E":"SET_DELEGATE","4F":"UNIT",50:"UPDATE",51:"XOR",52:"ITER",53:"LOOP_LEFT",54:"ADDRESS",55:"CONTRACT",56:"ISNAT",57:"CAST",58:"RENAME",59:"bool","5A":"contract","5B":"int","5C":"key","5D":"key_hash","5E":"lambda","5F":"list",60:"map",61:"big_map",62:"nat",63:"option",64:"or",65:"pair",66:"set",67:"signature",68:"string",69:"bytes","6A":"mutez","6B":"timestamp","6C":"unit","6D":"operation","6E":"address","6F":"SLICE"},y={"00":"int","01":"string","02":"seq","03":{name:"prim",len:0,annot:!1},"04":{name:"prim",len:0,annot:!0},"05":{name:"prim",len:1,annot:!1},"06":{name:"prim",len:1,annot:!0},"07":{name:"prim",len:2,annot:!1},"08":{name:"prim",len:2,annot:!0},"09":{name:"prim",len:3,annot:!0},"0A":"bytes"};function A(e){e=e.toUpperCase();let t=0;const n=n=>e.slice(t,t+n),r=()=>{const e=n(2),s=y[e];if(s instanceof Object){t+=2;const e=p[n(2)];return t+=2,{prim:e,args:Array.apply(null,new Array(s.len)).map(()=>r())}}if("0A"===e){t+=2;const e=n(8);t+=8;const r=2*parseInt(e,16),s=n(r);return t+=r,{bytes:s}}if("01"===e){t+=2;const e=n(8);t+=8;const r=2*parseInt(e,16),s=n(r);t+=r;const a=s.match(/[\dA-F]{2}/g);if(a instanceof Array){const e=new Uint8Array(a.map(e=>parseInt(e,16)));return{string:new TextDecoder("utf-8").decode(e)}}throw"Input bytes error"}if("00"===e){t+=2;const e=parseInt(n(2),16).toString(2).padStart(8,"0");t+=2;e[1];const r=[e.slice(2)];let s="1"===e[0];for(;s;){const e=parseInt(n(2),16).toString(2).padStart(8,"0");t+=2,r.push(e.slice(1)),s="1"===e[0]}return{int:parseInt(r.reverse().join(""),2).toString()}}if("02"===e){t+=2;const e=n(8);t+=8;const s=2*parseInt(e,16),a=(n(s),t+s),i=[];for(;a>t;)i.push(r());return i}throw"Invalid raw bytes"};return r()}var l={prefix:i,watermark:_,bs58checkEncode:s,bs58checkDecode:a,bs58checkPrefixPick:c,getContractHexKey:o,bytesConcat:r,decodeRawBytes:A};exports.default=l;
},{}],"T9NQ":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.blake2bHash=d,exports.getMnemonic=u,exports.decryptKey=p,exports.getKeyFromSeed=f,exports.getKeyFromWords=y,exports.signOperation=l,exports.default=void 0;var e=a(require("bip39")),t=a(require("./codec")),r=a(require("elliptic")),c=a(require("blakejs")),n=a(require("crypto")),s=i(require("tweetnacl"));function i(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)if(Object.prototype.hasOwnProperty.call(e,r)){var c=Object.defineProperty&&Object.getOwnPropertyDescriptor?Object.getOwnPropertyDescriptor(e,r):{};c.get||c.set?Object.defineProperty(t,r,c):t[r]=e[r]}return t.default=e,t}function a(e){return e&&e.__esModule?e:{default:e}}function d(e,t=32){return c.default.blake2b(e,null,t)}function u(t){return e.default.generateMnemonic(t)}class o{constructor(e,r,c){this.name=e,this.secret_key=r,this.pub_key=c,this.address={ed25519:()=>t.default.bs58checkEncode(d(this.pub_key,20),t.default.prefix.ed25519_public_key_hash),secp256k1:()=>t.default.bs58checkEncode(d(this.pub_key,20),t.default.prefix.secp256k1_public_key_hash),p256:()=>t.default.bs58checkEncode(d(this.pub_key,20),t.default.prefix.p256_public_key_hash)}[this.name]()}getSecretKey(){return{ed25519:()=>t.default.bs58checkEncode(this.secret_key,t.default.prefix.ed25519_secret_key),secp256k1:()=>t.default.bs58checkEncode(this.secret_key,t.default.prefix.secp256k1_secret_key),p256:()=>t.default.bs58checkEncode(this.secret_key,t.default.prefix.p256_secret_key)}[this.name]()}getPublicKey(){return{ed25519:()=>t.default.bs58checkEncode(this.pub_key,t.default.prefix.ed25519_public_key),secp256k1:()=>t.default.bs58checkEncode(this.pub_key,t.default.prefix.secp256k1_public_key),p256:()=>t.default.bs58checkEncode(this.pub_key,t.default.prefix.p256_public_key)}[this.name]()}}function p(e,c){const i=t.default.bs58checkPrefixPick(e),a=t.default.bs58checkDecode(e,i.bytes),d=a.slice(0,8),u=a.slice(8),p=n.default.pbkdf2Sync(c,d,32768,32,"sha512"),f=s.secretbox.open(u,new Uint8Array(24),p),y={ed25519_encrypted_seed:e=>{new r.default.eddsa("ed25519");const t=s.default.sign.keyPair.fromSeed(e);return new o("ed25519",t.secretKey,t.publicKey)},secp256k1_encrypted_secret_key:e=>{const t=new r.default.ec("secp256k1").keyFromPrivate(e),c=new Uint8Array([2].concat(t.getPublic().getX().toArray()));return new o("secp256k1",e,c)},p256_encrypted_secret_key:e=>{const t=new r.default.ec("p256").keyFromPrivate(e),c=new Uint8Array([3].concat(t.getPublic().getX().toArray()));return new o("p256",e,c)}};if(i.name in y)return y[i.name](f);throw"No valid prefix for encrypted key found"}function f(e){const r="string"==typeof e?t.default.bs58checkDecode(e):e,c=s.default.sign.keyPair.fromSeed(r);return new o("ed25519",c.secretKey,c.publicKey)}function y(t,r){const c=t instanceof Array?t.join(" "):t;return f(e.default.mnemonicToSeed(c,r).slice(0,32))}function l(e,c){const n=d(t.default.bytesConcat(t.default.watermark.operation(),e)),s=t.default.bs58checkPrefixPick(c),i={ed25519_secret_key:t.default.prefix.ed25519_signature,secp256k1_secret_key:t.default.prefix.secp256k1_signature,p256_secret_key:t.default.prefix.p256_signature},a=t.default.bs58checkDecode(c,s.bytes);if(s.name in i){const e={ed25519_secret_key:()=>new r.default.eddsa("ed25519").keyFromSecret(a),secp256k1_secret_key:()=>new r.default.ec("secp256k1").keyFromPrivate(a),p256_secret_key:()=>new r.default.ec("p256").keyFromPrivate(a)}[s.name](),c="ed25519_secret_key"===s.name?new Uint8Array(e.sign(n).toBytes()):(e=>new Uint8Array(e.r.toArray().concat(e.s.toArray())))(e.sign(n));return t.default.bs58checkEncode(c,i[s.name])}throw`invalid prefix for: ${c}`}var k={getMnemonic:u,getKeyFromSeed:f,getKeyFromWords:y,decryptKey:p,signOperation:l};exports.default=k;
},{"./codec":"TYUR"}],"Focm":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=t(require("./codec")),r=t(require("./crypto"));function t(e){return e&&e.__esModule?e:{default:e}}var u={codec:e.default,crypto:r.default};exports.default=u;
},{"./codec":"TYUR","./crypto":"T9NQ"}]},{},["Focm"], null)
//# sourceMappingURL=/index.map