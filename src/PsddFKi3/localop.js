// @flow

import BN from 'bn.js'
import codec from './codec'


const op_hex2bytes = {
  transaction(op : Object) {
    const result = ['08']
  
    result.push(codec.toTzBytes(op.source))

    ;[op.fee, op.counter, op.gas_limit, op.storage_limit, op.amount].forEach(x => {
      const hex = codec.encodeZarithUInt(x)
      result.push(hex)
    })

    result.push(codec.toTzBytes(op.destination))

    result.push(op.parameters ? 'FF' : '00')
    if (op.parameters) {
      const parameters = codec.encodeRawBytes(op.parameters)
      result.push((parameters.length / 2).toString(16).padStart(8, '0'))
      result.push(parameters)
    }

    return result.join('')
  },
  origination(op : Object) {
    const result = ['09']

    result.push(codec.toTzBytes(op.source))

    ;[op.fee, op.counter, op.gas_limit, op.storage_limit].forEach(x => {
      const hex = codec.encodeZarithUInt(x)
      result.push(hex)
    })

    result.push(codec.toTzBytes(op.managerPubkey, true))

    result.push(codec.encodeZarithUInt(op.balance))

    result.push(op.spendable ? 'FF' : '00')
    result.push(op.delegatable ? 'FF' : '00')
    result.push(op.delegate ? 'FF' : '00')
    if (op.delegate) {
      result.push(codec.toTzBytes(op.delegate, true))
    }

    result.push(op.script ? 'FF' : '00')
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
  reveal(op : Object) {
    const result = ['07']

    result.push(codec.toTzBytes(op.source))

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

    if (op_tag === '07') {
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

    } else if (op_tag === '08') {
      const source = codec.toTzStrValue(read(44))
      const fee = readUInt()
      const counter = readUInt()
      const gas_limit = readUInt()
      const storage_limit = readUInt()
      const amount = readUInt()
      const destination = codec.toTzStrValue(read(44))
      let parameters
      if (read(2) === 'FF') {
        const len = parseInt(read(8), 16) * 2
        parameters = codec.decodeRawBytes(read(len))
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
    } else if (op_tag === '09') {
      const source = codec.toTzStrValue(read(44))
      const fee = readUInt()
      const counter = readUInt()
      const gas_limit = readUInt()
      const storage_limit = readUInt()
      const managerPubkey = codec.toTzStrValue(read(42))
      const balance = readUInt()
      const spendable = read(2) === '00' ? false : true
      const delegatable = read(2) === '00' ? false : true
      const delegate = read(2) === '00' ? undefined : codec.toTzStrValue(read(42))
      let script
      if (read(2) === 'FF') {
        const code_len = parseInt(read(8), 16) * 2
        const code = codec.decodeRawBytes(read(code_len))

        const storage_len = parseInt(read(8), 16) * 2
        const storage = codec.decodeRawBytes(read(storage_len))
        script = {code, storage}
      }

      output.push({
        kind: 'origination',
        source,
        fee,
        counter,
        gas_limit,
        storage_limit,
        managerPubkey,
        balance,
        spendable,
        delegatable,
        delegate,
        script
      })
    } else {
      throw `Only support reveal(07), transaction(08) and origination(09) tags.\nBut current tag is ${op_tag} at index: ${index}`
    }

  }

  return output
}

export default {
  forgeOperation,
  parseOperationBytes
}