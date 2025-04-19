require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const config = require('../../config/config');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('Actualiza tu rol según tu score de Raider.IO')
		.addStringOption(option =>
			option.setName('url')
				.setDescription('URL de tu perfil Raider.IO')
				.setRequired(true),
		),

	async execute(interaction) {
		const urlInput = interaction.options.getString('url');
		await interaction.deferReply({ flags: 64 });

		try {
			const member = interaction.member;
			const roles = member.guild.roles.cache;
			const rolesMitycPlus = roles.filter(role => role.name.startsWith(config.SUFIJO_ROL));

			console.log(`[UPDATE] URL recibida: ${urlInput}`);

			const { region, realm, name } = parseRaiderUrl(urlInput);
			console.log(`[UPDATE] Datos extraídos -> Región: ${region}, Reino: ${realm}, Nombre: ${name}`);

			const scoreData = await fetchRaiderScore(region, realm, name);
			console.log('[UPDATE] Respuesta de Raider.IO:', scoreData);

			const score = scoreData.mythic_plus_scores_by_season?.[0]?.scores?.all;
			if (!score) throw new Error('No se pudo obtener el puntaje actual de M+');

			const scoreRol = `${config.SUFIJO_ROL}${Math.trunc(score / 100) * 100}`;

			console.log(`[UPDATE] Puntaje: ${score} -> Rol asignado: ${scoreRol}`);

			const rolValido = roles.find(role => role.name === scoreRol);

			await removeOldRoles(member, rolesMitycPlus, scoreRol);

			if (rolValido) {
				console.log(`[UPDATE] Rol existente encontrado: ${rolValido.name}`);
				await member.roles.add(rolValido);
			} else {
				console.log(`[UPDATE] Rol no encontrado. Creando nuevo rol: ${scoreRol}`);
				const newRole = await createRole(interaction.guild, scoreRol);
				console.log(`[UPDATE] Nuevo rol creado: ${newRole.name}`);
				await member.roles.add(newRole);
			}

			const newNick = `${name}-${capitalize(realm)}`;
			console.log(`[UPDATE] Nickname actualizado a: ${newNick}`);
			await member.setNickname(newNick);

			const embed = new EmbedBuilder()
				.setColor(config.EMBEDCOLOR || 'Blue')
				.setTitle('✅ Rol actualizado')
				.setDescription(`Puntaje: **${score}**\nNuevo rol: **${scoreRol}**`)
				.setFooter({ text: '¡Que el destino te lleve con bien, joven adalid!' });

			await interaction.editReply({ embeds: [embed] });

		} catch (err) {
			console.error('[UPDATE] ❌ Error general:', err);
			await interaction.editReply('❌ Hubo un error actualizando tu información. Verifica el enlace.');
		}
	},
};

function parseRaiderUrl(url) {
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

async function fetchRaiderScore(region, realm, name) {
	const url = `${config.URL_UPDATE}region=${region}&realm=${realm}&name=${name}&fields=${config.RAIDERIO_FIELDS}&access_key=${process.env.RAIDERIO_KEY}`;
	console.log(`[FETCH] Llamando a Raider.IO: ${url}`);
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Error de API: ${response.status}`);
	const data = await response.json();
	return data;
}

async function removeOldRoles(member, roleList, scoreRol) {
	for (const role of roleList.values()) {
		if (role.name !== scoreRol && parseInt(role.name) <= parseInt(scoreRol)) {
			console.log(`[ROLES] Eliminando rol anterior: ${role.name}`);
			await member.roles.remove(role.id);
		}
	}
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function createRole(guild, name) {
	const newRole = await guild.roles.create({
    name: name,
		color: randomHexColor(),
    hoist: true,
		permissions: [],
		reason: 'Rol creado automáticamente por el bot',
	});
	return newRole;
}

function randomHexColor() {
	const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#57FF33']; // Conjunto de colores
	return colors[Math.floor(Math.random() * colors.length)];
}
