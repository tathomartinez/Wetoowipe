require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('juro')
        .setDescription('Jura aceptar las reglas del gremio para obtener un rol')
        .addStringOption(option =>
            option.setName('frase')
                .setDescription('Escribe la frase para jurar')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const fraseIngresada = interaction.options.getString('frase');
            const fraseCorrecta = process.env.JURO_FRASE || 'Juro por mi teclado mecánico que acepto estas condiciones y no lloraré por PvP verbal.';
            const rolId = process.env.JURO_ROLE_ID;

            // Validar si la frase ingresada es correcta
            if (fraseIngresada !== fraseCorrecta) {
                return await interaction.editReply('❌ La frase ingresada no es correcta. Intenta nuevamente.');
            }

            // Obtener el rol desde el servidor
            const rol = interaction.guild.roles.cache.get(rolId);
            if (!rol) {
                console.error(`No se encontró el rol con ID: ${rolId}`);
                return await interaction.editReply('❌ No se pudo asignar el rol. Contacta a un administrador.');
            }

            // Asignar el rol al usuario
            const miembro = interaction.member;
            await miembro.roles.add(rol);

            // Responder al usuario
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
};