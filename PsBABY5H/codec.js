// @flow

const [TextEncoder, TextDecoder] = (() => {
  if (process.env.BROWSER_OPT) {
    return [
      window.TextEncoder,
      window.TextDecoder
    ]
  } else {
    const util = require('util')
    return [
      util.TextEncoder,
      util.TextDecoder
    ]
  }
})()


import BN from 'bn.js'
import bs58check from 'bs58check'
import elliptic from 'elliptic'
import type { Micheline } from '../types'


export function fromHex(x : string) {
  return new Uint8Array(elliptic.utils.toArray(x, 'hex'))
}
export function toHex(x : Uint8Array) {
  return elliptic.utils.toHex(x)
}

export function bytesConcat(x : Uint8Array, y : Uint8Array) {
  const tmp = new Uint8Array(x.length + y.length)
  tmp.set(x, 0)
  tmp.set(y, x.length)
  return tmp
}

export function bs58checkEncode(input : Uint8Array, prefix_info : Uint8Array | string) {
  const prefix_bytes = typeof prefix_info === 'string' ? prefix[prefix_info] : prefix_info
  return bs58check.encode(Buffer.from(bytesConcat(prefix_bytes, input)))
}

export function bs58checkDecode(input : string, prefix? : Uint8Array) {
  return bs58check.decode(input).slice(prefix ? prefix.length : bs58checkPrefixPick(input).bytes.length)
}

export const prefix = {
  block_hash: new Uint8Array([1, 52]), // B(51)
  operation_hash: new Uint8Array([5, 116]), // o(51)
  operation_list_hash: new Uint8Array([133, 233]), // Lo(52)
  operation_list_list_hash: new Uint8Array([29, 159, 109]), // LLo(53)
  protocol_hash: new Uint8Array([2, 170]), // P(51)
  context_hash: new Uint8Array([79, 199]), // Co(52)

  ed25519_public_key_hash: new Uint8Array([6, 161, 159]), // tz1(36)
  secp256k1_public_key_hash: new Uint8Array([6, 161, 161]), // tz2(36)
  p256_public_key_hash: new Uint8Array([6, 161, 164]), // tz3(36)

  cryptobox_public_key_hash: new Uint8Array([153, 103]), // id(30)

  ed25519_seed: new Uint8Array([13, 15, 58, 7]), // edsk(54)
  ed25519_public_key: new Uint8Array([13, 15, 37, 217]), // edpk(54)
  secp256k1_secret_key: new Uint8Array([17, 162, 224, 201]), // spsk(54)
  p256_secret_key: new Uint8Array([16, 81, 238, 189]), // p2sk(54)

  ed25519_encrypted_seed: new Uint8Array([7, 90, 60, 179, 41]), // edesk(88)
  secp256k1_encrypted_secret_key: new Uint8Array([9, 237, 241, 174, 150]), // spesk(88)
  p256_encrypted_secret_key: new Uint8Array([9, 48, 57, 115, 171]), // p2esk(88)

  secp256k1_public_key: new Uint8Array([3, 254, 226, 86]), // sppk(55)
  p256_public_key: new Uint8Array([3, 178, 139, 127]), // p2pk(55)
  secp256k1_scalar: new Uint8Array([38, 248, 136]), // SSp(53)
  secp256k1_element: new Uint8Array([5, 92, 0]), // GSp(54)

  ed25519_secret_key: new Uint8Array([43, 246, 78, 7]), // edsk(98)
  ed25519_signature: new Uint8Array([9, 245, 205, 134, 18]), // edsig(99)
  secp256k1_signature: new Uint8Array([13, 115, 101, 19, 63]), // spsig1(99)
  p256_signature: new Uint8Array([54, 240, 44, 52]), // p2sig(98)
  generic_signature: new Uint8Array([4, 130, 43]), // sig(96)

  chain_id: new Uint8Array([7, 82, 0]), // Net(15)

  contract_hash: new Uint8Array([2, 90, 121]) // KT1(36)
}

export function bs58checkPrefixPick(input : string) : {bytes: Uint8Array, name: string} {
  const prefix_mapping = {
    [15]: {
      Net: 'chain_id'
    },
    [30]: {
      id: 'cryptobox_public_key_hash'
    },
    [36]: {
      tz1: 'ed25519_public_key_hash',
      tz2: 'secp256k1_public_key_hash',
      tz3: 'p256_public_key_hash',
      KT1: 'contract_hash'
    },
    [51]: {
      B: 'block_hash',
      o: 'operation_hash',
      P: 'protocol_hash'
    },
    [52]: {
      Lo: 'operation_list_hash',
      Co: 'context_hash'
    },
    [53]: {
      LLo: 'operation_list_list_hash',
      SSp: 'secp256k1_scalar'
    },
    [54]: {
      edsk: 'ed25519_seed',
      edpk: 'ed25519_public_key',
      spsk: 'secp256k1_secret_key',
      p2sk: 'p256_secret_key',
      GSp: 'secp256k1_element'
    },
    [55]: {
      sppk: 'secp256k1_public_key',
      p2pk: 'p256_public_key'
    },
    [88]: {
      edesk: 'ed25519_encrypted_seed',
      spesk: 'secp256k1_encrypted_secret_key',
      p2esk: 'p256_encrypted_secret_key'
    },
    [96]: {
      sig: 'generic_signature'
    },
    [98]: {
      edsk: 'ed25519_secret_key',
      p2sig: 'p256_signature'
    },
    [99]: {
      edsig: 'ed25519_signature',
      spsig1: 'secp256k1_signature'
    }
  }

  const matched_mapping = prefix_mapping[input.length]
  if (matched_mapping) {
    for (const key in matched_mapping) {
      const len = key.length
      if (input.slice(0, len) === key)
        return {bytes: prefix[matched_mapping[key]], name:matched_mapping[key]} 
    }
  }

  throw `No prefix found for: ${input}`
}

export function getContractHexKey(contract : string) {
  if (contract.length !== 36 || contract.slice(0, 3) !== 'KT1')
    throw `invalid contract: ${contract}`

  const bytes = bs58checkDecode(contract, prefix.contract_hash)
  const hex = toHex(bytes)
  const hex_key = [[0,2], [2,4], [4,6], [6,8], [8,10], [10,undefined]].map(x => hex.slice(x[0], x[1])).join('/')

  return hex_key
}

export const watermark = {
  block_header(chain_id : Uint8Array) {
    return bytesConcat(new Uint8Array([1]), chain_id)
  },
  endorsement(chain_id : Uint8Array) {
    return bytesConcat(new Uint8Array([2]), chain_id)
  },
  operation() {
    return new Uint8Array([3])
  },
  custom(x : Uint8Array) {
    return x
  }
}

const op_mapping = {
  '00':'parameter',
  '01':'storage',
  '02':'code',
  '03':'False',
  '04':'Elt',
  '05':'Left',
  '06':'None',
  '07':'Pair',
  '08':'Right',
  '09':'Some',
  '0A':'True',
  '0B':'Unit',
  '0C':'PACK',
  '0D':'UNPACK',
  '0E':'BLAKE2B',
  '0F':'SHA256',
  '10':'SHA512',
  '11':'ABS',
  '12':'ADD',
  '13':'AMOUNT',
  '14':'AND',
  '15':'BALANCE',
  '16':'CAR',
  '17':'CDR',
  '18':'CHECK_SIGNATURE',
  '19':'COMPARE',
  '1A':'CONCAT',
  '1B':'CONS',
  '1C':'CREATE_ACCOUNT',
  '1D':'CREATE_CONTRACT',
  '1E':'IMPLICIT_ACCOUNT',
  '1F':'DIP',
  '20':'DROP',
  '21':'DUP',
  '22':'EDIV',
  '23':'EMPTY_MAP',
  '24':'EMPTY_SET',
  '25':'EQ',
  '26':'EXEC',
  '27':'FAILWITH',
  '28':'GE',
  '29':'GET',
  '2A':'GT',
  '2B':'HASH_KEY',
  '2C':'IF',
  '2D':'IF_CONS',
  '2E':'IF_LEFT',
  '2F':'IF_NONE',
  '30':'INT',
  '31':'LAMBDA',
  '32':'LE',
  '33':'LEFT',
  '34':'LOOP',
  '35':'LSL',
  '36':'LSR',
  '37':'LT',
  '38':'MAP',
  '39':'MEM',
  '3A':'MUL',
  '3B':'NEG',
  '3C':'NEQ',
  '3D':'NIL',
  '3E':'NONE',
  '3F':'NOT',
  '40':'NOW',
  '41':'OR',
  '42':'PAIR',
  '43':'PUSH',
  '44':'RIGHT',
  '45':'SIZE',
  '46':'SOME',
  '47':'SOURCE',
  '48':'SENDER',
  '49':'SELF',
  '4A':'STEPS_TO_QUOTA',
  '4B':'SUB',
  '4C':'SWAP',
  '4D':'TRANSFER_TOKENS',
  '4E':'SET_DELEGATE',
  '4F':'UNIT',
  '50':'UPDATE',
  '51':'XOR',
  '52':'ITER',
  '53':'LOOP_LEFT',
  '54':'ADDRESS',
  '55':'CONTRACT',
  '56':'ISNAT',
  '57':'CAST',
  '58':'RENAME',
  '59':'bool',
  '5A':'contract',
  '5B':'int',
  '5C':'key',
  '5D':'key_hash',
  '5E':'lambda',
  '5F':'list',
  '60':'map',
  '61':'big_map',
  '62':'nat',
  '63':'option',
  '64':'or',
  '65':'pair',
  '66':'set',
  '67':'signature',
  '68':'string',
  '69':'bytes',
  '6A':'mutez',
  '6B':'timestamp',
  '6C':'unit',
  '6D':'operation',
  '6E':'address',
  '6F':'SLICE',
  '70':'DIG',
  '71':'DUG',
  '72':'EMPTY_BIG_MAP',
  '73':'APPLY',
  '74':'chain_id',
  '75':'CHAIN_ID'
}

const op_mapping_reverse = (() => {
  const result = {}
  for (const key in op_mapping) {
    result[op_mapping[key]] = key
  }
  return result
})()

const prim_mapping = {
  '00': 'int',    
  '01': 'string',             
  '02': 'seq',             
  '03': {name: 'prim', len: 0, annots: false},          
  '04': {name: 'prim', len: 0, annots: true},
  '05': {name: 'prim', len: 1, annots: false},           
  '06': {name: 'prim', len: 1, annots: true},   
  '07': {name: 'prim', len: 2, annots: false},          
  '08': {name: 'prim', len: 2, annots: true},  
  '09': {name: 'prim', len: 3, annots: true},
  '0A': 'bytes'                  
}
const prim_mapping_reverse = {
  [0]: {
    false: '03',
    true: '04'
  },
  [1]: {
    false: '05',
    true: '06'
  },
  [2]: {
    false: '07',
    true: '08'
  },
  [3]: {
    true: '09'
  }
}


export function encodeZarithUInt(value : string) {
  const num = new BN(value, 10)
  const binary = num.toString(2).replace('-', '')
  const pad = binary.length % 7 ? binary.length + 7 - binary.length % 7 : binary.length

  const splitted = binary.padStart(pad, '0').match(/\d{7}/g)
  const reversed = splitted.reverse()

  return reversed.map((x, i) => 
    parseInt((i === reversed.length - 1 ? '0' : '1') + x, 2)
    .toString(16)
    .padStart(2, '0')).join('')
}

export function encodeZarithInt(value : string) {
  const num = new BN(value, 10)
  const positive_mark = num.toString(2)[0] === '-' ? '1' : '0'
  const binary = num.toString(2).replace('-', '')
  const pad = binary.length <= 6 ? 6 : 
    (binary.length - 6) % 7 ? binary.length + 7 - (binary.length - 6) % 7 : binary.length

  const splitted = binary.padStart(pad, '0').match(/\d{6,7}/g)
  const reversed = splitted.reverse()

  reversed[0] = positive_mark + reversed[0]

  return reversed.map((x, i) => 
    parseInt((i === reversed.length - 1 ? '0' : '1') + x, 2)
    .toString(16)
    .padStart(2, '0')).join('')
}

export function toTzStrValue(input : string) {
  const len_mapping = {
    [44]() {
      const tag = input.slice(0, 2)
      if (tag === '00') {
        const tag = input.slice(2, 4)
        const tz_prefix = {
          '00': 'ed25519_public_key_hash', 
          '01': 'secp256k1_public_key_hash', 
          '02': 'p256_public_key_hash'
        }
        return bs58checkEncode(fromHex(input.slice(4)), tz_prefix[tag])

      } else if (tag === '01') {
        return bs58checkEncode(fromHex(input.slice(2, 42)), 'contract_hash')

      } else {
        throw `Invalid tag(${tag}) for contract id`
      }
    },
    [42]() {
      const tag = input.slice(0, 2)
      const tz_prefix = {
        '00': 'ed25519_public_key_hash', 
        '01': 'secp256k1_public_key_hash', 
        '02': 'p256_public_key_hash'
      }
      return bs58checkEncode(fromHex(input.slice(2)), tz_prefix[tag])
    },
    [66]() {
      const tag = input.slice(0, 2)
      if (tag !== '00')
        throw `Invalid tag(${tag}) for Ed25519 public key`

      return bs58checkEncode(fromHex(input.slice(2)), 'ed25519_public_key')
    },
    [68]() {
      const tag = input.slice(0, 2)
      if (tag === '01')
        return bs58checkEncode(fromHex(input.slice(2)), 'secp256k1_public_key')
      else if (tag === '02')
        return bs58checkEncode(fromHex(input.slice(2)), 'p256_public_key')
      else 
        throw `Invalid tag(${tag}) for Secp256k1 and P256 public key`
    }
  }

  try {
    return len_mapping[input.length]()
  } catch(e) {
    throw `Invalid input to decode to Micheline: ${input}`
  }
}

export function toTzBytes(source : string, is_key_hash : boolean = false) {
  const prefix = bs58checkPrefixPick(source)
  const bytes = bs58checkDecode(source, prefix.bytes)

  const tag_mapping = {
    contract_hash: '01',
    ed25519_public_key_hash: is_key_hash ? '00' : '0000',
    secp256k1_public_key_hash: is_key_hash ? '01' : '0001',
    p256_public_key_hash: is_key_hash ? '02' : '0002',
    ed25519_public_key: '00',
    secp256k1_public_key: '01',
    p256_public_key: '02'
  }
  const padding_mapping = {
    contract_hash: '00'
  }

  return (tag_mapping[prefix.name] || '') + toHex(bytes) + (padding_mapping[prefix.name] || '')
}

export function encodeRawBytes(input : Micheline) : string {
  const rec = (input : Micheline) : string => {
    const result : Array<string> = []

    if (input instanceof Array) {
      result.push('02')
      const bytes = input.map(x => rec(x)).join('')
      const len = bytes.length / 2
      result.push(len.toString(16).padStart(8, '0'))
      result.push(bytes)

    } else if (input instanceof Object) {
      if (input.prim) {

        if (input.prim === 'LAMBDA') {
          result.push('09')
          result.push(op_mapping_reverse[input.prim])
          if (input.args) {
            const inner_result = []
            input.args.forEach(arg => {
              inner_result.push(rec(arg))
            })
            const len = inner_result.join('').length / 2
            result.push(len.toString(16).padStart(8, '0'))
            inner_result.forEach(x => result.push(x))
          }

          const annots_bytes = input.annots 
            ? input.annots.map(x => toHex(new TextEncoder().encode(x))).join('20')
            : ''

          result.push((annots_bytes.length / 2).toString(16).padStart(8, '0'))
          annots_bytes && result.push(annots_bytes)

        } else {
          const args_len = input.args ? input.args.length : 0
          result.push(prim_mapping_reverse[args_len][!!input.annots])
          result.push(op_mapping_reverse[input.prim])
          if (input.args) {
            input.args.forEach(arg => {
              result.push(rec(arg))
            })
          }

          if (input.annots) {
            const annots_bytes = input.annots.map(x => 
              toHex(new TextEncoder().encode(x))).join('20')
            result.push((annots_bytes.length / 2).toString(16).padStart(8, '0'))
            result.push(annots_bytes)
          }
        }


      } else if (input.bytes || 
                 input.address || 
                 input.contract || 
                 input.key || 
                 input.key_hash ||
                 input.signature) {

        const bytes = input.bytes || 
          toTzBytes(input.address || 
                    input.contract || 
                    input.key || 
                    input.key_hash ||
                    input.signature, input.key_hash)

        const len = bytes.length / 2
        result.push('0A')
        result.push(len.toString(16).padStart(8, '0'))
        result.push(bytes)

      } else if (input.int) {

        const num_hex = encodeZarithInt(input.int)
        result.push('00')
        result.push(num_hex)

      } else if (input.string) {

        const string_bytes = new TextEncoder().encode(input.string)
        const string_hex = [].slice.call(string_bytes).map(x => x.toString(16).padStart(2, '0')).join('')
        const len = string_bytes.length
        result.push('01')
        result.push(len.toString(16).padStart(8, '0'))
        result.push(string_hex)

      }
    }

    return result.join('')
  }

  return rec(input).toUpperCase()
}

export function decodeRawBytes(bytes : string) : Micheline {
  bytes = bytes.toUpperCase()
  
  let index = 0

  const read = len => bytes.slice(index, index + len)

  const rec = () => {
    const b = read(2)
    const prim = prim_mapping[b]
    
    if (prim instanceof Object) {

      index += 2
      const op = op_mapping[read(2)]
      index += 2

      if (op === 'LAMBDA') 
        index += 8

      const args = Array.apply(null, new Array(prim.len))
      const result = {prim: op, args: args.map(() => rec()), annots: undefined}

      if (!prim.len)
        delete result.args

      if (prim.annots) {
        const annots_len = parseInt(read(8), 16) * 2
        index += 8

        const string_hex_lst = read(annots_len).match(/[\dA-F]{2}/g)
        index += annots_len
        
        if (string_hex_lst) {
          const string_bytes = new Uint8Array(string_hex_lst.map(x => parseInt(x, 16)))
          const string_result = new TextDecoder('utf-8').decode(string_bytes)
          result.annots = string_result.split(' ')
        }
      } else {
        delete result.annots
      }

      return result

    } else {
      if (b === '0A') {

        index += 2
        const len = read(8)
        index += 8
        const int_len = parseInt(len, 16) * 2
        const data = read(int_len)
        index += int_len
        return {bytes: data}

      } else if (b === '01') {
        index += 2
        const len = read(8)
        index += 8
        const int_len = parseInt(len, 16) * 2
        const data = read(int_len)
        index += int_len

        const match_result = data.match(/[\dA-F]{2}/g)
        if (match_result instanceof Array) {
          const string_raw = new Uint8Array(match_result.map(x => parseInt(x, 16)))
          return {string: new TextDecoder('utf-8').decode(string_raw)}
        } else {
          throw `Input bytes error`
        }

      } else if (b === '00') {
        index += 2

        const first_bytes = parseInt(read(2), 16).toString(2).padStart(8, '0')
        index += 2
        const is_positive = first_bytes[1] === '0'

        const valid_bytes = [first_bytes.slice(2)]

        let checknext = first_bytes[0] === '1'
        while (checknext) {
          const bytes = parseInt(read(2), 16).toString(2).padStart(8, '0')
          index += 2

          valid_bytes.push(bytes.slice(1))
          checknext = bytes[0] === '1'
        }

        const num = new BN(valid_bytes.reverse().join(''), 2)
        return {int: num.toString(10)}
      } else if (b === '02') {
        index += 2

        const len = read(8)
        index += 8
        const int_len = parseInt(len, 16) * 2
        const data = read(int_len)
        const limit = index + int_len

        const seq_lst = []
        while (limit > index) {
          seq_lst.push(rec())
        }
        return seq_lst
      }

    }

    throw `Invalid raw bytes: Byte:${b} Index:${index}`
  }

  return rec()
}

export default {
  fromHex,
  toHex,
  toTzBytes,
  toTzStrValue,
  prefix,
  watermark,
  bs58checkEncode,
  bs58checkDecode,
  bs58checkPrefixPick,
  getContractHexKey,
  bytesConcat,
  encodeRawBytes,
  decodeRawBytes,
  encodeZarithInt,
  encodeZarithUInt
}