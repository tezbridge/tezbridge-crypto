// @flow

const ed25519 = require('./ed25519')
const p256 = require('./p256').HDKey
import secp256k1 from './secp256k1'


export function deriveKey(seed : Uint8Array, path : string, scheme : 'ed25519' | 'p256' | 'secp256k1') {
  const mapping = {
    ed25519() {
      return ed25519.derivePath(path, seed).key
    },
    p256() {
      const node = p256.fromMasterSeed(seed)
      return node.derive(path)._privateKey
    },
    secp256k1() {
      const node = secp256k1.fromMasterSeed(seed)
      return node.derive(path)._privateKey
    }
  }
  return mapping[scheme]()
}
