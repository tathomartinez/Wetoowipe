const { channelTest } = require('../../config.json');
const LinkDairo = {};


LinkDairo.writeMessage = (mensaje, client) => {
	console.log(mensaje);
	// console.log(client);
	// console.log(client.channels);
	// console.log(client.channels.cache.get(channelTest));
	const channel = client.channels.cache.get(channelTest);
	const output = 'Ofrenda suministrado por : ' + mensaje.author.username
		+ '\nofrenda :\n'
		+ mensaje.content;

	channel.send(output);

	// const channel = _client.channels.cache.get(channelJoke);

};
module.exports = LinkDairo;