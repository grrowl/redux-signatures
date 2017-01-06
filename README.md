
# redux-scuttlebutt-signatures

This will sign redux actions for you cryptographically.

Read more at [redux-scuttlebutt](https://github.com/grrowl/redux-scuttlebutt)

## signatures

* *Ed25519*: So far the only one implemented.

## use

* `verifyAction(identity) => (dispatch, action)`:
  calls `dispatch(action)` if `action` is valid
* `signAction(identity) => (dispatch, action)` or
  `signActionMiddleware(identity) => (dispatch) => (action)`
  calls `dispatch` with `action`, with publicKey and signature added

## actual use

* `createStore(reducer, initialState, signatures(new Ed25519()))`
  - every dispatched action will either have no sign information
    (in which case sign)
  - or has sign information
    (in which case validate)
  - queue any dispatches until key is generated
  - @@INIT will get signed on dispatch
  - (neg) if someone dispatches a non-signed action, it'll get signed by us nooooo
    - this is possible with redux-scuttlebutt. we need to differentiate between /locally/ dispatched actions and /remotely/
    - which means back to integration with rx-sb

### style 2

* class
  - `const key = new Ed25519(<privKey>)`
  - key.privateKey -> privKey
  - privKey can derive pubKey!
* or more static
  - `Ed25519 from 'redux-signatures/ed25519'`
  - `{ signAction, verifyAction } from 'redux-signatures'`
  - `const key = generateKey()` // has to hold pub, priv, and a func
* `scuttlebutt({ ... })`
  - `sign: signAction(key)`
  - `verify: verifyAction(verifyKey)`
* "key" functions must hold enough info to
  - sign: with (pubKey & privKey),
  - verify ()

this is hard; obvs we should make this less "pluggable" and interate.

### style 3 💸

```js
const { ed25519, signAction, verifyAction } from 'redux-signatures'

// create the key object
const key = new Ed25519(localStorage['privateKey'])

key.sign = (message) => string
key.verify = (message, signature, pubKey) => bool
key.publicKey = () => string
key.privateKey = () => null

signAction(key, action) // packs message, calls key.sign, returns action w/ sig and pubkey
verifyAction(key, action) // needs to know it's a `ed25519`... later.
// for now can just call static ed25519.verify(message, signature, pubKey)
// in future we might prepend the sig type to the sig itself

hook it like:
signAction.bind(key)
verifyAction.bind(key)
```

## roadmap

* investigate better random implementation (brorand)
*

## design challenges

We want to share the `identity` state between:

* scuttlebutt (dispatcherConfig) at application root
* whoever is calling signMessage or dispatch (or enhancer)
* redux state (reducer)

## licence

MIT.
