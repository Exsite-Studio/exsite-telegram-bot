const express = require("express");
const axios = require("axios");
const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const CURRENT_URL = process.env.CURRENT_URL;
let PORT = process.env.PORT || 3000;

const getMessages = () => {
  return axios
    .get(process.env.MESSAGES_API)
    .then((res) => res.data.data.submissions)
    .catch((err) => err);
};

bot.command("start", (ctx) => {
  console.log(ctx.from);
  bot.telegram.sendMessage(ctx.chat.id, "Hello there, it's Exsite Bot!", {});
});

bot.command("new", async (ctx) => {
  const messages = await getMessages();
  if (messages) {
    messages.map((message) => {
      const text = message.name
        ? `${message.name} with the email of: ${message.email}, sent you: ${message.message}`
        : `${message.email} Wants to get in touch with Exsite!`;
      bot.telegram.sendMessage(ctx.chat.id, text, {});
    });
  }
});

// this will set our webhook for our bot
bot.telegram.setWebhook(`${CURRENT_URL}/telegraf/${bot.secretPathComponent()}`);

const app = express();

app.get("/", (req, res) => {
  res.send("Our new tab!!");
});

// this unite Express with webHook from Telegraf
app.use(bot.webhookCallback(`/telegraf/${bot.secretPathComponent()}`));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listen in the port ${PORT}`);
});

// bot.launch();
