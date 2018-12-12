// @flow

import TezBridgeCrypto from './../src/index'
import { assert } from './util'

const TBCrypto = TezBridgeCrypto

const fn_tests = async () => {
  {
    const r = TBCrypto.codec.decodeRawBytes('07070a0000001601b2a4f12006b191111b11faa0a126bcddded861de0007070a000000160000f9a61eefd5d12786e70433b1edc846ac9eb5fcd60707030a0707009503070700a3db97010000')
    const answer = '{"prim":"Pair","args":[{"bytes":"01B2A4F12006B191111B11FAA0A126BCDDDED861DE00"},{"prim":"Pair","args":[{"bytes":"0000F9A61EEFD5D12786E70433B1EDC846AC9EB5FCD6"},{"prim":"Pair","args":[{"prim":"True","args":[]},{"prim":"Pair","args":[{"int":"213"},{"prim":"Pair","args":[{"int":"1242851"},{"int":"0"}]}]}]}]}]}'
    assert(JSON.stringify(r) === answer, 'FN: decodeRawBytes')
  }

  {
    const a1 = new Uint8Array([])
    const a2 = new Uint8Array([1])
    const a3 = new Uint8Array([2, 255])
    {
      const r = TBCrypto.codec.bytesConcat(a1, a1)
      assert(r.length === 0, 'FN: bytesConcat empty with empty')
    }
    {
      const r = TBCrypto.codec.bytesConcat(a1, a2)
      assert(r.length === 1 && r[0] === 1, 'FN: bytesConcat empty with non-empty')
    }
    {
      const r = TBCrypto.codec.bytesConcat(a2, a3)
      assert(r.length === 3 && r[0] === 1 && r[1] === 2 && r[2] === 255, 
             'FN: bytesConcat non-empty with non-empty')
    }
  }

  {
    const source = 'tz1TUswtLE1cTBgoBC2JAtQ5Jsz2crp1tZvJ'
    const prefix = TBCrypto.codec.prefix.ed25519_public_key_hash
    const bytes = TBCrypto.codec.bs58check_decode(prefix, source)
    assert(bytes.length === 20, 'FN: bs58check_decode')
    const str = TBCrypto.codec.bs58check_encode(prefix, bytes)
    assert(str === source, 'FN: bs58check_encode')
  }

}

const main = async () => {
  await fn_tests()
}

main()