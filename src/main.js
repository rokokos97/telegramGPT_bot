import {Telegraf, session} from "telegraf"
import { code } from "telegraf/format"
import { message } from "telegraf/filters"
import config from "config"
import {ogg} from "./ogg.js"
import {openAi} from "./openAi.js"

console.log(config.get('TEST_ENV'))

const INITIAL_SESSION = {
  messages: [],
}
const bot = new Telegraf(config.get("TELEGRAM_TOKEN"))

bot.use(session())
bot.command('new', async (ctx) => {
  ctx.session = INITIAL_SESSION
  await ctx.reply('Waiting your voice or text messages')
})
bot.command('start', async (ctx) => {
  ctx.session = INITIAL_SESSION
  await ctx.reply('Waiting your voice or text messages')
})
bot.on(message('voice'), async (ctx)=>{
  ctx.session ??= INITIAL_SESSION
  try{
    await ctx.reply(code('in progress...'))
    const voiceFileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id )
    const userId = String(ctx.message.from.id)
    console.log(userId)
    console.log(voiceFileLink.href)
    const oggPath = await ogg.create( voiceFileLink.href, userId)
    const mp3Path = await ogg.toMp3(oggPath, userId )

    const text = await openAi.transcription(mp3Path)
    await ctx.reply(code(`your question is: ${text}`))

    ctx.session.messages.push({
      role: openAi.roles.USER,
      content: text
    })

    const response = await openAi.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openAi.roles.ASSISTANT,
      content: response.content
    })
    await ctx.reply(response.content)
  } catch (error) {
    console.log("Error while voice message", error.message)
  }
})
bot.on(message('text'), async (ctx)=>{
  ctx.session ??= INITIAL_SESSION
  try{
    await ctx.reply(code('in progress...'))

    ctx.session.messages.push({
      role: openAi.roles.USER,
      content: ctx.message.text
    })

    const response = await openAi.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openAi.roles.ASSISTANT,
      content: response.content
    })

    await ctx.reply(response.content)
  } catch (error) {
    console.log("Error while text message", error.message)
  }

})

bot.launch()

process.once('SIGINT', ()=> bot.stop('SIGINT'))
process.once('SIGTERM', ()=> bot.stop('SIGTERM'))

