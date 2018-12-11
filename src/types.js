// @flow

export type TezJSON =
| number
| string
| boolean
| void
| {[string]: TezJSON}
| Array<TezJSON>