import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isAuthorized } from './permission';

describe('isAuthorized', () => {
    beforeEach(() => {
        vi.stubEnv('ADMIN_IDS', '123456,789012');
    });

    it('returns true for authorized user', () => {
        expect(isAuthorized('123456')).toBe(true);
    });

    it('returns true for second authorized user', () => {
        expect(isAuthorized('789012')).toBe(true);
    });

    it('returns false for unauthorized user', () => {
        expect(isAuthorized('999999')).toBe(false);
    });

    it('returns false for empty string userId', () => {
        expect(isAuthorized('')).toBe(false);
    });
});
