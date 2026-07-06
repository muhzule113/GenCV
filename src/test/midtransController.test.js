import { describe, it, expect } from 'vitest'
import crypto from 'node:crypto'
import { verifySignature } from '../server/controllers/midtransController.js'

describe('verifySignature', () => {
  const serverKey = 'SB-Mid-server-TEST_SANDBOX_KEY_abc123'

  function signPayload(orderId, statusCode, grossAmount) {
    return crypto
      .createHash('sha512')
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest('hex')
  }

  it('returns true for a valid signature', () => {
    const signature = signPayload('GENCV-abc123-def456-ghi7', '200', '15000.00')
    expect(
      verifySignature('GENCV-abc123-def456-ghi7', '200', '15000.00', serverKey, signature)
    ).toBe(true)
  })

  it('returns false for an invalid signature', () => {
    expect(
      verifySignature('GENCV-abc123-def456-ghi7', '200', '15000.00', serverKey, 'fake_signature_xyz')
    ).toBe(false)
  })

  it('rejects when payload is tampered (different amount)', () => {
    const signature = signPayload('GENCV-abc123-def456-ghi7', '200', '15000.00')
    expect(
      verifySignature('GENCV-abc123-def456-ghi7', '200', '99999.00', serverKey, signature)
    ).toBe(false)
  })

  it('rejects when payload is tampered (different order_id)', () => {
    const signature = signPayload('GENCV-abc123-def456-ghi7', '200', '15000.00')
    expect(
      verifySignature('GENCV-tampered-xyz', '200', '15000.00', serverKey, signature)
    ).toBe(false)
  })

  it('returns false when signature key is empty', () => {
    expect(
      verifySignature('order-1', '200', '10000', serverKey, '')
    ).toBe(false)
  })
})
