import tape from 'tape'
import fs from 'fs'

import { Ed25519 } from '../src'

const messages = [
  'Super Secret Message. Well, not so secret. But must be unmodified.',
  'signing message',
  'Unicode strings \u00A0\u00A0\u00FF\u010AA should be supported',
]

const knownSignatures = [
  '302F2CC486CFB7C27505461CC47CD6D2839A8733961B1B91126A6D9AB8106E5363A4824AFA71F454C431E341AD2DC81F62CD12424FFEE13A4E5E524AE8E0C00A',
  '42A991F11394FE0D6900FC2CB03320A3BC5C2AC9DB02BAB144103EF71F7C0A21D0FFB2D22E7CB82F74118E7ED2915106D852771199081F472F1FD3CAB808630C',
  'C29C42B42D4E7D76133C6C07EF4F213DA93F6AF12E6CE603AB210AC0D0F387812A85AAB34E6BA6D96D34C936AD7739116882062EF93DC2C0A3F8AC699B275B0A',
]


tape('Ed25519 generated sign-verify', function (t) {
  const identity = new Ed25519()

  t.plan(messages.length)

  for (const i in messages) {
    t.ok(
      identity.verify(messages[i], identity.sign(messages[i])),
      `verifies own message ${i}`
    )
  }
})

tape('Ed25519 generated sign-verifyPublic', function (t) {
  const identity = new Ed25519()
  t.plan(messages.length)

  for (const i in messages) {
    t.ok(
      identity.verifyPublic(messages[i], identity.sign(messages[i]), identity.publicKey),
      `verifies own message as public ${i}`
    )
  }
})


tape('Ed25519 privateKey sign-verify', function (t) {
  const privateKey = fs.readFileSync('./test/private.key', 'utf8')
  const identity = new Ed25519(privateKey)

  t.plan(messages.length)

  for (const i in messages) {
    t.ok(
      identity.verify(messages[i], identity.sign(messages[i])),
      `verifies own message ${i}`
    )
  }
})

tape('Ed25519 privateKey sign-verifyPublic', function (t) {
  const privateKey = fs.readFileSync('./test/private.key', 'utf8')
  const identity = new Ed25519(privateKey)

  t.plan(messages.length)

  for (const i in messages) {
    t.ok(
      identity.verifyPublic(messages[i], identity.sign(messages[i]), identity.publicKey),
      `verifies own message as public ${i}`
    )
  }
})

tape('Ed25519 privateKey sign === knownSignature', function (t) {
  const privateKey = fs.readFileSync('./test/private.key', 'utf8')
  const identity = new Ed25519(privateKey)

  t.plan(messages.length)

  for (const i in messages) {
    t.equal(
      identity.sign(messages[i]),
      knownSignatures[i],
      `signed message matches known signature ${i}`
    )
  }
})
