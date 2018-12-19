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

export function decryptKey(encrypted : string, password : string) {
  const prefix = codec.bs58checkPrefixPick(encrypted)
  const encrypted_bytes = codec.bs58checkDecode(encrypted, prefix.bytes)
  const salt = encrypted_bytes.slice(0, 8)
  const encrypted_msg = encrypted_bytes.slice(8)
  const key = crypto.pbkdf2Sync(password, salt, 32768, 32, 'sha512')
  const result = secretbox.open(encrypted_msg, new Uint8Array(24), key)
  const key_mapping = {
    ed25519_encrypted_seed: (seed) => {
      const ed25519 = new elliptic.eddsa('ed25519')
      const key_pair = nacl.sign.keyPair.fromSeed(seed)
      return codec.bs58checkEncode(key_pair.secretKey, codec.prefix.ed25519_secret_key)
    },
    secp256k1_encrypted_secret_key: (key) => 
      codec.bs58checkEncode(key, codec.prefix.secp256k1_secret_key),
    p256_encrypted_secret_key: (key) => 
      codec.bs58checkEncode(key, codec.prefix.p256_secret_key), 
  }

  if (prefix.name in key_mapping) {
    return key_mapping[prefix.name](result)
  } else {
    throw 'No valid prefix for encrypted key found'
  }
}

export function getSeedFromWords(words : string | Array<string>, password? : string) {
  const mnemonic = words instanceof Array ? words.join(' ') : words
  const seed_bytes = bip39.mnemonicToSeed(mnemonic, password).slice(0, 32)
  return codec.bs58checkEncode(seed_bytes, codec.prefix.ed25519_seed)
}

export function signOperation(operation_bytes : Uint8Array, secret_key : string) {
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
      ed25519_secret_key: () => (new elliptic.eddsa('ed25519')).keyFromSecret(secret_key_bytes),
      secp256k1_secret_key: () => (new elliptic.ec('secp256k1')).keyFromPrivate(secret_key_bytes),
      p256_secret_key: () => (new elliptic.ec('p256')).keyFromPrivate(secret_key_bytes)
    }[prefix.name]()

    const sig_bytes = prefix.name === 'ed25519_secret_key' ? 
      new Uint8Array(key.sign(operation_hash).toBytes()) :
      (sig => new Uint8Array(sig.r.toArray().concat(sig.s.toArray())))(key.sign(operation_hash)) 

    return codec.bs58checkEncode(sig_bytes, sig_mapping[prefix.name])
  } else {
    throw `invalid prefix for: ${secret_key}`
  }
}

export default {
  getMnemonic,
  getSeedFromWords,
  decryptKey,
  signOperation
}