import { default as stringify } from 'json-stable-stringify'

import { META_PUBLIC_KEY, META_SIGNATURE } from './constants'

export function encodeAction(action) {
  return stringify(action)
}

export function omitActionSignature(action) {
  return {
    ...action,
    meta: {
      ...action.meta,
      [META_PUBLIC_KEY]: undefined,
      [META_SIGNATURE]: undefined,
    }
  }
}

// calls back with true or false, whether the action's embedded signature
// metadata is accurate
export function verifyAction(identity, callback, action) {
  const publicKey = action && action.meta && action.meta[META_PUBLIC_KEY],
    signature = action && action.meta && action.meta[META_SIGNATURE]

  callback(identity.verifyPublic(
    encodeAction(omitActionSignature(action)),
    signature,
    publicKey
  ))
}

// calls back with the action with signature metadata added
export function signAction(identity, callback, action) {
  callback({
    ...action,
    meta: {
      ...action.meta,
      [META_PUBLIC_KEY]: identity.publicKey,
      [META_SIGNATURE]: identity.sign(encodeAction(action)),
    }
  })
}

// Sign message (must be an array, or it'll be treated as a hex sequence)
export function codifyMessage(message) {
  return message.split('').map(m => m.charCodeAt(0))
}
