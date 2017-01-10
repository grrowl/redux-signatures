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

function omitActionSignature(action) {
  return {
    ...action,
    meta: {
      ...action.meta,
      [META_PUBLIC_KEY]: undefined,
      [META_SIGNATURE]: undefined,
    }
  }
}

// calls back with true or false, whether the action is valid
export function verifyAction(identity, callback, action) {
  const publicKey = action && action.meta && action.meta[META_PUBLIC_KEY],
    signature = action && action.meta && action.meta[META_SIGNATURE]

  callback(identity.verifyPublic(
    encodeAction(omitActionSignature(signAction)),
    signature,
    publicKey
  ))
}

// calls back with the action plus signature metadata
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
  message.split('').map(m => m.charCodeAt(0))
}
