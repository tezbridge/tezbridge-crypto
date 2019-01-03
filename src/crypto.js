// @flow

import bip39 from 'bip39'
import codec from './codec'
import elliptic from 'elliptic'
import blake from 'blakejs'
import crypto from 'crypto'
import { secretbox } from 'tweetnacl'
import nacl from 'tweetnacl'

export function blake2bHash(input : Uint8Array, len : number = 32) {
  return blake.blake2b(input, null, len)
}

export function getMnemonic(strength? : number) {
  return bip39.generateMnemonic(strength)
}

class Key {
  name : string
  secret_key : Uint8Array
  pub_key : Uint8Array
  address : string

  constructor(name : 'ed25519' | 'secp256k1' | 'p256', secret_key : Uint8Array, pub_key : Uint8Array) {
    this.name = name
    this.secret_key = secret_key
    this.pub_key = pub_key

    this.address = {
      ed25519: () => 
        codec.bs58checkEncode(blake2bHash(this.pub_key, 20), codec.prefix.ed25519_public_key_hash),
      secp256k1: () => 
        codec.bs58checkEncode(blake2bHash(this.pub_key, 20), codec.prefix.secp256k1_public_key_hash),
      p256: () => 
        codec.bs58checkEncode(blake2bHash(this.pub_key, 20), codec.prefix.p256_public_key_hash) 
    }[this.name]()
  }

  getSecretKey() {
    return {
      ed25519: () => 
        codec.bs58checkEncode(this.secret_key, codec.prefix.ed25519_secret_key),
      secp256k1: () => 
        codec.bs58checkEncode(this.secret_key, codec.prefix.secp256k1_secret_key),
      p256: () => 
        codec.bs58checkEncode(this.secret_key, codec.prefix.p256_secret_key)
    }[this.name]()
  }

  getPublicKey() {
    return {
      ed25519: () => 
        codec.bs58checkEncode(this.pub_key, codec.prefix.ed25519_public_key),
      secp256k1: () => 
        codec.bs58checkEncode(this.pub_key, codec.prefix.secp256k1_public_key),
      p256: () => 
        codec.bs58checkEncode(this.pub_key, codec.prefix.p256_public_key)
    }[this.name]()
  }
}

function getKeyFromEd25519(input : Uint8Array) {
  const ed25519 = new elliptic.eddsa('ed25519')
  const key_pair = nacl.sign.keyPair[input.length === 32 ? 'fromSeed' : 'fromSecretKey'](input)
  return new Key('ed25519', key_pair.secretKey, key_pair.publicKey)
}
function getKeyFromSecp256k1(key : Uint8Array) {
  const key_pair = (new elliptic.ec('secp256k1')).keyFromPrivate(key)
  const pub_key = new Uint8Array([2].concat(key_pair.getPublic().getX().toArray()))
  return new Key('secp256k1', key, pub_key)
}
function getKeyFromP256(key : Uint8Array) {
  const key_pair = (new elliptic.ec('p256')).keyFromPrivate(key)
  const pub_key = new Uint8Array([3].concat(key_pair.getPublic().getX().toArray()))
  return new Key('p256', key, pub_key)
}
 
export function decryptKey(encrypted : string, password : string) : Key {
  const prefix = codec.bs58checkPrefixPick(encrypted)
  const encrypted_bytes = codec.bs58checkDecode(encrypted, prefix.bytes)
  const salt = encrypted_bytes.slice(0, 8)
  const encrypted_msg = encrypted_bytes.slice(8)
  const key = crypto.pbkdf2Sync(password, salt, 32768, 32, 'sha512')
  const result = secretbox.open(encrypted_msg, new Uint8Array(24), key)
  const key_mapping = {
    ed25519_encrypted_seed: getKeyFromEd25519,
    secp256k1_encrypted_secret_key: getKeyFromSecp256k1,
    p256_encrypted_secret_key: getKeyFromP256
  }

  if (prefix.name in key_mapping) {
    return key_mapping[prefix.name](result)
  } else {
    throw 'No valid prefix for encrypted key found'
  }
}

export function getKeyFromSecretKey(sk: string) {
  const prefix = codec.bs58checkPrefixPick(sk)
  const bytes = codec.bs58checkDecode(sk, prefix.bytes)

  const key_mapping = {
    ed25519_secret_key: getKeyFromEd25519,
    secp256k1_secret_key: getKeyFromSecp256k1,
    p256_encrypted_secret_key: getKeyFromP256
  }

  if (prefix.name in key_mapping) {
    return key_mapping[prefix.name](bytes)
  } else {
    throw 'No valid prefix for secret key found'
  }
}

export function getKeyFromSeed(seed : string | Uint8Array) {
  const seed_bytes = typeof seed === 'string' ? codec.bs58checkDecode(seed) : seed
  const key_pair = nacl.sign.keyPair.fromSeed(seed_bytes)
  return new Key('ed25519', key_pair.secretKey, key_pair.publicKey)
}

export function getKeyFromWords(words : string | Array<string>, password? : string) {
  const mnemonic = words instanceof Array ? words.join(' ') : words
  const seed_bytes = bip39.mnemonicToSeed(mnemonic, password).slice(0, 32)
  return getKeyFromSeed(seed_bytes)
}

export function signOperation(input_operation : Uint8Array | string, secret_key : string) {
  const operation_bytes = typeof input_operation === 'string' ? codec.fromHex(input_operation) : input_operation
  const marked_operation = codec.bytesConcat(codec.watermark.operation(), operation_bytes)
  const operation_hash = blake2bHash(marked_operation)
  const prefix = codec.bs58checkPrefixPick(secret_key)
  const sig_mapping = {
    ed25519_secret_key: codec.prefix.ed25519_signature,
    secp256k1_secret_key: codec.prefix.secp256k1_signature,
    p256_secret_key: codec.prefix.p256_signature
  }

  const secret_key_bytes = codec.bs58checkDecode(secret_key, prefix.bytes)
  if (prefix.name in sig_mapping) {
    const key = {
      ed25519_secret_key: () => nacl.sign.keyPair.fromSecretKey(secret_key_bytes).secretKey,
      secp256k1_secret_key: () => (new elliptic.ec('secp256k1')).keyFromPrivate(secret_key_bytes),
      p256_secret_key: () => (new elliptic.ec('p256')).keyFromPrivate(secret_key_bytes)
    }[prefix.name]()

    const sig_bytes = prefix.name === 'ed25519_secret_key' ? 
      new Uint8Array(nacl.sign.detached(operation_hash, key)) :
      (sig => new Uint8Array(sig.r.toArray().concat(sig.s.toArray())))(key.sign(operation_hash)) 

    return codec.bs58checkEncode(sig_bytes, sig_mapping[prefix.name])
  } else {
    throw `invalid prefix for: ${secret_key}`
  }
}

export default {
  getMnemonic,
  getKeyFromSeed,
  getKeyFromWords,
  decryptKey,
  getKeyFromSecretKey,
  signOperation
}