import { CommandInteractionOptionResolver, SlashCommandBuilder, EmbedBuilder, CommandInteraction, GuildMember, Role, Guild, ColorResolvable } from 'discord.js';
import { config } from '../../config/config';
import logger from '../../services/logger';

export default {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Actualiza tu rol según tu score de Raider.IO')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL de tu perfil Raider.IO')
                .setRequired(true),
        ),
    async execute(interaction: CommandInteraction): Promise<void> {
        const urlInput = (interaction.options as CommandInteractionOptionResolver).getString('url', true);
        await interaction.deferReply({ ephemeral: true });

        try {
            const member = interaction.member as GuildMember;
            const roles = member.guild.roles.cache;
            const rolesMitycPlus = roles.filter(role => role.name.startsWith(config.SUFIJO_ROL));

            logger.debug(`[UPDATE] URL recibida: ${urlInput}`);

            const { region, realm, name } = parseRaiderUrl(urlInput);
            logger.debug(`[UPDATE] Datos extraídos -> Región: ${region}, Reino: ${realm}, Nombre: ${name}`);

            const scoreData = await fetchRaiderScore(region, realm, name);
            logger.debug('[UPDATE] Respuesta de Raider.IO:', scoreData);

            const score = scoreData.mythic_plus_scores_by_season?.[0]?.scores?.all;
            if (!score) throw new Error('No se pudo obtener el puntaje actual de M+');

            const scoreRol = `${config.SUFIJO_ROL}${Math.trunc(score / 100) * 100}`;

            logger.debug(`[UPDATE] Puntaje: ${score} -> Rol asignado: ${scoreRol}`);

            const rolValido = roles.find(role => role.name === scoreRol);

            await removeOldRoles(member, rolesMitycPlus, scoreRol);

            try {
                if (rolValido) {
                    logger.debug(`[UPDATE] Rol existente encontrado: ${rolValido.name}`);
                    await member.roles.add(rolValido);
                } else {
                    logger.debug(`[UPDATE] Rol no encontrado. Creando nuevo rol: ${scoreRol}`);
                    const newRole = await createRole(member.guild, scoreRol);
                    logger.debug(`[UPDATE] Nuevo rol creado: ${newRole.name}`);
                    await member.roles.add(newRole);
                }
            } catch (error) {
                logger.debug(`[UPDATE] ❌ Error al asignar el rol: ${error}`);
            }

            try {
                const newNick = `${name}-${capitalize(realm)}`;
                logger.debug(`[UPDATE] Nickname actualizado a: ${newNick}`);
                await member.setNickname(newNick);
            } catch (error) {
                logger.debug(`[UPDATE] ❌ Error al cambiar el apodo: ${error}`);
            }

            const embed = new EmbedBuilder()
                .setColor((config.EMBEDCOLOR as ColorResolvable) || 'Blue')
                .setTitle('✅ Rol actualizado')
                .setDescription(`Puntaje: **${score}**\nNuevo rol: **${scoreRol}**`)
                .setFooter({ text: '¡Que el destino te lleve con bien, joven adalid!' });

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            logger.debug('[UPDATE] ❌ Error general:', err);
            await interaction.editReply('❌ Hubo un error actualizando tu información. Verifica el enlace.');
        }
    },
};

function parseRaiderUrl(url: string): { region: string; realm: string; name: string } {
    try {
        const parts = url.split('/characters/')[1].split('/');
        return {
            region: parts[0],
            realm: parts[1],
            name: parts[2],
        };
    } catch {
        throw new Error('URL inválida');
    }
}

async function fetchRaiderScore(region: string, realm: string, name: string): Promise<any> {
    const url = `${config.URL_UPDATE}region=${region}&realm=${realm}&name=${name}&fields=${config.RAIDERIO_FIELDS}&access_key=${process.env.RAIDERIO_KEY}`;
    logger.debug(`[FETCH] Llamando a Raider.IO: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error de API: ${response.status}`);
    const data = await response.json();
    return data;
}

async function removeOldRoles(member: GuildMember, roleList: Map<string, Role>, scoreRol: string): Promise<void> {
    for (const role of roleList.values()) {
        if (role.name !== scoreRol && parseInt(role.name) <= parseInt(scoreRol)) {
            logger.debug(`[ROLES] Eliminando rol anterior: ${role.name}`);
            await member.roles.remove(role.id);
        }
    }
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function createRole(guild: Guild, name: string): Promise<Role> {
    const newRole = await guild.roles.create({
        name: name,
        color: randomHexColor() as ColorResolvable, // Asegúrate de que sea un valor válido
        hoist: true,
        permissions: [],
        reason: 'Rol creado automáticamente por el bot',
    });
    return newRole;
}

function randomHexColor(): string {
    const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    return `#${hex.toUpperCase()}`;
}
