const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');

const timewait = 30 * 60000; // 30 minutos
// const timewait = 1 * 30000; // para pruebas (30 segundos)

function startJokeCycle(client) {
	console.log('[CHISTES] Iniciando proceso de chistes...');
	const interval = setInterval(() => enviarChiste(client), timewait);
	console.log('[CHISTES] Intervalo de chistes activo.');
}

async function enviarChiste(client) {
	const channel = client.channels.cache.get(process.env.CHANNEL_JOKE);
	if (!channel) return;

	const response = await request('https://api.chucknorris.io/jokes/random');
	const { value } = await response.body.json();

	const file = new AttachmentBuilder('./assets/chuck.jpg');
	const embed = new EmbedBuilder()
		.setColor('Blue')
		.setTitle('El chiste de hoy')
		.setDescription(value)
		.setImage('attachment://chuck.jpg')
		.setFooter({ text: 'Bazinga!!!!!!' });

	channel.send({ embeds: [embed], files: [file] });
}

module.exports = startJokeCycle;
