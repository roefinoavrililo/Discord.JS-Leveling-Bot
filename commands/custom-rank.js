const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite')
const client = new Discord.Client();
const canvacord = require("canvacord");

module.exports = {
    name: 'custom-rank',
    aliases: ['customrank', 'rankcard'],
    description: "Customize rank card color such as; Progress, Background and Text.",
    cooldown: 3,
    category: "Leveling",
    async execute (message, args) {
        let method = args[0];
        let color = args[1];

        if(!method)
        {
            const currentPrefix = sql.prepare("SELECT serverprefix FROM prefix WHERE guild = ?").get(message.guild.id);

            message.channel.send(`Invalid Usage! \n**Usage:** \`${currentPrefix.serverprefix.toString()}rank-card <progressbar / bar / progressbarcolor (to change progress bar color) \ntext / textcolor (to change text color)\nbackground / backgroundcolor (to change background color)> \n <color (can be hex code or a name of color)>\``)
            return;
        }
        if(method.toLowerCase() == "progressbar" || method.toLowerCase() == "bar" || method.toLowerCase() == "progressbarcolor")
        {
            if(!color)
            {
                return message.reply("Please provide a valid color!");
            }

            sql.prepare("UPDATE rankCardTable SET barColor = ? WHERE id = ?;").run(color, `${message.author.id}-${message.guild.id}`);

            return message.reply("Successfully updated color.")
        } else if(method.toLowerCase() == "text" || method.toLowerCase() == "textcolor")
        {
            if(!color)
            {
                return message.reply("Please provide a valid color!");
            }

            sql.prepare("UPDATE rankCardTable SET textColor = ? WHERE id = ?;").run(color, `${message.author.id}-${message.guild.id}`);

            return message.reply("Successfully updated color.")
        } else if(method.toLowerCase() == "background" || method.toLowerCase() == "backgroundcolor")
        {
            if(!color)
            {
                return message.reply("Please provide a valid color!");
            }

            sql.prepare("UPDATE rankCardTable SET backgroundColor = ? WHERE id = ?;").run(color, `${message.author.id}-${message.guild.id}`);

            return message.reply("Successfully updated color.")
        }
        
    }
}