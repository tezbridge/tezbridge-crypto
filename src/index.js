// @flow

import PsddFKi3_codec from './PsddFKi3/codec'
import PsddFKi3_crypto from './PsddFKi3/crypto'
import PsddFKi3_localop from './PsddFKi3/localop'

const protocol_mapping = {
  PsddFKi3: {
    codec: PsddFKi3_codec,
    crypto: PsddFKi3_crypto,
    localop: PsddFKi3_localop
  }
}

const export_fns = {
  codec: protocol_mapping.PsddFKi3.codec,
  crypto: protocol_mapping.PsddFKi3.crypto,
  localop: protocol_mapping.PsddFKi3.localop,
  
  modProtocol(protocol : string) {
    if (protocol in protocol_mapping) {
      export_fns.codec = protocol_mapping[protocol].codec
      export_fns.crypto = protocol_mapping[protocol].crypto
      export_fns.localop = protocol_mapping[protocol].localop
    } else {
      throw `Protocol:${protocol} doesn't exist in protocols`
    }
  }
}

export default export_fns