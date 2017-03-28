import tape from 'tape'
import { spy, match } from 'sinon'

// public api
import {
  META_PUBLIC_KEY, META_SIGNATURE,
  verifyAction, signAction
} from '../src'

// private api
import { encodeAction, omitActionSignature } from '../src/utils'

// create action helper
function createAction(payload, publicKey, signature) {
  return ({
    type: 'ACTION',
    payload,
    meta: {
      [META_PUBLIC_KEY]: publicKey,
      [META_SIGNATURE]: signature,
    }
  })
}

// our stub signature strategy validates if the payload contains the serialized
// action's length and publicKey
const
  payload = 'cool message, guy',
  publicKey = 'ABCDEF',
  serializedAction = '{"meta":{},"payload":"cool message, guy","type":"ACTION"}',
  signature = [
    serializedAction.length,
    publicKey
  ].join('~')

const identity = {
  verifyPublic: (a, s, k) => {
    const sig = s.split('~')
    return sig[0] == a.length && sig[1] === k && k === publicKey
  },
  sign: (a) => [a.length, publicKey].join('~'),
  publicKey
}

// encodeAction encode identical objects identically, regardless of key order
tape('encodeAction', function (t) {
  const action1 = { payload: 'hello', meta: {}, type: 'ACTION' },
    action2 = { meta: {}, type: 'ACTION', payload: 'hello' }

  t.plan(1)
  t.equal(
    encodeAction(action1), encodeAction(action2),
    'should serialize identical objects identically'
  )
})

// should omit scuttlebutt META_* properties from the meta key.
tape('omitActionSignature', function (t) {
  const action = createAction('payload', 'a', 'b'),
    omittedAction = omitActionSignature(action),
    parsedAction = JSON.parse(JSON.stringify(omittedAction))

  t.plan(3)

  // should not be included
  t.equal(typeof omittedAction.meta[META_PUBLIC_KEY], 'undefined', 'META_PUBLIC_KEY not defined')
  t.equal(typeof omittedAction.meta[META_SIGNATURE], 'undefined', 'META_SIGNATURE not defined')

  // this action shouldn't have any keys on a JSON-serialized action's meta
  t.equal(Object.keys(parsedAction.meta).length, 0, 'no keys left on meta')
})

// verify an action (success)
tape('verifyAction success', function (t) {
  const verifyPublic = spy(identity, 'verifyPublic'),
    callback = spy()

  const goodAction = createAction(payload, publicKey, signature)

  verifyAction(identity, callback, goodAction)

  t.plan(2)

  t.ok(
    verifyPublic.calledWith(serializedAction, signature, publicKey),
    'should call identity.verifyPublic'
  )
  t.ok(callback.calledWith(match.truthy), 'callback called with truthy')

  verifyPublic.restore()
})

// reject an invalid action
tape('verifyAction rejection', function (t) {
  const verifyPublic = spy(identity, 'verifyPublic'),
    callback = spy()

  const
    badValue = 'fffxxxx',
    actions = [
      createAction(payload, publicKey, badValue),
      createAction(payload, badValue, signature),
      createAction(badValue, publicKey, signature),
    ]

  // bad signature
  verifyAction(identity, callback, actions[0])

  // bad publicKey
  verifyAction(identity, callback, actions[1])

  // bad payload
  verifyAction(identity, callback, actions[2])

  t.plan(4)

  // we'll check the last two arguments for expected values
  t.ok(
    verifyPublic.firstCall.args[1] === badValue
    && verifyPublic.firstCall.args[2] === publicKey,
    'should call identity.verifyPublic 1'
  )
  t.ok(
    verifyPublic.secondCall.args[1] === signature
    && verifyPublic.secondCall.args[2] === badValue,
    'should call identity.verifyPublic 2'
  )
  t.ok(
    verifyPublic.thirdCall.args[1] === signature
    && verifyPublic.thirdCall.args[2] === publicKey,
    'should call identity.verifyPublic 3'
  )
  t.ok(callback.alwaysCalledWith(match.falsy), 'callback called with falsy')

  verifyPublic.restore()
})

// add signature metadata to an action
tape('signAction', function (t) {
  const sign = spy(identity, 'sign'),
    callback = spy()

  // received actions won't have signature meta keys added yet
  const goodAction = createAction(payload)

  signAction(identity, callback, goodAction)

  t.plan(3)

  // should return an object to callback, with the META_ keys added
  t.equal(
    callback.firstCall.args[0].meta[META_PUBLIC_KEY],
    publicKey,
    'callback called with object with meta publicKey'
  )
  t.equal(
    callback.firstCall.args[0].meta[META_SIGNATURE],
    signature,
    'callback called with object with meta publicKey'
  )

  t.ok(sign.calledWith(serializedAction))

  sign.restore()
})

// what is signed by signAction should be valid by verifyAction
tape('verifyAction and signAction', function (t) {
  function validCallback(result) {
    t.ok(result, 'signed action is valid')
  }

  t.plan(3)

  signAction(
    identity,
    (action) => verifyAction(identity, validCallback, action),
    createAction(payload) // known payload
  )

  signAction(
    identity,
    (action) => verifyAction(identity, validCallback, action),
    createAction('this is a secure message')
  )

  signAction(
    identity,
    (action) => verifyAction(identity, validCallback, action),
    createAction({ author: 'ramathorn', speech: 'do you know how fast you were going?' })
  )
})

// what is modified between signAction and verifyAction should be rejected
tape('verifyAction and signAction rejection', function (t) {
  function invalidCallback(result) {
    t.notOk(result, 'signed action is invalid')
  }

  t.plan(3)

  // add a key to meta
  signAction(
    identity,
    (action) => verifyAction(
      identity, invalidCallback,
      { ...action, meta: { ...action.meta, date: Date.now() } }
    ),
    createAction(payload) // known payload
  )

  // modify type
  signAction(
    identity,
    (action) => verifyAction(
      identity, invalidCallback,
      { ...action, type: 'OTHER_ACTION' }
    ),
    createAction('this is a secure message')
  )

  // modify payload object
  signAction(
    identity,
    (action) => verifyAction(
      identity, invalidCallback,
      { ...action, payload: { ...action.payload, tone: 'angry' } }
    ),
    createAction({ author: 'ramathorn', speech: 'do you know how fast you were going?' })
  )
})
