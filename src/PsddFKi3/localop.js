// @flow

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

export default {
  forgeOperation
}