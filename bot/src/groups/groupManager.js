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
        return this.groups.find(group => group.id === id);
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
}

module.exports = new GroupManager();