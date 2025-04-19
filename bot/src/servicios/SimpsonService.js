const { request } = require('undici');

const SimpsonService = {};

SimpsonService.getRandomEpisode = async () => {
	const call = await request('https://www.simpsonsoptimizer.com/episodes/good/');
	const value = await call.body.json();
	return value;
};

module.exports = SimpsonService;
