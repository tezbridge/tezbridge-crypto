// @flow

import codec from './codec'

const op_hex_mapping = {
	transaction() {

	},
	origination() {

	},
	reveal() {

	}
}

export function forgeOperation(branch: string, contents: Array<Object>) {
	const branch_bytes = codec.bs58checkDecode(branch)
	const result = [codec.toHex(branch_bytes)]

	contents.forEach(op => {
		const op_hex = op_hex_mapping[op.kind]()
	})

}

export default {

}