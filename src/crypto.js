// @flow

import bip39 from 'bip39'
import codec from './codec'

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
  return codec.bs58checkEncode(sig_mapping[sig_type], seed_bytes)
}

export default {
  getMnemonic,
  getSeedFromWords
}