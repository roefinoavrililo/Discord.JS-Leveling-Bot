const Discord = require("discord.js");
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');
const client = new Discord.Client();

module.exports = {
    name: 'channel-levelup',
    aliases: ['setchannel', 'channellevelup'],
    category: "Leveling",
    description: "Set specific channel to send level up message",
    cooldown: 3,
    async execute (message, args) {
        if(!message.member.hasPermission("MANAGE_GUILD")) return message.reply(`You do not have permission to use this command!`);

        if(!args.length) 
            return message.reply(`Require arguments: \`Default\`, \`Channel ID or Mention Channel\`\n>Default: Send message in the channel user leveled up in.\n>Channel ID or Mention Channel: Send message in the specific channel.`);

        let channel = message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find(c => c.name === args[0].toLowerCase()) || message.mentions.channels.first()

        if(args[0].toLowerCase() == "default"){   
            sql.prepare("INSERT OR REPLACE INTO channel (guild, channel) VALUES (?, ?);").run(message.guild.id, "Default");
            return message.reply(`Level Up Channel has been set to Default Settings`);
        } else if(channel) {
            const permissionFlags = channel.permissionsFor(message.guild.me);
            if(!permissionFlags.has("SEND_MESSAGES") || !permissionFlags.has("VIEW_CHANNEL") )
            {
                return message.reply(`I don't have permission to send message in or view ${channel}!`)
            } else
                sql.prepare("INSERT OR REPLACE INTO channel (guild, channel) VALUES (?, ?);").run(message.guild.id, channel.id);
                return message.reply(`Level Up Channel has been set to ${channel}`);
        } else {
            return message.reply(`Require arguments: \`Default\`, \`Channel ID or Mention Channel\`\n>Default: Send message in the channel user leveled up in.\n>Channel ID or Mention Channel: Send message in the specific channel.`);
        }
    }
}
