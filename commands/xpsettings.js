const Discord = require("discord.js");
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');
const client = new Discord.Client();

module.exports = {
    name: 'xpsettings',
    aliases: ['setxp', 'set-xp', 'xp-settings'],
    category: "Leveling",
    description: "Set custom XP and Cooldown",
    cooldown: 3,
    async execute (message, args) {
        if(!message.member.hasPermission("MANAGE_GUILD")) return message.reply(`You do not have permission to use this command!`);

        if(!args.length) 
            return message.reply(`Please provide a vaild argument! \`xpsettings (xp) (seconds)\``);

        if(isNaN(args[0]) || isNaN(args[1]))
            return message.reply(`Please provide a vaild argument! \`xpsettings (xp) (seconds)\``);
        
        if(parseInt(args[0]) < 0)
            return message.reply(`XP cannot be less than 0 XP!`);

        if(parseInt(args[1]) < 0)
            return message.reply(`Cooldown cannot be less than 0 seconds!`);

        let checkIf = sql.prepare("SELECT levelUpMessage FROM settings WHERE guild = ?").get(message.guild.id);
        if(checkIf) {
            sql.prepare(`UPDATE settings SET customXP = ? WHERE guild = ?`).run(parseInt(args[0]), message.guild.id);
            sql.prepare(`UPDATE settings SET customCooldown = ? WHERE guild = ?`).run(parseInt(args[1]) * 1000, message.guild.id);
        } else {
            sql.prepare(`INSERT OR REPLACE INTO settings (guild, levelUpMessage, customXP, customCooldown) VALUES (?,?,?,?)`).run(message.guild.id, `**Congratulations** {member}! You have now leveled up to **level {level}**`, parseInt(args[0]), parseInt(args[1]) * 1000);
        }
        
        return message.channel.send(`User from now will gain 1XP - ${parseInt(args[0])}XP/${parseInt(args[1])}s`);
    }
}