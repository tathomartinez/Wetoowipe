import { Guild, GuildChannel, OverwriteResolvable } from 'discord.js';
import logger from '../services/logger'; // Asegúrate de que la ruta sea correcta

interface Group {
    id: string; // Cambiado de number a string
    type: string;
    participants: number;
    role: string | null;
    members: string[];
    voiceChannelId: string;
    link: string;
    createdAt: Date;
    teamCarry?: string[];
}

class GroupManager {
    private groups: Group[]; // Lista de grupos

    constructor() {
        this.groups = [];
    }

    async createGroup({
        guild,
        type,
        participants,
        role,
    }: {
        guild: Guild;
        type: string;
        participants: number;
        role: string | null;
    }): Promise<Group> {
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
            ] as OverwriteResolvable[],
        });

        const group: Group = {
            id: String(this.groups.length + 1), // Convertir a string
            type,
            participants,
            role,
            members: [],
            voiceChannelId: channel.id,
            link: `https://discord.com/channels/${guild.id}/${channel.id}`,
            createdAt: new Date(),
        };

        this.groups.push(group);
        return group;
    }

    getGroups(): Group[] {
        return this.groups;
    }

    getGroupById(id: string): Group | undefined {
        logger.info(`Buscando grupo con ID: ${id}`);
        logger.info(`Grupos disponibles: ${this.groups.map(group => group.id)}`);
        return this.groups.find(group => group.id === id);
    }

    addMemberToGroup(groupId: string, memberId: string): Group {
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

    async deleteGroup(groupId: string, guild: Guild): Promise<string> {
        logger.info(`Eliminando grupo con ID: ${groupId}`);
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
            if (error instanceof Error) {
                logger.warn(`No se pudo eliminar el canal de voz para el grupo ${groupId}:`, error.message);
            } else {
                logger.warn(`No se pudo eliminar el canal de voz para el grupo ${groupId}: Error desconocido`);
            }
        }

        // Eliminar el grupo del stack
        this.groups.splice(groupIndex, 1);
        return `Grupo con ID ${groupId} eliminado exitosamente.`;
    }

    moveMemberToTeamCarry(groupId: string, memberId: string): boolean {
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

export default new GroupManager();