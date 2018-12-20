// @flow

export type TezJSON =
| number
| string
| boolean
| void
| {[string]: TezJSON}
| Array<TezJSON>

export type Micheline = 
| {
  prim: string,
  args?: Array<Micheline>,
  annots?: Array<string>
}
| {bytes: string}
| {int: string}
| {string: string}
| Array<Micheline>
