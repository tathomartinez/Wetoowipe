require('dotenv').config();
const { channelLinkDairo } = process.env.CHANNEL_LINK_DAIRO;
// const { userMention } = require('discord.js');
const LinkDairo = {};


LinkDairo.writeMessage = (mensaje, client) => {
	try {
		// console.log(mensaje);
		// console.log(client);
		// console.log(client.channels);
		// console.log(client.channels.cache.get(channelTest));
		const channel = client.channels.cache.get(channelLinkDairo);
		const output =
			`Ofrenda suministrado por : ${mensaje.author}
			ofrenda :
			${mensaje.content}`;

		channel.send(output);

		// const channel = _client.channels.cache.get(channelJoke);
	} catch (error) {
		console.log(error);
	}


};
module.exports = LinkDairo;