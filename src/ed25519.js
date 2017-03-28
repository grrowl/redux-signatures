/*

this is used like: new Ed25519([privateKey])

it has the shape:

// identity.sign = (action) => signature: string
// identity.verify = (action, signature, pubKey) => valid: bool
// identity.publicKey = () => hex: string
// identity.privateKey = () => hex: string

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
    return toHex(this.key.getSecret())
  }

  get publicKey() {
    return toHex(this.key.getPublic())
  }

  generateKey() {
    let secret;

    if (typeof window === 'object' && window.crypto && window.crypto.getRandomValues) {
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
    return this.key.verify(codifyMessage(message), signature)
  }

  // signs a message with our private key, return signature
  sign(message) {
    // ~1ms on my machine
    return this.key.sign(codifyMessage(message)).toHex()
  }
}
