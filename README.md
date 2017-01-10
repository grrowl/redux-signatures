# redux-signatures

Signs redux (or flux) actions for you cryptographically.

Designed for use with
[redux-scuttlebutt](https://github.com/grrowl/redux-scuttlebutt)

This is very much a work in progress, the API will change suddenly and without
notice.

## signatures available

* *[Ed25519](https://ed25519.cr.yp.to/)*
  So far the only one implemented. Works p good, signs in 1ms, verifies in 6ms.

## use

* `verifyAction(identity) => (dispatch, action)`:
  calls `dispatch(action)` if `action` is valid
* `signAction(identity) => (dispatch, action)` or
  `signActionMiddleware(identity) => (dispatch) => (action)`
  calls `dispatch` with `action`, with publicKey and signature added

### style 3 💸

```js
const { Ed25519, signAction, verifyAction } from 'redux-signatures'

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
* more signature types

## design challenges

We want to share the `identity` state between:

* scuttlebutt (dispatcherConfig) at application root
* whoever is calling signMessage or dispatch (or enhancer)
* redux state (reducer)

## licence

MIT.
