import 'dotenv/config';
import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import logger from '../../services/logger';

export const data = new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Consulta tu saldo actual');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    try {
        logger.info('Comando balance iniciado.');

        const userId = interaction.user.id;
        logger.debug(`Usuario solicitando balance: ${interaction.user.username} (ID: ${userId})`);

        const apiUrl = process.env.GO_API_URL || 'http://localhost:8080';
        const balanceEndpoint = `${apiUrl}/api/v1/accounts/${userId}/balance`;
        logger.debug(`Llamando al endpoint de balance: ${balanceEndpoint}`);

        const response = await fetch(balanceEndpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.API_TOKEN}`
            }
        });

        logger.info(`Respuesta del API recibida: ${response.status}`);

        if (response.ok) {
            const data = await response.json() as { balance: number };

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('💰 Tu saldo actual')
                .setDescription(`**Saldo:** $${data.balance.toFixed(2)}`)
                .setFooter({ text: `Consulta realizada por ${interaction.user.username}` });

            await interaction.editReply({ embeds: [embed] });
            logger.info('Respuesta enviada al usuario con éxito.');
        } else {
            const errorData = await response.json().catch(() => ({})) as { message?: string };
            logger.debug('Error en la respuesta del API:', errorData);

            if (response.status === 404) {
                await interaction.editReply('❌ No se encontró una cuenta asociada a tu usuario. Por favor, utiliza el comando `/register` para crear una cuenta.');
            } else {
                await interaction.editReply('❌ Ocurrió un error al consultar tu saldo. Intenta nuevamente más tarde.');
            }
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
    } catch (error) {
        logger.debug('Error en comando balance:', error);

        if (!interaction.replied) {
            await interaction.editReply('❌ Ocurrió un error inesperado. Intenta nuevamente más tarde.');
        }
    }
}

export default { data, execute };
