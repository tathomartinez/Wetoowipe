require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('Consulta las reglas del gremio'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            console.log('Comando rules iniciado.');

            // Construir la URL del endpoint
            const apiUrl = process.env.GO_API_URL || 'http://localhost:8080';
            const rulesEndpoint = `${apiUrl}/api/v1/webhook`;
            console.log(`Llamando al endpoint de reglas: ${rulesEndpoint}`);

            // Llamar al API
            const response = await fetch(rulesEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${process.env.API_TOKEN}` // Descomenta si necesitas autenticación
                },
                body: JSON.stringify({
                    // Aquí defines el cuerpo de la solicitud
                    userId: interaction.user.id, // Ejemplo: enviar el ID del usuario
                    guildId: interaction.guild.id // Ejemplo: enviar el ID del servidor
                })
            });
            console.log('Respuesta del API recibida:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Datos de la respuesta del API:', data);

                // Crear el embed con las reglas
                const embed = new EmbedBuilder()
                    .setColor('#FF4500')
                    .setTitle(data.title || '📜 Reglas del Gremio')
                    .setDescription(data.description || 'Aquí están las reglas del gremio.')
                    .setFooter({ text: `Consulta realizada por ${interaction.user.username}` });

                // Agregar campos si existen
                if (data.fields && Array.isArray(data.fields)) {
                    data.fields.forEach(field => {
                        embed.addFields({ name: field.name, value: field.value });
                    });
                }

                // Agregar footer si existe
                if (data.footer) {
                    embed.setFooter({ text: data.footer.text, iconURL: data.footer.icon_url });
                }

                await interaction.editReply({ embeds: [embed] });
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error en la respuesta del API:', errorData);
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error en comando rules:', error);
            await interaction.editReply('❌ Ocurrió un error al consultar las reglas. Intenta nuevamente más tarde.');
        }
    }
};