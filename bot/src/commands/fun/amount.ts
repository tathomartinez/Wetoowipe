import { SlashCommandBuilder, EmbedBuilder, CommandInteraction, User, ChatInputCommandInteraction } from 'discord.js';
import crypto from 'crypto';
import logger from '../../services/logger';

export default {
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
    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        try {
            const chatInputInteraction = interaction as ChatInputCommandInteraction;
            const valor = chatInputInteraction.options.getInteger('valor', true);
            const destinatario = chatInputInteraction.options.getUser('destinatario', true);

            // Validación mejorada
            if (valor <= 0) {
                await interaction.editReply('❌ El monto debe ser positivo');
                return;
            }

            // Registrar transacción
            await logTransaction(valor, destinatario);

            // Respuesta al usuario
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Transferencia exitosa')
                .setDescription(`Has enviado $${valor} a ${destinatario.username}`);

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            logger.debug('Error en comando amount:', error);
            await interaction.editReply('❌ Error al procesar la transferencia');
        }
    }
};

async function logTransaction(valor: number, destinatario: User): Promise<void> {
    const API_TIMEOUT = 8000; // 8 segundos
    const apiUrl = process.env.GO_API_URL || 'http://localhost:8080';
    const accountEndpoint = `${apiUrl}/api/v1/accounts`;

    logger.debug(`Llamando al endpoint de creación de cuentas: ${accountEndpoint}`);

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
            const message = (typeof errorData === 'object' && errorData !== null && 'message' in errorData)
                ? (errorData as { message?: string }).message
                : undefined;
            throw new Error(message || `HTTP ${response.status}`);
        }

        logger.debug('Transacción registrada exitosamente:', await response.json());
    } catch (error) {
        logger.debug('Error al registrar transacción:', {
            error: error instanceof Error ? error.message : String(error),
            payload
        });
        throw error;
    }
}