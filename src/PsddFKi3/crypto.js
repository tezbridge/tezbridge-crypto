// @flow

const [genRandomBytes, deriveKeyByPBKDF2] = (() => {
  if (process.env.NODE_ENV === 'browser') {
    return [
      (len : number) => window.crypto.getRandomValues(new Uint8Array(len)),
      (password : string, salt : Uint8Array) =>
        window.crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(password),
          {
            name: 'PBKDF2',
          },
          false, 
          ['deriveBits']
        )
        .then(key => {
          return window.crypto.subtle.deriveBits(
            {
              name: 'PBKDF2',
              salt: salt,
              iterations: 32768,
              hash: {name: 'SHA-512'}
            },
            key,
            256 
          )
        })
        .then(key => new Uint8Array(key))
    ]
  } else {
    const crypto = require('crypto')
    return [
      crypto.randomBytes,
      (passowrd : string, salt : Uint8Array) =>
        new Promise<Uint8Array>((resolve, reject) => {
          crypto.pbkdf2(passowrd, Buffer.from(salt), 32768, 32, 'sha512', (err, derived_key) => {
            if (err) 
              reject(err)
            else
              resolve(derived_key)
          })
        })
    ]
  }
})()

import bs58check from 'bs58check'
import bip39 from 'bip39'
import codec from './codec'
import elliptic from 'elliptic'
import blake from 'blakejs'
import { secretbox } from 'tweetnacl'
import nacl from 'tweetnacl'

export function blake2bHash(input : Uint8Array, len : number = 32) {
  return blake.blake2b(input, null, len)
}

export function genMnemonic(strength? : number) {
  return bip39.generateMnemonic(strength)
}

export class EncryptedBox {
  encrypted : Uint8Array
  prepared : Promise<void>

  constructor(input : string = '', pwd : string = '') {
    try {
      codec.bs58checkPrefixPick(input)

      const secret_key_bytes = bs58check.decode(input)

      this.prepared = this.encrypt(secret_key_bytes, pwd)

    } catch(_) {

      this.encrypted = bs58check.decode(input)
      this.prepared = Promise.resolve()

    }
  }

  encrypt(bytes : Uint8Array, pwd : string = '') {
    const password = genRandomBytes(8)
    const salt = genRandomBytes(8)
    return deriveKeyByPBKDF2(pwd + codec.toHex(password), salt)
    .then(key => {
      this.encrypted = codec.bytesConcat(
        codec.bytesConcat(password, salt),
        secretbox(bytes, new Uint8Array(24), key))
    })
  }

  async show() {
    await this.prepared
    return bs58check.encode(Buffer.from(this.encrypted))
  }

  async reveal(pwd : string = '', new_pwd : string = '') {
    await this.prepared
    
    const password = this.encrypted.slice(0, 8)
    const salt = this.encrypted.slice(8, 16)
    const encrypted_msg = this.encrypted.slice(16)

    const key = await deriveKeyByPBKDF2(pwd + codec.toHex(password), salt)
    const decrypted_key = secretbox.open(encrypted_msg, new Uint8Array(24), key)

    await this.encrypt(new Uint8Array(decrypted_key), new_pwd || pwd)

    if (decrypted_key)
      return bs58check.encode(Buffer.from(decrypted_key))
    else
      throw 'Invalid pwd for revealing the key'
  }

  async revealKey(pwd : string = '', new_pwd : string = '') {
    const raw_key = await this.reveal(pwd)
    return getKeyFromSecretKey(raw_key)
  }
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
 
export async function decryptKey(encrypted : string, password : string) : Promise<Key> {
  const prefix = codec.bs58checkPrefixPick(encrypted)
  const encrypted_bytes = codec.bs58checkDecode(encrypted, prefix.bytes)
  const salt = encrypted_bytes.slice(0, 8)
  const encrypted_msg = encrypted_bytes.slice(8)
  const key = await deriveKeyByPBKDF2(password, salt)
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

export async function encryptKey(scheme : 'ed25519' | 'secp256k1' | 'p256', 
                           unencrypted : Uint8Array, 
                           password : string) : Promise<string> {
  if (unencrypted.length !== 32) 
    throw `The length of key bytes to encrypt can only be 32. (should use seed for ed25519)`

  const salt = genRandomBytes(8)
  const key = await deriveKeyByPBKDF2(password, salt)
  const encrypted_msg = secretbox(unencrypted, new Uint8Array(24), key)
  const prefix_mapping = {
    ed25519: codec.prefix.ed25519_encrypted_seed,
    secp256k1: codec.prefix.secp256k1_encrypted_secret_key,
    p256: codec.prefix.p256_encrypted_secret_key
  }

  const bytes = codec.bytesConcat(salt, encrypted_msg)
  return codec.bs58checkEncode(bytes, prefix_mapping[scheme])
}

export function getKeyFromSecretKey(sk: string) {
  const prefix = codec.bs58checkPrefixPick(sk)
  const bytes = codec.bs58checkDecode(sk, prefix.bytes)

  const key_mapping = {
    ed25519_secret_key: getKeyFromEd25519,
    secp256k1_secret_key: getKeyFromSecp256k1,
    p256_secret_key: getKeyFromP256
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

export function getSeedFromWords(words : string | Array<string>, password? : string) {
  const mnemonic = words instanceof Array ? words.join(' ') : words
  return bip39.mnemonicToSeed(mnemonic, password).slice(0, 32)
}

export function getKeyFromWords(words : string | Array<string>, password? : string) {
  return getKeyFromSeed(getSeedFromWords(words, password))
}


export function genRandomKey(scheme : 'ed25519' | 'secp256k1' | 'p256') {
  const key_len = scheme === 'ed25519' ? 64 : 32
  const key_mapping = {
    ed25519: getKeyFromEd25519,
    secp256k1: getKeyFromSecp256k1,
    p256: getKeyFromP256
  }

  return key_mapping[scheme](genRandomBytes(key_len))
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
      (sig => new Uint8Array(sig.r.toArray().concat(sig.s.toArray())))(key.sign(operation_hash, {canonical: true})) 

    return codec.bs58checkEncode(sig_bytes, sig_mapping[prefix.name])
  } else {
    throw `invalid prefix for: ${secret_key}`
  }
}

export default {
  EncryptedBox,
  genMnemonic,
  getKeyFromSeed,
  getSeedFromWords,
  getKeyFromWords,
  genRandomKey,
  genRandomBytes,
  decryptKey,
  encryptKey,
  getKeyFromSecretKey,
  signOperation
}