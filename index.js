
const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, REST } = require('discord.js');
const cron = require('node-cron');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const CHANNEL_ID = 'TVŮJ_CHANNEL_ID';
const GUILD_ID = 'TVŮJ_GUILD_ID';

const commands = [
    new SlashCommandBuilder()
        .setName('cislo')
        .setDescription('Vygeneruje nové číslo a pingne @everyone')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, GUILD_ID), { body: commands })
    .then(() => console.log('✅ Slash příkaz zaregistrován'))
    .catch(console.error);

client.once('ready', () => {
    console.log(`✅ Bot je online jako ${client.user.tag}`);

    cron.schedule('0 10 * * *', async () => {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (channel) {
            const randomNumber = (Math.random() * (999 - 100) + 100).toFixed(1);
            channel.send(`Dnešní číslo: **${randomNumber}**`);
        }
    }, {
        timezone: "Europe/Prague"
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'cislo') {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (channel) {
            const randomNumber = (Math.random() * (999 - 100) + 100).toFixed(1);
            await channel.send(`@everyone\nRuční generace čísla: **${randomNumber}**`);
            await interaction.reply({ content: '✅ Číslo bylo vygenerováno a odesláno.', ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ Kanál nenalezen.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
