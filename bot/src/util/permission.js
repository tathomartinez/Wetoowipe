const ADMIN_IDS = process.env.ADMIN_IDS?.split(',') || [];

function isAuthorized(userId) {
	return ADMIN_IDS.includes(userId);
}

module.exports = {
	isAuthorized,
};
