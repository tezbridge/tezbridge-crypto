// @flow

import BN from 'bn.js'
import codec from './codec'

const entries = [
  'default',
  'root',
  'do',
  'set_delegate',
  'remove_delegate'
]

const entrypoint_mapping = {}
const entrypoint_mapping_reverse = {}

entries.forEach((x, index) => {
  const key = index.toString(16).toUpperCase().padStart(2, '0')
  entrypoint_mapping[key] = x
  entrypoint_mapping_reverse[x] = key
})


const op_hex2bytes = {
  transaction(op : Object) {
    const result = ['6c']
  
    result.push(codec.toTzBytes(op.source, true))

    ;[op.fee, op.counter, op.gas_limit, op.storage_limit, op.amount].forEach(x => {
      const hex = codec.encodeZarithUInt(x)
      result.push(hex)
    })

    result.push(codec.toTzBytes(op.destination))

    const is_default_parameter = op.parameters.entrypoint === entries[0]
    result.push(is_default_parameter ? '00' : 'FF')
    if (!is_default_parameter) {
      const parameter_bytes = codec.encodeRawBytes(op.parameters.value)

      if (entrypoint_mapping_reverse[op.parameters.entrypoint]){
        result.push(entrypoint_mapping_reverse[op.parameters.entrypoint])
      } else {
        const string_bytes = codec.encodeRawBytes({string: op.parameters.entrypoint})
        result.push('FF')
        result.push(string_bytes.slice(8))
      }

      result.push((parameter_bytes.length / 2).toString(16).padStart(8, '0'))
      result.push(parameter_bytes)
    }

    return result.join('')
  },
  origination(op : Object) {
    const result = ['6d']

    result.push(codec.toTzBytes(op.source, true))

    ;[op.fee, op.counter, op.gas_limit, op.storage_limit].forEach(x => {
      const hex = codec.encodeZarithUInt(x)
      result.push(hex)
    })

    // result.push(codec.toTzBytes(op.manager_pubkey, true))

    result.push(codec.encodeZarithUInt(op.balance))

    // result.push(op.spendable ? 'FF' : '00')
    // result.push(op.delegatable ? 'FF' : '00')
    result.push(op.delegate ? 'FF' : '00')
    if (op.delegate) {
      result.push(codec.toTzBytes(op.delegate, true))
    }

    // result.push(op.script ? 'FF' : '00')
    if (op.script && op.script.code && op.script.storage) {
      const code = codec.encodeRawBytes(op.script.code)
      result.push((code.length / 2).toString(16).padStart(8, '0'))
      result.push(code)

      const storage = codec.encodeRawBytes(op.script.storage)
      result.push((storage.length / 2).toString(16).padStart(8, '0'))
      result.push(storage)
    }

    return result.join('')
  },
  delegation(op : Object) {
    const result = ['6e']

    result.push(codec.toTzBytes(op.source, true))

    ;[op.fee, op.counter, op.gas_limit, op.storage_limit].forEach(x => {
      const hex = codec.encodeZarithUInt(x)
      result.push(hex)
    })

    result.push(op.delegate ? 'FF' : '00')
    if (op.delegate) {
      result.push(codec.toTzBytes(op.delegate, true))
    }

    return result.join('')
  },
  reveal(op : Object) {
    const result = ['6b']

    result.push(codec.toTzBytes(op.source, true))

    ;[op.fee, op.counter, op.gas_limit, op.storage_limit].forEach(x => {
      const hex = codec.encodeZarithUInt(x)
      result.push(hex)
    })

    result.push(codec.toTzBytes(op.public_key, true))

    return result.join('')
  }
}

export function forgeOperation(contents : Array<Object>, branch : string) {
  const branch_bytes = codec.bs58checkDecode(branch)
  const result = [codec.toHex(branch_bytes)]

  contents.forEach(op => {
    if (!op_hex2bytes[op.kind])
      throw `Only support reveal(6b), transaction(6c), origination(6d) and delegation(6e) operations.\nBut current operation is ${op.kind}`

    const op_hex = op_hex2bytes[op.kind](op)
    result.push(op_hex)
  })

  return result.join('').toLowerCase()
}

export function parseOperationBytes(input : string) {
  input = input.slice(64).toUpperCase()

  let index = 0

  const read = len => {
    const result = input.slice(index, len ? index + len : undefined)
    index += len
    return result
  }

  const readUInt = () => {
    const first_bytes = parseInt(read(2), 16).toString(2).padStart(8, '0')
    const valid_bytes = [first_bytes.slice(1)]

    let checknext = first_bytes[0] === '1'
    while (checknext) {
      const bytes = parseInt(read(2), 16).toString(2).padStart(8, '0')

      valid_bytes.push(bytes.slice(1))
      checknext = bytes[0] === '1'
    }

    const num = new BN(valid_bytes.reverse().join(''), 2)
    return num.toString(10)
  }

  const output = []
  while(index < input.length - 1) {
    const op_tag = read(2)

    if (op_tag === '6b') {
      const source = codec.toTzStrValue(read(44))
      const fee = readUInt()
      const counter = readUInt()
      const gas_limit = readUInt()
      const storage_limit = readUInt()
      const public_key = codec.toTzStrValue(read())

      output.push({
        kind: 'reveal',
        source,
        fee,
        counter,
        gas_limit,
        storage_limit,
        public_key
      })

    } else if (op_tag === '6c') {
      const source = codec.toTzStrValue(read(44))
      const fee = readUInt()
      const counter = readUInt()
      const gas_limit = readUInt()
      const storage_limit = readUInt()
      const amount = readUInt()
      const destination = codec.toTzStrValue(read(44))
      let parameters
      if (read(2) === 'FF') {
        const entrypoint_mark = read(2)
        if (entrypoint_mark === 'FF') {
          const size_byte = read(2)
          const size = parseInt(size_byte, 16)
          const entrypoint_bytes = read(size * 2)
          const entrypoint = codec.decodeRawBytes('01000000' + size_byte + entrypoint_bytes)

          const len = parseInt(read(8), 16) * 2
          parameters = {
            entrypoint: entrypoint.string || '',
            value: codec.decodeRawBytes(read(len))
          }
        } else {
          const entrypoint = entrypoint_mapping[entrypoint_mark]
          const len = parseInt(read(8), 16) * 2
          parameters = {
            entrypoint,
            value: codec.decodeRawBytes(read(len))
          }
        }

      }

      output.push({
        kind: 'transaction',
        source,
        fee,
        counter,
        gas_limit,
        storage_limit,
        amount,
        destination,
        parameters
      })
    } else if (op_tag === '6d') {
      const source = codec.toTzStrValue(read(44))
      const fee = readUInt()
      const counter = readUInt()
      const gas_limit = readUInt()
      const storage_limit = readUInt()
      // const manager_pubkey = codec.toTzStrValue(read(42))
      const balance = readUInt()
      // const spendable = read(2) === '00' ? false : true
      // const delegatable = read(2) === '00' ? false : true
      const delegate = read(2) === '00' ? undefined : codec.toTzStrValue(read(42))

      const code_len = parseInt(read(8), 16) * 2
      const code = codec.decodeRawBytes(read(code_len))

      const storage_len = parseInt(read(8), 16) * 2
      const storage = codec.decodeRawBytes(read(storage_len))
      const script = {code, storage}

      output.push({
        kind: 'origination',
        source,
        fee,
        counter,
        gas_limit,
        storage_limit,
        // manager_pubkey,
        balance,
        // spendable,
        // delegatable,
        delegate,
        script
      })
    } else if (op_tag === '6e') {

      const source = codec.toTzStrValue(read(44))
      const fee = readUInt()
      const counter = readUInt()
      const gas_limit = readUInt()
      const storage_limit = readUInt()
      const delegate = read(2) === '00' ? undefined : codec.toTzStrValue(read(42))

      output.push({
        kind: 'delegation',
        source,
        fee,
        counter,
        gas_limit,
        storage_limit,
        delegate
      })

    } else {
      throw `Only support reveal(6b), transaction(6c), origination(6d) and delegation(6e) tags.\nBut current tag is ${op_tag} at index: ${index}`
    }

  }

  return output
}

export default {
  forgeOperation,
  parseOperationBytes
}