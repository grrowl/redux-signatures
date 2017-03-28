# redux-signatures

Signs redux (or flux) actions for you cryptographically.

Designed for use with
[redux-scuttlebutt](https://github.com/grrowl/redux-scuttlebutt)

Contributions, suggestions and questions welcome.

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

* `verifyAction(identity, callback, action)`:
  calls `callback(true)` if `action` is valid, `callback(false)` otherwise.
  * usually `callback` is a `redux` store `dispatch`
* `signAction(identity, callback, action)`:
  calls `callback` with `action`, with publicKey and signature added to the
  `meta` key
  * publicKey and signature constants are exported as `META_PUBLIC_KEY` and
  `META_SIGNATURE` respectively.

### identity

For `import { Ed25519 } from 'redux-signatures'`,

* `identity = new Ed25519()`:
  generates a new Ed25519 identity.
* `identity = new Ed25519(privateKey: string)`:
  recreates an existing Ed25519 identity from privateKey.

* `identity.sign(message: string) => signature: string`:
  Returns the signature for a given message.
* `identity.verifyPublic(message: string, signature: string, publicKey:string) => valid: bool`:
  Verifies a given message against the given signature and publicKey.
* `identity.verify(message: string, signature: string) => valid: bool`:
  Verifies a given message against the given signature and this identity.
* `identity.publicKey => hex: string`:
  Returns the identity's publicKey
* `identity.privateKey => hex: string`:
  Returns the identity's privateKey

### example

```js
const { Ed25519, signAction, verifyAction } from 'redux-signatures'

// create the identity object with a random key.
const identity = new Ed25519()

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

## licence

MIT.
