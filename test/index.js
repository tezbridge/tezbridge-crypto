// @flow

import TezBridgeCrypto from './../src/index'
import { assert } from './util'

const fn_tests = async () => {
  {
    const r = TezBridgeCrypto.codec.decodeBytes('07070a0000001601b2a4f12006b191111b11faa0a126bcddded861de0007070a000000160000f9a61eefd5d12786e70433b1edc846ac9eb5fcd60707030a0707009503070700a3db97010000')
    const answer = '{"prim":"Pair","args":[{"bytes":"01B2A4F12006B191111B11FAA0A126BCDDDED861DE00"},{"prim":"Pair","args":[{"bytes":"0000F9A61EEFD5D12786E70433B1EDC846AC9EB5FCD6"},{"prim":"Pair","args":[{"prim":"True","args":[]},{"prim":"Pair","args":[{"int":"213"},{"prim":"Pair","args":[{"int":"1242851"},{"int":"0"}]}]}]}]}]}'
    assert(JSON.stringify(r) === answer, 'FN: decodeBytes')
  }
}

const main = async () => {
  await fn_tests()
}

main()