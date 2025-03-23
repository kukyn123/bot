
const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, REST } = require('discord.js');
const cron = require('node-cron');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const CHANNEL_ID = '999733580387340379';
const GUILD_ID = '999707970621419620';

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

    cron.schedule('02 23 * * *', async () => {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (channel) {
            const randomNumber = (Math.random() * (999 - 100) + 100).toFixed(1);
            channel.send(`# Nová vysílačka: **${randomNumber}**`);
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
            const randomNumber = (Math.random() * (999 - 100) + 100).toFixed(1);
            await channel.send(`@everyone\nEnzo v pici: **${randomNumber}**`);
            await interaction.reply({ content: '✅ Číslo bylo vygenerováno a odesláno.', ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ Kanál nenalezen.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
