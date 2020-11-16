const Discord = require("discord.js");
const config = require('../config.json') 
const prefix = config.prefix;
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');
const client = new Discord.Client();

module.exports = {
    name: 'role-level',
    aliases: ['rlevel', 'level-roles'],
    description: "Rewards role when user leveled up to a certain level",
    category: "Leveling",
    cooldown: 3,
    async execute (message, args) {
        if(!message.guild.me.hasPermission("MANAGE_ROLES")) return message.reply(`I do not have permission to manage roles!`);
        if(!message.member.hasPermission("MANAGE_ROLES") || !message.member.hasPermission("MANAGE_GUILD")) return message.reply(`You do not have permission to use this command!`);


        if(!args.length) {
            let embed = new Discord.MessageEmbed()
            .setTitle(`Leveling Roles Setup`)
            .setDescription(`Rewards role when user leveled up to a certain level`)
            .addFields({ name: `${prefix}role-level add <level> <@role>`, value: `Sets a role to be given to user when they leveled up to certain level.`})
            .addFields({ name: `${prefix}role-level remove <level>`, value: `Removes the role set at the specified level.`})
            .addFields({ name: `${prefix}role-level show`, value: `Shows all roles set to levels.`})
            .setColor("RANDOM");

        return message.channel.send(embed);
        }

        const method = args[0]
        const levelArgs = parseInt(args[1])
        args.shift()
        args.shift()
        const roleName = args.join(' ')

        const role = message.guild.roles.cache.find(r => (r.name === roleName.toString()) || (r.id === roleName.toString().replace(/[^\w\s]/gi, '')));
        client.getRole = sql.prepare("SELECT * FROM roles WHERE guildID = ? AND roleID = ? AND level = ?");
        client.setRole = sql.prepare("INSERT OR REPLACE INTO roles (guildID, roleID, level) VALUES (@guildID, @roleID, @level);");

        if(method === 'add') {
            if(isNaN(levelArgs) && !levelArgs || levelArgs < 1) {
                return message.reply(`Please provide a level to set.`);
            } else {
                if(!role) {
                    return message.reply(`You did not provide a role to set!`);
                } else {
                let Role = client.getRole.get(message.guild.id, role.id, levelArgs) 
                if(!Role) {
                    Role = {
                    guildID: message.guild.id,
                    roleID: role.id,
                    level: levelArgs
                    }
                    client.setRole.run(Role)
                    let embed = new Discord.MessageEmbed()
                    .setTitle(`Successfully set role!`)
                    .setDescription(`${role} has been set for level ${levelArgs}`)
                    .setColor("RANDOM");
                     return message.channel.send(embed);
                 } else if(Role){
                    client.deleteLevel = sql.prepare(`DELETE FROM roles WHERE guildID = ? AND roleID = ? AND level = ?`)
                    client.deleteLevel.run(message.guild.id, role.id, levelArgs);
                    client.updateLevel = sql.prepare(`INSERT INTO roles(guildID, roleID, level) VALUES(?,?,?)`)
                    client.updateLevel.run(message.guild.id, role.id, levelArgs)
                     let embed = new Discord.MessageEmbed()
                     .setTitle(`Successfully set role!`)
                     .setDescription(`${role} has been updated for level ${levelArgs}`)
                     .setColor("RANDOM");
                      return message.channel.send(embed);
                 }
                }
            }
        }

        if(method === 'show') {
            const allRoles = sql.prepare(`SELECT * FROM roles WHERE guildID = ?`).all(message.guild.id)
            if(!allRoles) {
                return message.reply(`There is no roles set!`)
            } else {
                let embed = new Discord.MessageEmbed()
                .setTitle(`${message.guild.name} Roles Level`)
                .setDescription(`\`${prefix}help role-level\` for more information`)
                .setColor("RANDOM");
                for(const data of allRoles) {
                    let LevelSet = data.level;
                    let RolesSet = data.roleID;
                 embed.addFields({ name: `\u200b`, value: `**Level ${LevelSet}**: <@&${RolesSet}>` }); 
                }
                return message.channel.send({embed});
            }
        }

        client.getLevel = sql.prepare(`SELECT * FROM roles WHERE guildID = ? AND level = ?`)
        const levels = client.getLevel.get(message.guild.id, levelArgs)

        if(method === 'remove' || method === 'delete') {
            if(isNaN(levelArgs) && !levelArgs || levelArgs < 1) {
                return message.reply(`Please provide a level to remove.`);
            } else {
                if(!levels) {
                    return message.reply(`That isn't a valid level!`);
                } else {
                    client.deleteLevel = sql.prepare(`DELETE FROM roles WHERE guildID = ? AND level = ?`)
                    client.deleteLevel.run(message.guild.id, levelArgs);
                    let embed = new Discord.MessageEmbed()
                    .setTitle(`Successfully set role!`)
                    .setDescription(`Role rewards for level ${levelArgs} has been removed.`)
                    .setColor("RANDOM");
                     return message.channel.send(embed);
                }
            }
        }

    }
}