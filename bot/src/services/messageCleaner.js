const Purga = {};
require('dotenv').config();
const { channelTest } = process.env.CHANNEL_TEST;
const LinkDairo = require('../servicios/LinkDairo');
const { whitelist } = require('../../assets/whiteList.json');

Purga.deleteMessage = (channel, client) => {
	channel.messages.fetch({ limit: 100 }).then(messages => {
		// console.log(`Received ${messages.size} messages`);
		messages.forEach(message => {
			if (validateMessageWhitelist(message) && !validarChannelTest(channel)) {
				LinkDairo.writeMessage(message, client);
			}
			// console.log('Se va a eliminar el mensaje con el id ', message.id);
			channel.messages.delete(message.id);
		});
	});
};

function validarChannelTest(channel) {
	return channel.id == channelTest;
}

function validateMessageWhitelist(message) {
	// console.log(message.content);
	// whitelist.forEach((it) => {
	// 	console.log(it);
	// 	console.log(message.content, 'mensaje');
	// 	console.log(it.value == message.content);

	// 	return it.value.includes(message.content);
	// });
	// console.log(whitelist.find(it => it.value.includes(message.content)));
	if (message.content.trim() == '') return false;
	return whitelist.find(it => message.content.includes(it.value));
	// whitelist.some((it) => {
	// console.log('value', it.value, 'mensaje', message.content);
	// console.log(message.content);
	// console.log(it.value == message.content);
	// return it.value == message.content || message.content == '';
	// });

	// const evaluarc = whitelist.includes(message.content);
	// console.log(evaluarc);
	// return true;
}

module.exports = Purga;
// export default Purga ;