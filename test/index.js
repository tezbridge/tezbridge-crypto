// @flow

import TezBridgeCrypto from './../src/index'
import { assert } from './util'

const TBC = TezBridgeCrypto

const fn_tests = async () => {
  {
    const r = TBC.codec.decodeRawBytes('07070a0000001601b2a4f12006b191111b11faa0a126bcddded861de0007070a000000160000f9a61eefd5d12786e70433b1edc846ac9eb5fcd60707030a0707009503070700a3db97010000')
    const answer = '{"prim":"Pair","args":[{"bytes":"01B2A4F12006B191111B11FAA0A126BCDDDED861DE00"},{"prim":"Pair","args":[{"bytes":"0000F9A61EEFD5D12786E70433B1EDC846AC9EB5FCD6"},{"prim":"Pair","args":[{"prim":"True","args":[]},{"prim":"Pair","args":[{"int":"213"},{"prim":"Pair","args":[{"int":"1242851"},{"int":"0"}]}]}]}]}]}'
    assert(JSON.stringify(r) === answer, 'FN: decodeRawBytes')
  }

  {
    const a1 = new Uint8Array([])
    const a2 = new Uint8Array([1])
    const a3 = new Uint8Array([2, 255])
    {
      const r = TBC.codec.bytesConcat(a1, a1)
      assert(r.length === 0, 'FN: bytesConcat empty with empty')
    }
    {
      const r = TBC.codec.bytesConcat(a1, a2)
      assert(r.length === 1 && r[0] === 1, 'FN: bytesConcat empty with non-empty')
    }
    {
      const r = TBC.codec.bytesConcat(a2, a3)
      assert(r.length === 3 && r[0] === 1 && r[1] === 2 && r[2] === 255, 
             'FN: bytesConcat non-empty with non-empty')
    }
  }

  {
    const source = 'tz1TUswtLE1cTBgoBC2JAtQ5Jsz2crp1tZvJ'
    const prefix = TBC.codec.prefix.ed25519_public_key_hash
    const bytes = TBC.codec.bs58checkDecode(source, prefix)
    const bytes_auto = TBC.codec.bs58checkDecode(source)
    assert(bytes.length === 20 && bytes.toString() === bytes_auto.toString(), 'FN: bs58checkDecode')
    const str = TBC.codec.bs58checkEncode(bytes, prefix)
    assert(str === source, 'FN: bs58checkEncode')
  }

  {
    const words12 = TBC.crypto.getMnemonic(128)
    assert(words12.split(' ').length === 12, 'FN: getMnemonic 128')

    const words18 = TBC.crypto.getMnemonic(192)
    assert(words18.split(' ').length === 18, 'FN: getMnemonic 192')

    const words24 = TBC.crypto.getMnemonic(256)
    assert(words24.split(' ').length === 24, 'FN: getMnemonic 256')

    const ed25519_seed = TBC.crypto.getSeedFromWords('ed25519', words24, 'abcdefg')
    const secp256k1_seed = TBC.crypto.getSeedFromWords('secp256k1', words18, 'abcdefg')
    const p256_seed = TBC.crypto.getSeedFromWords('p256', words12)

    assert(ed25519_seed.slice(0,4) === 'edsk' && ed25519_seed.length === 54, 'FN: getSeedFromWords ed25519')
    assert(secp256k1_seed.slice(0,4) === 'spsk' && ed25519_seed.length === 54, 'FN: getSeedFromWords secp256k1')
    assert(p256_seed.slice(0,4) === 'p2sk' && ed25519_seed.length === 54, 'FN: getSeedFromWords p256')
  }

  {
    const hex_key = TBC.codec.getContractHexKey('KT1UynVe2zgSht3QHFUDpWkKvonFrcE1PZ8q')
    assert(hex_key === 'df/bc/db/b1/14/77863511f6ada9978be77b690be14a', 'FN: getContractHexKey')
  }

  {
    const edsig = TBC.crypto.signOperation(new Uint8Array([1,2,3,4,5,6]), 'edskS68LAmi2nQHCEzvMs9CAJaCpWWtkFTavc2DBnxLaNvFerXBgjggKNu9QFPTyT5BuE1ttNbkHj7c3Q4AuPtjaFzfyj4t9un')
    const spsig1 = TBC.crypto.signOperation(new Uint8Array([1,2,3,4,5,6]), 'spsk2nG1XBRvSJmh6BiwcBxox5DpMn4NcRzJakgACsrydqXRhXfBej')
    const p2sig = TBC.crypto.signOperation(new Uint8Array([1,2,3,4,5,6]), 'p2sk2ucp48wneFz9rwDvd4vsoqxNWHe5QTKcfnJ1JAyVJ3y77PgPSr')

    const edsig_prefix = TBC.codec.bs58checkPrefixPick(edsig)
    const spsig1_prefix = TBC.codec.bs58checkPrefixPick(spsig1)
    const p2sig_prefix = TBC.codec.bs58checkPrefixPick(p2sig)

    assert(edsig.length === 99 && edsig_prefix.name === 'ed25519_signature', 'FN: signOperation edsig')
    assert(spsig1.length === 99 && spsig1_prefix.name === 'secp256k1_signature', 'FN: signOperation spsig1')
    assert(p2sig.length === 98 && p2sig_prefix.name === 'p256_signature', 'FN: signOperation p2sig')
  }
}

const main = async () => {
  await fn_tests()
}

main()