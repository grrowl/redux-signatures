import { default as stringify } from 'json-stable-stringify'

import { META_PUBLIC_KEY, META_SIGNATURE } from './constants'

export function encodeAction(action) {
  let cleanAction = action

  if (action && action.meta) {
    // if meta keys might be set, remove them.
    cleanAction = {
      ...action,
      meta: {
        [META_PUBLIC_KEY]: undefined,
        [META_SIGNATURE]: undefined,
        ...action.meta
      }
    }
  }

  return stringify(cleanAction)
}

export function verifyAction(identity) {
  return function (callback, action) {
    const publicKey = action && action.meta && action.meta[META_PUBLIC_KEY],
      signature = action && action.meta && action.meta[META_SIGNATURE]

    callback(identity.verify(encodeAction(action), publicKey, signature))
  }
}

export function signAction(identity) {
  return function (callback, action) {
    callback(identity.sign(encodeAction(action)))
  }
}

// Sign message (must be an array, or it'll be treated as a hex sequence)
export function codifyMessage(message) {
  message.split('').map(m => m.charCodeAt(0))
}
