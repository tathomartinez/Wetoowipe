import 'dotenv/config';
import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
export const data = new SlashCommandBuilder()
    .setName('crearcuenta')
    .setDescription('Crea una cuenta bancaria vinculada a tu usuario');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    try {
        console.log('Comando crearcuenta iniciado.');

        const userId = interaction.user.id;
        const userName = interaction.user.username;
        console.log(`Usuario: ${userName} (ID: ${userId})`);

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

        if (response.ok) {
            const data = await response.json() as {
                NumeroCuenta?: string;
                Nombre?: string;
                Saldo?: number;
                FechaCreacion?: string;
            };
            console.log('Datos de la respuesta del API:', data);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Cuenta creada exitosamente')
                .setDescription(
                    `Tu cuenta bancaria ha sido creada con éxito.\n` +
                    `**Número de cuenta:** ${data.NumeroCuenta}\n` +
                    `**Nombre:** ${data.Nombre}\n` +
                    `**Saldo inicial:** $${data.Saldo}\n` +
                    `**Fecha de creación:** ${data.FechaCreacion ? new Date(data.FechaCreacion).toLocaleString() : 'N/A'}`
                );

            await interaction.editReply({ embeds: [embed] });
        } else {
            const errorData = await response.json().catch(() => ({})) as { message?: string };
            console.error('Error en la respuesta del API:', errorData);
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Error en comando crearcuenta:', error);
        await interaction.editReply('❌ Ocurrió un error al crear tu cuenta. Intenta nuevamente más tarde.');
    }
}

export default { data, execute };
