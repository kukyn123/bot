const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, REST } = require('discord.js');
const cron = require('node-cron');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const CHANNEL_ID = '999733580387340379';
const GUILD_ID = '999707970621419620';

let lastMessageID = null; // Proměnná pro ID poslední zprávy

const commands = [
    new SlashCommandBuilder()
        .setName('enzo')
        .setDescription('Vygeneruje nové číslo a pingne @everyone')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, GUILD_ID), { body: commands })
    .then(() => console.log('✅ Slash příkaz zaregistrován'))
    .catch(console.error);

client.once('ready', () => {
    console.log(`✅ Bot je online jako ${client.user.tag}`);

    cron.schedule('00 10 * * *', async () => {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (channel) {
            const randomNumber = (Math.random() * (999.999 - 99.9) + 99.9).toFixed(3);
            
            // Pokud existuje předchozí zpráva, smažeme ji
            if (lastMessageID) {
                const lastMessage = await channel.messages.fetch(lastMessageID);
                if (lastMessage) {
                    await lastMessage.delete();
                }
            }

            // Posíláme novou zprávu a uchováme její ID
            const newMessage = await channel.send(`Nová vysílačka: **${randomNumber}**`);
            lastMessageID = newMessage.id;
        }
    }, {
        timezone: "Europe/Prague"
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'enzo') {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (channel) {
            const randomNumber = (Math.random() * (999.999 - 99.9) + 99.9).toFixed(3);


            // Pokud existuje předchozí zpráva, smažeme ji
            if (lastMessageID) {
                const lastMessage = await channel.messages.fetch(lastMessageID);
                if (lastMessage) {
                    await lastMessage.delete();
                }
            }

            // Posíláme novou zprávu a uchováme její ID
            const newMessage = await channel.send(`@everyone\\nEnzo v pici: **${randomNumber}**`);
            lastMessageID = newMessage.id;

            await interaction.reply({ content: '✅ Číslo bylo vygenerováno a odesláno.', ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ Kanál nenalezen.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
