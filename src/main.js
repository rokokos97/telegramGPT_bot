import {Telegraf} from "telegraf";
import { message } from "telegraf/filters";
import config from "config"

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.on(message('voice'), async (ctx)=>{
  try{
    const voiceFileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id )
    const userId = String(ctx.message.from.id)
    console.log(userId);
    console.log(voiceFileLink.href);
    await ctx.reply(JSON.stringify(voiceFileLink , null, 2))
  } catch (error) {
    console.log("Error while voice message", error.message);
  }

})
// Обробляємо початкову команду "старт"
bot.command('start', async (ctx)=>{
  await ctx.reply(JSON.stringify(ctx.message, null , 2));

})
bot.launch();

process.once('SIGINT', ()=> bot.stop('SIGINT'));
process.once('SIGTERM', ()=> bot.stop('SIGTERM'));

