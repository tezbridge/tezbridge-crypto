// @flow

import bip39 from 'bip39'
import codec from './codec'
import elliptic from 'elliptic'
import blake from 'blakejs'

export function blake2bHash(input : Uint8Array, len : number = 32) {
  return blake.blake2b(input, null, len)
}

export function getMnemonic(strength? : number) {
  return bip39.generateMnemonic(strength)
}

export function getSeedFromWords(sig_type : 'ed25519' | 'secp256k1' | 'p256', words : string | Array<string>, password? : string) {
  const mnemonic = words instanceof Array ? words.join(' ') : words
  const seed_bytes = bip39.mnemonicToSeed(mnemonic, password).slice(0, 32)
  const sig_mapping = {
    ed25519: codec.prefix.ed25519_seed,
    secp256k1: codec.prefix.secp256k1_secret_key,
    p256: codec.prefix.p256_secret_key
  }
  return codec.bs58checkEncode(seed_bytes, sig_mapping[sig_type])
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

  if (prefix.name === 'ed25519_secret_key') {
    const ed25519 = new elliptic.eddsa('ed25519')
    const key = ed25519.keyFromSecret(secret_key_bytes)
    const signature_bytes = key.sign(operation_hash).toBytes()
    return codec.bs58checkEncode(new Uint8Array(signature_bytes), sig_mapping[prefix.name])

  } else if (prefix.name === 'secp256k1_secret_key') {
    const secp256k1 = new elliptic.ec('secp256k1')
    const key = secp256k1.keyFromPrivate(secret_key_bytes)
    const signature_raw = key.sign(operation_hash)
    const signature_bytes = new Uint8Array(signature_raw.r.toArray().concat(signature_raw.s.toArray()))
    return codec.bs58checkEncode(signature_bytes, sig_mapping[prefix.name])

  } else {
    throw `invalid prefix for: ${secret_key}`
  }
}

export default {
  getMnemonic,
  getSeedFromWords,
  signOperation
}