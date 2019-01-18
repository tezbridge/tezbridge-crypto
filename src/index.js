// @flow

import PsddFKi3_codec from './PsddFKi3/codec'
import PsddFKi3_crypto from './PsddFKi3/crypto'

const protocol_mapping = {
  PsddFKi3: {
    codec: PsddFKi3_codec,
    crypto: PsddFKi3_crypto
  }
}

const export_fns = {
  codec: protocol_mapping.PsddFKi3.codec,
  crypto: protocol_mapping.PsddFKi3.crypto,
  modProtocol(protocol : string) {
    if (protocol in protocol_mapping) {
      export_fns.codec = protocol_mapping[protocol].codec
      export_fns.crypto = protocol_mapping[protocol].crypto
    } else {
      throw `Protocol:${protocol} doesn't exist in protocols`
    }
  }
}

export default export_fns