const express = require("express");
const axios = require("axios");
const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const CURRENT_URL = process.env.CURRENT_URL;
let PORT = process.env.PORT || 3000;

const isAuthorized = (channelId) => {
  return channelId === process.env.CHANNEL_ID;
};

const getMessages = () => {
  return axios
    .get(process.env.MESSAGES_API)
    .then((res) => res.data.data.submissions)
    .catch((err) => err);
};

bot.command("start", (ctx) => {
  console.log(ctx.from);
  bot.telegram.sendMessage(
    ctx.chat.id,
    "Hello there, it's Exsite Studio's Bot!",
    {}
  );
});

bot.command("new", async (ctx) => {
  const messages = await getMessages();
  const authorized = isAuthorized(ctx.from.id);
  if (messages && authorized) {
    messages.map((message) => {
      const text = message.name
        ? `${message.name} with the email of: ${message.email}, sent you: ${message.message}`
        : `${message.email} Wants to get in touch with Exsite!`;
      bot.telegram.sendMessage(ctx.chat.id, text, {});
    });
  } else {
    bot.telegram.sendMessage(
      ctx.chat.id,
      "You're not authorized to use the bot!",
      {}
    );
  }
});

// this will set our webhook for our bot
bot.telegram.setWebhook(`${CURRENT_URL}/bot${process.env.TELEGRAM_TOKEN}`);

const app = express();

app.get("/", async (req, res) => {
  res.send("Exsite Studio's Telegram Bot");
});

// this unite Express with webHook from Telegraf
app.use(bot.webhookCallback(`/bot${process.env.TELEGRAM_TOKEN}`));

app.listen(PORT, () => {
  console.log(`Listen in the port ${PORT}`);
});
