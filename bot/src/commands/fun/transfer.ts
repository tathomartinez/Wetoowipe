import 'dotenv/config';
import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
export const data = new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transfiere saldo a otro usuario')
    .addIntegerOption(option =>
        option.setName('amount')
            .setDescription('Monto a transferir')
            .setRequired(true)
            .setMinValue(1)
    )
    .addUserOption(option =>
        option.setName('beneficiary')
            .setDescription('Usuario que recibirá el saldo')
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply('Procesando tu solicitud, por favor espera...');
    try {
        const amount = interaction.options.getInteger('amount', true);
        const beneficiary = interaction.options.getUser('beneficiary', true);
        const fromAccount = interaction.user.id;
        const toAccount = beneficiary.id;

        console.log(`Transferencia iniciada por ${interaction.user.username} (ID: ${fromAccount})`);
        console.log(`Beneficiario: ${beneficiary.username} (ID: ${toAccount}), Monto: ${amount}`);

        const apiUrl = process.env.GO_API_URL || 'http://localhost:8080';
        const transferEndpoint = `${apiUrl}/api/v1/accounts/${fromAccount}/transfer`;

        const response = await fetch(transferEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_TOKEN}`
            },
            body: JSON.stringify({
                toAccount: toAccount,
                amount: amount,
                description: `Transferencia de ${interaction.user.username} a ${beneficiary.username}`
            })
        });

        if (response.ok) {
            const data = await response.json();

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Transferencia exitosa')
                .setDescription(
                    `Has transferido $${amount} a ${beneficiary.username}.\n` +
                    `**Número de cuenta del beneficiario:** ${toAccount}`
                );

            await interaction.editReply({ embeds: [embed] });
        } else {
            const errorData = await response.json().catch(() => ({})) as { message?: string };
            console.error('Error en la respuesta del API:', errorData);
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Error en comando transfer:', error);
        await interaction.editReply('❌ Ocurrió un error al realizar la transferencia. Intenta nuevamente más tarde.');
    }
}

export default { data, execute };
