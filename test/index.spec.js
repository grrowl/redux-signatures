import tape from 'tape'
import { spy } from 'sinon'

tape('not implemented', function (t) {
  t.ok(false, 'not implemented yet')
})

function createAction(payload, type = 'ACTION') {
  return ({
    type,
    payload: payload,
  })
}
