import 'dotenv/config';
import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('juro')
    .setDescription('Jura aceptar las reglas del gremio para obtener un rol')
    .addStringOption(option =>
        option.setName('frase')
            .setDescription('Escribe la frase para jurar')
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    try {
        const fraseIngresada = interaction.options.getString('frase', true);
        const fraseCorrecta = process.env.JURO_FRASE || 'Juro por mi teclado mecánico que acepto estas condiciones y no lloraré por PvP verbal.';
        const rolId = process.env.JURO_ROLE_ID;

        if (fraseIngresada !== fraseCorrecta) {
            await interaction.editReply('❌ La frase ingresada no es correcta. Intenta nuevamente.');
            return;
        }

        const rol = interaction.guild?.roles.cache.get(rolId!);
        if (!rol) {
            console.error(`No se encontró el rol con ID: ${rolId}`);
            await interaction.editReply('❌ No se pudo asignar el rol. Contacta a un administrador.');
            return;
        }

        const miembro = interaction.member;
        if (miembro && 'roles' in miembro) {
            const roles = miembro.roles;
            if (typeof roles !== 'string' && 'add' in roles) {
                await roles.add(rol);
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ ¡Has jurado correctamente!')
            .setDescription(`Has recibido el rol **${rol.name}**. ¡Bienvenido al gremio!`);

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error en comando juro:', error);
        await interaction.editReply('❌ Ocurrió un error al procesar tu juramento. Intenta nuevamente más tarde.');
    }
}

export default { data, execute };
