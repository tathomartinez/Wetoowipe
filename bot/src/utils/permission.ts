const ADMIN_IDS = process.env.ADMIN_IDS?.split(',') || [];

export function isAuthorized(userId: string): boolean {
    return ADMIN_IDS.includes(userId);
}
