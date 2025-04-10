require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const crypto = require('crypto'); // Importar el módulo crypto para generar el SHA

module.exports = {
	data: new SlashCommandBuilder()
		.setName('amount')
		.setDescription('Envía una cantidad de dinero a otro usuario y guarda el log.')
		.addIntegerOption(option =>
			option.setName('valor')
				.setDescription('Valor a enviar')
				.setRequired(true),
		)
		.addUserOption(option =>
			option.setName('destinatario')
				.setDescription('Usuario destinatario')
				.setRequired(true),
		),

	async execute(interaction) {
		const valor = interaction.options.getInteger('valor');
		const destinatario = interaction.options.getUser('destinatario');

		// Defer la respuesta para que el bot procese el comando
		await interaction.deferReply({ ephemeral: true });

		try {
			// Verificar que el valor sea válido
			if (valor <= 0) {
				await interaction.editReply('❌ El valor debe ser mayor que 0.');
				return;
			}

			// Crear el mensaje de confirmación para el usuario
			const embed = new EmbedBuilder()
				.setColor('Green')
				.setTitle('💸 Transferencia registrada')
				.setDescription(`Has enviado **${valor}** a ${destinatario.username}.`)
				.setFooter({ text: '¡Gracias por usar nuestro sistema de transferencias!' });

			// Enviar respuesta al usuario
			await interaction.editReply({ embeds: [embed] });

			// Guardar el log en el servidor del bot (API Go)
			await logTransaction(valor, destinatario);

		} catch (err) {
			console.error('[AMOUNT] ❌ Error:', err);
			await interaction.editReply('❌ Hubo un error procesando tu solicitud.');
		}
	},
};

// Función para registrar la transacción en la API Go
async function logTransaction(valor, destinatario) {
	const timestamp = new Date().toISOString();
	const dataToHash = `${timestamp}-${valor}-${destinatario.id}-${process.env.SECRET_KEY || 'default_secret'}`; // Incluye una clave secreta para mayor seguridad
	const sha256Hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

	const logData = {
		fecha: timestamp,
		valor: valor,
		destinatario: destinatario.username,
		destinatario_id: destinatario.id,
		sha: sha256Hash,
	};

	try {
		const response = await fetch('http://go-api:8080/log', { // Utiliza el nombre del servicio 'go-api'
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(logData),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`[AMOUNT] ❌ Error al enviar el log a la API Go: ${response.status} - ${errorText}`);
		} else {
			console.log('[AMOUNT] ✅ Transacción enviada a la API Go para log');
		}
	} catch (error) {
		console.error('[AMOUNT] ❌ Error al comunicarse con la API Go:', error);
	}
}