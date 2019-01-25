// @flow

import codec from './codec'

const tag_mapping = {
	ed25519_public_key_hash: '00',
	secp256k1_public_key_hash: '01',
	p256_public_key_hash: '02'
}

const op_hex_mapping = {
	transaction(op : Object) {
		const result = ['08']
		const source_prefix = codec.bs58checkPrefixPick(op.source)
		const dest_prefix = codec.bs58checkPrefixPick(op.destination)
		const source_bytes = codec.bs58checkDecode(op.source, source_prefix.bytes)
		const dest_bytes = codec.bs58checkDecode(op.destination, dest_prefix.bytes)
	
		result.push('00')
		result.push(tag_mapping[source_prefix.name])
		result.push(codec.toHex(source_bytes))

		;[op.fee, op.counter, op.gas_limit, op.storage_limit, op.amount].forEach(x => {
			const hex = codec.encodeZarithUInt(x)
			result.push(hex)
		})

		result.push('00')
		result.push(tag_mapping[dest_prefix.name])
		result.push(codec.toHex(dest_bytes))

		result.push(op.parameters ? 'FF' : '00')
		if (op.parameters) {
			const parameters = codec.encodeRawBytes(op.parameters)
			result.push((parameters.length / 2).toString(16).padStart(8, '0'))
			result.push(parameters)
		}

		return result.join('')
	},
	origination(op : Object) {

	},
	reveal(op : Object) {

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