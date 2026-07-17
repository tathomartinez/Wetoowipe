import 'dotenv/config';
import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
export const data = new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Consulta las reglas del gremio');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    try {
        console.log('Comando rules iniciado.');

        const apiUrl = process.env.GO_API_URL || 'http://localhost:8080';
        const rulesEndpoint = `${apiUrl}/api/v1/webhook`;
        console.log(`Llamando al endpoint de reglas: ${rulesEndpoint}`);

        const response = await fetch(rulesEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: interaction.user.id,
                guildId: interaction.guildId
            })
        });
        console.log('Respuesta del API recibida:', response.status);

        if (response.ok) {
            const data = await response.json() as {
                title?: string;
                description?: string;
                fields?: Array<{ name: string; value: string }>;
                footer?: { text: string; icon_url?: string };
            };
            console.log('Datos de la respuesta del API:', data);

            const embed = new EmbedBuilder()
                .setColor('#FF4500')
                .setTitle(data.title || '📜 Reglas del Gremio')
                .setDescription(data.description || 'Aquí están las reglas del gremio.')
                .setFooter({ text: `Consulta realizada por ${interaction.user.username}` });

            if (data.fields && Array.isArray(data.fields)) {
                data.fields.forEach(field => {
                    embed.addFields({ name: field.name, value: field.value });
                });
            }

            if (data.footer) {
                embed.setFooter({ text: data.footer.text, iconURL: data.footer.icon_url });
            }

            await interaction.editReply({ embeds: [embed] });
        } else {
            const errorData = await response.json().catch(() => ({})) as { message?: string };
            console.error('Error en la respuesta del API:', errorData);
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Error en comando rules:', error);
        await interaction.editReply('❌ Ocurrió un error al consultar las reglas. Intenta nuevamente más tarde.');
    }
}

export default { data, execute };
