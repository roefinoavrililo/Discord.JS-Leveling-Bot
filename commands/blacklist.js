const Discord = require("discord.js");
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');
const client = new Discord.Client();

module.exports = {
    name: 'blacklist',
    aliases: ['blacklist'],
    category: "Leveling",
    description: "Blacklist user/channel from leveling up/gaining XP, to remove user/channel from blacklist, type `blacklist (user/channel) (mention user/channel) remove",
    cooldown: 3,
    async execute (message, args) {
        if(!message.member.hasPermission("MANAGE_GUILD")) return message.reply(`You do not have permission to use this command!`);

        let ifExists = sql.prepare(`SELECT id FROM blacklistTable WHERE id = ?`);

        if(!args.length) 
            return message.reply(`Require arguments: \`User\` or \`Channel\` or \`List\``);

        if(args[0].toLowerCase() == "list")
        {
            const currentPage = parseInt(args[1]) || 1;
            const Lists = sql.prepare("SELECT * FROM blacklistTable WHERE guild = ?").all(message.guild.id);
            if(parseFloat(args[0])  > Math.ceil(Lists.length / 10)) {
            return message.reply(`Invalid page number! There are only ${Math.ceil(Lists.length / 10)} pages`)
            }
        } else if(args[0].toLowerCase() == "user")
        {
            let user = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === args.slice(1).join(" ") ||x.user.username === args[1])
            if(!args[1])
                return message.reply(`Please mention an user!`);
            if(!user)
                return message.reply(`Cannot find user!`);
            if(args[2] && args[2].toLowerCase() == "remove")
                {
                    if(!ifExists.get(`${message.guild.id}-${user.id}`))
                        return message.reply(`This user is not blacklisted!`);
                    else 
                        sql.prepare("DELETE FROM blacklistTable WHERE id = ?").run(`${message.guild.id}-${user.id}`);
                        return message.reply(`Successfully removed user from blacklist`);
                }
            if(ifExists.get(`${message.guild.id}-${user.id}`))
                    return message.reply(`This user is already blacklisted!`);
            else 
                    sql.prepare("INSERT OR REPLACE INTO blacklistTable (guild, typeId, type, id) VALUES (?, ?, ?, ?);").run(message.guild.id, user.id, "User", `${message.guild.id}-${user.id}`);
                    return message.reply(`User ${user} has been blacklisted!`);
        } else if(args[0].toLowerCase() == "channel")
        {
            let channel = message.guild.channels.cache.get(args[1]) || message.guild.channels.cache.find(c => c.name === args[1].toLowerCase()) || message.mentions.channels.first()

            if(!args[1])
                return message.reply(`Please mention a channel!`);
            if(!channel)
                return message.reply(`Cannot find channel!`);
            if(args[2] && args[2].toLowerCase() == "remove")
                {
                    if(!ifExists.get(`${message.guild.id}-${channel.id}`))
                        return message.reply(`This user is not blacklisted!`);
                    else 
                        sql.prepare("DELETE FROM blacklistTable WHERE id = ?").run(`${message.guild.id}-${channel.id}`);
                        return message.reply(`Successfully removed channel from blacklist`);
                }
            if(ifExists.get(`${message.guild.id}-${channel.id}`))
                    return message.reply(`This channel is already blacklisted!`);
            else 
                    sql.prepare("INSERT OR REPLACE INTO blacklistTable (guild, typeId, type, id) VALUES (?, ?, ?, ?);").run(message.guild.id, channel.id, "Channel", `${message.guild.id}-${channel.id}`);
                    return message.reply(`Channel ${channel} has been blacklisted!`);
        } else {
            return message.reply(`Require arguments: \`User\` or \`Channel\` or \`List\``);
        }
    }
}