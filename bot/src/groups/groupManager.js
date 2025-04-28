const logger = require("../services/logger");

const util = require('util');

class GroupManager {
    constructor() {
        this.groups = []; // Stack para almacenar los grupos
    }

    async createGroup({ guild, type, participants, role }) {
        // Crear un canal de voz en el servidor
        const channelName = `Carry-${type}-${this.groups.length + 1}`;
        const channel = await guild.channels.create({
            name: channelName,
            type: 2, // Tipo 2 es para canales de voz
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id, // Permisos para @everyone
                    deny: ['ViewChannel'], // Denegar acceso a todos
                },
            ],
        });

        const group = {
            id: this.groups.length + 1, // Generar un ID único
            type,
            participants,
            role,
            members: [], // Lista de IDs de Discord de los integrantes
            voiceChannelId: channel.id, // Guardar el ID del canal de voz
            link: `https://discord.com/channels/${guild.id}/${channel.id}`, // Link al canal de voz
            createdAt: new Date(),
        };

        this.groups.push(group);
        return group;
    }

    getGroups() {
        return this.groups;
    }

    getGroupById(id) {
        logger.info(`Buscando grupo con ID: ${id}`);
        logger.info(`Grupos disponibles: ${this.groups.map(group => group.id)}`);
        logger.info(`${util.inspect(this.groups)}`);
        return this.groups.find(group => group.id === parseInt(id, 10)); // Convertir id a número
    }

    addMemberToGroup(groupId, memberId) {
        const group = this.getGroupById(groupId);
        if (!group) {
            throw new Error(`El grupo con ID ${groupId} no existe.`);
        }

        if (group.members.includes(memberId)) {
            throw new Error(`El miembro con ID ${memberId} ya está en el grupo.`);
        }

        group.members.push(memberId);
        return group;
    }

    async deleteGroup(groupId, guild) {
        logger.info(`Eliminando grupo con ID: ${groupId}`);
        return "Grupo eliminado exitosamente. -- respuesta de prueba"; // Respuesta de prueba
        const groupIndex = this.groups.findIndex(group => group.id === groupId);
        if (groupIndex === -1) {
            throw new Error(`El grupo con ID ${groupId} no existe.`);
        }

        const group = this.groups[groupIndex];

        // Intentar eliminar el canal de voz asociado
        try {
            const channel = await guild.channels.fetch(group.voiceChannelId);
            if (channel) {
                await channel.delete(`Grupo ${groupId} eliminado`);
            }
        } catch (error) {
            console.warn(`No se pudo eliminar el canal de voz para el grupo ${groupId}:`, error.message);
        }

        // Eliminar el grupo del stack
        this.groups.splice(groupIndex, 1);
        return `Grupo con ID ${groupId} eliminado exitosamente.`;
    }

    moveMemberToTeamCarry(groupId, memberId) {
        const group = this.getGroupById(groupId);

        if (!group) {
            logger.error(`No se encontró el grupo con ID ${groupId}.`);
            return false;
        }

        // Verificar si el miembro está en la lista de members
        const memberIndex = group.members.indexOf(memberId);
        if (memberIndex === -1) {
            logger.error(`El miembro con ID ${memberId} no está en el grupo ${groupId}.`);
            return false;
        }

        // Mover el miembro de members a teamCarry
        if (!group.teamCarry) {
            group.teamCarry = []; // Inicializar teamCarry si no existe
        }

        group.teamCarry.push(memberId); // Agregar el miembro a teamCarry
        group.members.splice(memberIndex, 1); // Eliminar el miembro de members

        logger.info(`Miembro con ID ${memberId} movido a teamCarry en el grupo ${groupId}.`);
        return true;
    }
}

module.exports = new GroupManager();