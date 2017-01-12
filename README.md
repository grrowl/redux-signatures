# redux-signatures

Signs redux (or flux) actions for you cryptographically.

Designed for use with
[redux-scuttlebutt](https://github.com/grrowl/redux-scuttlebutt)

This is very much a work in progress. Contributions, suggestions and questions
welcome.

## signatures

* *[Ed25519](https://ed25519.cr.yp.to/)*:
  "High speed, high security signatures". On my machine, signs in 1ms, verifies
  in 6ms.
  * Sign actions against a public key
  * Verifies actions against their signature and a public key (author)
  * Secure against modification, but not omission.

## use

### sign and verify

For `import { verifyAction, signAction } from 'redux-signatures'`,

* `verifyAction(identity, dispatch, action)`:
  calls `dispatch(true)` if `action` is valid, `dispatch(false)` otherwise.
* `signAction(identity, dispatch, action)`:
  calls `dispatch` with `action`, with publicKey and signature added to the
  `meta` key
  * publicKey and signature constants are exported as `META_PUBLIC_KEY` and
  `META_SIGNATURE` respectively.

### identity

For `import { Ed25519 } from 'redux-signatures'`,

* `identity = new Ed25519()`:
  generates a new Ed25519 identity.
* `identity = new Ed25519(privateKey)`:
  recreates an existing or stored Ed25519 identity.

### example

```js
const { Ed25519, signAction, verifyAction } from 'redux-signatures'

// create the identity object with a random key.
const identity = new Ed25519()

// identity.sign = (action) => signature: string
// identity.verify = (action, signature, pubKey) => valid: bool
// identity.publicKey = () => hex: string
// identity.privateKey = () => hex: string

// serialise action, calls identity.sign, returns action with signature
signAction(identity, callback, action)
// serialise action, calls identity.verify with the action and its included signature
verifyAction(identity, callback, action)

// maintain identity
const identity = new Ed25519(localStorage['privateKey'])
localStorage['privateKey'] = identity.privateKey

// now the app can render the local identity
const initialState = {
  identity: identity.publicKey,
}

// for use with redux-scuttlebutt
return createStore(rootReducer, initialState, scuttlebutt({
  verifyAsync: verifyAction.bind(undefined, identity),
  signAsync: signAction.bind(undefined, identity),
}))
```

## roadmap

* investigate better random implementation (`brorand`)
* more signature types

## licence

MIT.
