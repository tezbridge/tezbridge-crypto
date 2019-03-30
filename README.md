# tezbridge-crypto

[![Build Status](https://travis-ci.org/tezbridge/tezbridge-crypto.svg?branch=master)](https://travis-ci.org/tezbridge/tezbridge-crypto)
[![Known Vulnerabilities](https://snyk.io/test/github/tezbridge/tezbridge-crypto/badge.svg?targetFile=package.json)](https://snyk.io/test/github/tezbridge/tezbridge-crypto?targetFile=package.json)

[![npm](https://img.shields.io/npm/v/tezbridge-crypto.svg?color=birghtgreen)](https://www.npmjs.com/package/tezbridge-crypto)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/tezbridge-crypto.svg?color=brightgreen)](https://www.npmjs.com/package/tezbridge-crypto)

[![GitHub last commit](https://img.shields.io/github/last-commit/tezbridge/tezbridge-crypto.svg)](https://github.com/tezbridge/tezbridge-crypto/commits/master)

This library contains useful codec and crypto utilities for Tezos.

## Installation
`npm i tezbridge-crypto`

## Requirements
- `parcel-bundler` is needed. (`npm install -g parcel-bundler`)

## Building
```
npm install
npm run build
```

# Documentation

## TezBridgeCrypto

```javascript
import TezBridgeCrypto from 'tezbridge-crypto'
```

## API reference

### TezBridgeCrypto

##### `TezBridgeCrypto.modProtocol(protocol)`
Switch protocol on the fly

### TezBridgeCrypto.codec

##### `TezBridgeCrypto.codec.fromHex(hex_str)`
Convert hex string to bytes.

##### `TezBridgeCrypto.codec.toHex(bytes)`
Convert bytes to hex string.

##### `TezBridgeCrypto.codec.toTzBytes(source, is_key_hash = false)`
Convert key value to hex string with special prefix which is used in operation bytes. 

##### `TezBridgeCrypto.codec.toTzStrValue(tz_bytes_str)`
Convert hex string with special prefix in operation bytes to normal key value.

##### `TezBridgeCrypto.codec.prefix`
A prefix mapping for different Tezos data types.

##### `TezBridgeCrypto.codec.watermark`
Watermark mapping can be used in bytes from different places.

##### `TezBridgeCrypto.codec.bs58checkEncode(input_bytes, prefix)`
Encode bytes to string value by specific prefix

##### `TezBridgeCrypto.codec.bs58checkDecode(input_str, prefix?)`
Decode key value to bytes by specific prefix or by autodetection.

##### `TezBridgeCrypto.codec.bs58checkPrefixPick(input_str)`
Auto detect the prefix of a key value.

##### `TezBridgeCrypto.codec.getContractHexKey(address)`
Convert address value to special hex representation(eg. `3e/e2/31/36/6b/1336eb61419df8fc666056025929bf`)

##### `TezBridgeCrypto.codec.bytesConcat(x, y)`
Concat two bytes into one.

##### `TezBridgeCrypto.codec.encodeRawBytes(input_micheline)`
Encode Micheline data into bytes string.

##### `TezBridgeCrypto.codec.decodeRawBytes(input_str)`
Decode bytes string to Micheline data.

##### `TezBridgeCrypto.codec.encodeZarithInt(decimal_str)`
Encode int decimal value to zarith bytes string.

##### `TezBridgeCrypto.codec.encodeZarithUInt(decimal_str)`
Encode uint decimal value to zarith bytes string.


### TezBridgeCrypto.crypto

##### TezBridgeCrypto.crypto.EncryptedBox
This class can create an instance with encrypted key for each usage.
```javascript
const box = new TBC.crypto.EncryptedBox(any_key_str)
box.show().then(encrypted_key => console.log(encrypted_key))
box.reveal().then(raw_key => console.log(raw_key))
```

##### `TezBridgeCrypto.crypto.genMnemonic(strength?)`
Generate a mnemonic with specific strength(entropy-bit)

##### `TezBridgeCrypto.crypto.getKeyFromSeed(seed_str)`
Get key pair from a seed value

##### `TezBridgeCrypto.crypto.getSeedFromWords(words, password?)`
Get seed from mnemonic words with passwords

##### `TezBridgeCrypto.crypto.getKeyFromWords(words, password?)`
Get key pair from mnemonic words with passwords

##### `TezBridgeCrypto.crypto.genRandomKey(scheme)`
Generate a new key.

scheme can only be: `ed25519` | `secp256k1` | `p256`

##### `TezBridgeCrypto.crypto.genRandomBytes(len)`
Generate `len` long bytes randomly.

##### `TezBridgeCrypto.crypto.decryptKey(encrypted_key, password)`
Decrypt key(prefix in edesk, spesk, p2esk) with password.

##### `TezBridgeCrypto.crypto.encryptKey(scheme, sk, password)`
Encrypt key with password.

scheme can only be: `ed25519` | `secp256k1` | `p256`

##### `TezBridgeCrypto.crypto.getKeyFromSecretKey(sk)`
Get key pair from secret key.

##### `TezBridgeCrypto.crypto.signOperation(operation_bytes, sk)`
Sign operation bytes with secret key.


### TezBridgeCrypto.localop

##### `TezBridgeCrypto.localop.forgeOperation(contents, branch)`
Forge operation localy without RPC node

##### `TezBridgeCrypto.localop.parseOperationBytes(bytes_str)`
Parse operation bytes to Micheline.
