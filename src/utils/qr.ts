import crypto from 'crypto';

/**
 * Generates a cryptographically random, permanent
 * attendance QR token.
 *
 * The token itself does not contain trusted event/role
 * information. The backend resolves the token against
 * the Event record and determines whether it is the
 * STAFF or STUDENT QR.
 */
export function createAttendanceQrToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}