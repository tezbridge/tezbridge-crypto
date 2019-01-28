// @flow

import codec from './codec'

const tag_mapping = {
  ed25519_public_key_hash: '00',
  secp256k1_public_key_hash: '01',
  p256_public_key_hash: '02',

  ed25519_public_key: '00',
  secp256k1_public_key: '01',
  p256_public_key: '02'
}

function pushContractId(arr : Array<string>, prefix, bytes) {
  if (prefix.name === 'contract_hash') {
    arr.push('01')
    arr.push(codec.toHex(bytes))
    arr.push('00')
  } else {
    arr.push('00')
    arr.push(tag_mapping[prefix.name])
    arr.push(codec.toHex(bytes))
  }
}

const op_hex_mapping = {
  transaction(op : Object) {
    const result = ['08']
    const source_prefix = codec.bs58checkPrefixPick(op.source)
    const dest_prefix = codec.bs58checkPrefixPick(op.destination)
    const source_bytes = codec.bs58checkDecode(op.source, source_prefix.bytes)
    const dest_bytes = codec.bs58checkDecode(op.destination, dest_prefix.bytes)
  
    pushContractId(result, source_prefix, source_bytes)

    ;[op.fee, op.counter, op.gas_limit, op.storage_limit, op.amount].forEach(x => {
      const hex = codec.encodeZarithUInt(x)
      result.push(hex)
    })

    pushContractId(result, dest_prefix, dest_bytes)

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
    const source_prefix = codec.bs58checkPrefixPick(op.source)
    const source_bytes = codec.bs58checkDecode(op.source, source_prefix.bytes)
    const managerpkh_prefix = codec.bs58checkPrefixPick(op.managerPubkey)
    const managerpkh_bytes = codec.bs58checkDecode(op.managerPubkey, managerpkh_prefix.bytes)

    pushContractId(result, source_prefix, source_bytes)

    ;[op.fee, op.counter, op.gas_limit, op.storage_limit].forEach(x => {
      const hex = codec.encodeZarithUInt(x)
      result.push(hex)
    })

    result.push(tag_mapping[managerpkh_prefix.name])
    result.push(codec.toHex(managerpkh_bytes))

    result.push(codec.encodeZarithUInt(op.balance))

    result.push(op.spendable ? 'FF' : '00')
    result.push(op.delegatable ? 'FF' : '00')
    result.push(op.delegate ? 'FF' : '00')
    if (op.delegate) {
      const delegate_prefix = codec.bs58checkPrefixPick(op.delegate)
      const delegate_bytes = codec.bs58checkDecode(op.delegate, delegate_prefix.bytes)

      result.push(tag_mapping[delegate_prefix.name])
      result.push(codec.toHex(delegate_bytes))
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
    const source_prefix = codec.bs58checkPrefixPick(op.source)
    const source_bytes = codec.bs58checkDecode(op.source, source_prefix.bytes)
    const pk_prefix = codec.bs58checkPrefixPick(op.public_key)
    const pk_bytes = codec.bs58checkDecode(op.public_key, pk_prefix.bytes)

    pushContractId(result, source_prefix, source_bytes)

    ;[op.fee, op.counter, op.gas_limit, op.storage_limit].forEach(x => {
      const hex = codec.encodeZarithUInt(x)
      result.push(hex)
    })

    result.push(tag_mapping[pk_prefix.name])
    result.push(codec.toHex(pk_bytes))

    return result.join('')
  }
}

export function forgeOperation(branch : string, contents : Array<Object>) {
  const branch_bytes = codec.bs58checkDecode(branch)
  const result = [codec.toHex(branch_bytes)]

  contents.forEach(op => {
    const op_hex = op_hex_mapping[op.kind](op)
    result.push(op_hex)
  })

  return result.join('').toLowerCase()
}

export default {
  forgeOperation
}