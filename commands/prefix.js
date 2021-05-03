const Discord = require("discord.js");
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');
const client = new Discord.Client();

module.exports = {
    name: 'prefix',
    aliases: ['set-prefix'],
    category: "Configuration",
    description: "Set server prefix",
    cooldown: 3,
    async execute (message, args) {

        if(!message.member.hasPermission("MANAGE_GUILD")) return message.reply(`You do not have permission to use this command!`);

        const currentPrefix = sql.prepare("SELECT serverprefix FROM prefix WHERE guild = ?").get(message.guild.id);
        
        if(!args[0])
        {
            return message.reply(`Please provide a new prefix!`)
        }

        if(args[0] == currentPrefix) 
        {
            return message.reply(`Please provide with a new prefix!`)
        }

        sql.prepare("INSERT OR REPLACE INTO prefix (serverprefix, guild) VALUES (?, ?);").run(args[0], message.guild.id)
        return message.reply(`Server prefix is now \`${args[0]}\``)
    }
}