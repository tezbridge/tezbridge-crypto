// @flow

import codec from './codec'

function tagEncode(input : Uint8Array, prefix : string) {
	const tag_mapping = {
		ed25519_public_key_hash: '01',
		secp256k1_public_key_hash: '02',
		p256_public_key_hash: '03'
	}

	if (!tag_mapping[prefix])
		throw `Prefix: ${prefix} not found`

	return tag_mapping[prefix] + codec.toHex(input)
}

const op_hex_mapping = {
	transaction(op : Object) {
		const result = [80]
		
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
		const op_hex = op_hex_mapping[op.kind]()
	})

}

export default {

}