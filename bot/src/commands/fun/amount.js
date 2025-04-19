require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const crypto = require('crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('amount')
        .setDescription('Envía una cantidad de dinero a otro usuario')
        .addIntegerOption(option =>
            option.setName('valor')
                .setDescription('Cantidad a transferir')
                .setRequired(true)
                .setMinValue(1)
        )
        .addUserOption(option =>
            option.setName('destinatario')
                .setDescription('Usuario que recibirá el dinero')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const valor = interaction.options.getInteger('valor');
            const destinatario = interaction.options.getUser('destinatario');

            // Validación mejorada
            if (valor <= 0) return await interaction.editReply('❌ El monto debe ser positivo');

            // Registrar transacción (versión simplificada sin node-abort-controller)
            await logTransaction(valor, destinatario);

            // Respuesta al usuario
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Transferencia exitosa')
                .setDescription(`Has enviado $${valor} a ${destinatario.username}`);

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error en comando amount:', error);
            await interaction.editReply('❌ Error al procesar la transferencia');
        }
    }
};

async function logTransaction(valor, destinatario) {
    const API_TIMEOUT = 8000; // 8 segundos
    const apiUrl = process.env.GO_API_URL || 'http://localhost:8080';
    const accountEndpoint = `${apiUrl}/api/v1/accounts`;
    
    console.log(`Llamando al endpoint de creación de cuentas: ${accountEndpoint}`);

	const payload = {
		fecha: new Date().toISOString(),
		valor: valor,
		destinatario: destinatario.username,
		destinatario_id: destinatario.id,
		sha: crypto.createHash('sha256')
			.update(`${valor}-${destinatario.id}-${process.env.API_SECRET}`)
			.digest('hex')
	};

    try {
        // Usando AbortController nativo de Node.js
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

        const response = await fetch(accountEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_TOKEN}`
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Error al registrar transacción:', {
            error: error.message,
            payload
        });
        throw error;
    }
}