require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crearcuenta')
        .setDescription('Crea una cuenta bancaria vinculada a tu usuario'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            console.log('Comando crearcuenta iniciado.');

            // Obtener información del usuario
            const userId = interaction.user.id;
            const userName = interaction.user.username;
            console.log(`Usuario: ${userName} (ID: ${userId})`);

            // Crear el payload para la API
            const payload = {
                numeroCuenta: userId,
                nombre: userName,
                saldo: 0
            };
            console.log('Payload preparado:', payload);

            const apiUrl = process.env.GO_API_URL || 'http://localhost:8080';
            const accountEndpoint = `${apiUrl}/api/v1/accounts`;

            console.log(`Llamando al endpoint de creación de cuentas: ${accountEndpoint}`);
            const response = await fetch(accountEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.API_TOKEN}`
                },
                body: JSON.stringify(payload)
            });

            console.log('Respuesta del API recibida:', response.status);

            // Manejar la respuesta del API
            if (response.ok) {
                const data = await response.json();
                console.log('Datos de la respuesta del API:', data);

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Cuenta creada exitosamente')
                    .setDescription(
                        `Tu cuenta bancaria ha sido creada con éxito.\n` +
                        `**Número de cuenta:** ${data.NumeroCuenta}\n` +
                        `**Nombre:** ${data.Nombre}\n` +
                        `**Saldo inicial:** $${data.Saldo}\n` +
                        `**Fecha de creación:** ${new Date(data.FechaCreacion).toLocaleString()}`
                    );
                
                await interaction.editReply({ embeds: [embed] });
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error en la respuesta del API:', errorData);
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error en comando crearcuenta:', error);
            await interaction.editReply('❌ Ocurrió un error al crear tu cuenta. Intenta nuevamente más tarde.');
        }
    }
};