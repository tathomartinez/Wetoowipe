const { request } = require('undici');
// const { userMention } = require('discord.js');
const SimpsonService = {};

SimpsonService.getRandomEpisode = async () => {
	const call = await request('https://www.simpsonsoptimizer.com/episodes/good/');
	const value = await call.body.json();
	return value;
};
module.exports = SimpsonService;