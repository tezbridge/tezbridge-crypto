// @flow

import type { TezJSON } from './types'

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
}

const prim_mapping = {
  '00': 'int',    
  '01': 'string',             
  '02': 'seq',             
  '03': {name: 'prim', len: 0, annot: false},          
  '04': {name: 'prim', len: 0, annot: true},
  '05': {name: 'prim', len: 1, annot: false},           
  '06': {name: 'prim', len: 1, annot: true},   
  '07': {name: 'prim', len: 2, annot: false},          
  '08': {name: 'prim', len: 2, annot: true},  
  '09': {name: 'prim', len: 3, annot: true},
  '0A': 'bytes'                  
}

export function decodeBytes(bytes : string) : TezJSON {
  bytes = bytes.toUpperCase()
  
  let index = 0

  const read = len => bytes.slice(index, index + len)

  const walk = () => {
    const b = read(2)
    const prim = prim_mapping[b]
    
    if (prim instanceof Object) {

      index += 2
      const op = op_mapping[read(2)]
      index += 2

      const args = Array.apply(null, new Array(prim.len))
      return {prim: op, args: args.map(() => walk())}

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
          throw "Input bytes error"
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

        return {int: parseInt(valid_bytes.reverse().join(''), 2).toString()}
      } else if (b === '02') {
        index += 2

        const len = read(8)
        index += 8
        const int_len = parseInt(len, 16) * 2
        const data = read(int_len)
        const limit = index + int_len

        const seq_lst = []
        while (limit > index) {
          seq_lst.push(walk())
        }
        return seq_lst
      }

    }

  }

  return walk()
}

