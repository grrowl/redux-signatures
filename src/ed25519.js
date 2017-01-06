/*

this is used like: new Ed25519()

this ed25519 object needs to be acessible in both verifyAsync and signMessage.
signMessage is in dispatch land
so yes it should be a store enhancer. it can write signatures on /all/ actions
at dispatch time (NOT ASYNC, WILL DELAY EVERYTHING ugh)

so
- called on verifyAsync (p easy, can even be static!)
- called on dispatch/signAction

as
- store enhancer: every dispatch signs message
- scuttlebutt ext: can be eager or not, "plugged in" at will
  - cant live in store tho :\
  - you can change to tho
  - eh but not by action
  - so mayb

or

- verifyMessage: takes the
- identityReducer: generates and stores the key when value is undefined
- signMessage(action, state.id.pubKey, state.id.privKey)
---

this makes it hard to expose identity to store.

if we have history, can we use another store enhancer


*/

import elliptic, { eddsa as EdDSA } from 'elliptic'
import { codifyMessage } from './utils'

export { verifyAction, signAction } from './utils'

function toHex(arr) {
  return elliptic.utils.toHex(arr).toUpperCase()
}

function fromHex(hex) {
  return elliptic.utils.toArray(hex, 'hex')
}

// Store EdDSA context statically
let ecContext

export default class Ed25519 {
  constructor(privateKey) {
    // Initialize EdDSA context if not already initialized
    ecContext = ecContext || new EdDSA('ed25519');

    if (privateKey) {
      this.key = ecContext.keyFromSecret(fromHex(privateKey))
    } else {
      this.key = this.generateKey()
    }
  }

  get privateKey() {
    if (this.key) {
      return toHex(this.key.getSecret())
    }
    return // undefined
  }

  get publicKey() {
    if (this.key) {
      return toHex(this.key.getPublic())
    }
    return // undefined
  }

  generateKey() {
    let secret;

    if (window !== undefined && window.crypto && window.crypto.getRandomValues) {
      secret = new Uint8Array(256)
      window.crypto.getRandomValues(secret)
    } else {
      console.warn('Warning: Using insecure methods to generate private key')
      secret = []
      for (let i = 0; i < 256; i++) {
        secret.push(Math.random() * 9007199254740991) // aka Number.MAX_SAFE_INTEGER
      }
    }

    return ecContext.keyFromSecret(secret)
  }

  // verify with no private key
  verifyPublic(message, signature, publicKey) {
    // Import public key
    const key = ecContext.keyFromPublic(publicKey, 'hex')

    // Verify signature
    // 7~10ms on my machine
    return key.verify(codifyMessage(message), signature)
  }

  // verify message against our own private key
  verify(message, signature) {
    // Verify signature
    this.key.verify(message, signature)
  }

  // signs a message with our private key
  sign(message) {
    // return signature
    if (this.key) {
      // ~1ms on my machine
      return this.key.sign(codifyMessage(message)).toHex()
    }

    return null

  }
}
