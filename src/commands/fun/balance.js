require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Consulta tu saldo actual'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            console.log('Comando balance iniciado.');

            // Obtener el ID del usuario
            const userId = interaction.user.id;
            console.log(`Usuario solicitando balance: ${interaction.user.username} (ID: ${userId})`);

            // Construir la URL del endpoint
            const apiUrl = process.env.GO_API_URL || 'http://localhost:8080';
            const balanceEndpoint = `${apiUrl}/api/v1/accounts/${userId}/balance`;
            console.log(`Llamando al endpoint de balance: ${balanceEndpoint}`);

            // Llamar al API
            const response = await fetch(balanceEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.API_TOKEN}`
                }
            });

            console.log('Respuesta del API recibida:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Datos de la respuesta del API:', data);

                // Crear el mensaje de respuesta
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('💰 Tu saldo actual')
                    .setDescription(`**Saldo:** $${data.balance.toFixed(2)}`)
                    .setFooter({ text: `Consulta realizada por ${interaction.user.username}` });

                await interaction.editReply({ embeds: [embed] });
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error en la respuesta del API:', errorData);
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error en comando balance:', error);
            await interaction.editReply('❌ Ocurrió un error al consultar tu saldo. Intenta nuevamente más tarde.');
        }
    }
};