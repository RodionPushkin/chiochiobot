const {Telegraf, Scenes, Markup, session} = require('telegraf')
const config = require('./config.json')
const bot = new Telegraf(config.bot.token)
const stage = new Scenes.Stage([
    require('./scenes/signup.scene'),
    require('./scenes/settings.scene'),
    require('./scenes/generate.scene'),
    require('./scenes/sendMessage.scene')
])
const db = require('./database');
// console.log()
bot.use(session())
bot.use(stage.middleware())
bot.use(require('./composers/start.composer'))
bot.use(require('./composers/utilities.composer'))
bot.launch().then(()=>{
    try{
        db.checkConnection()
        console.log(`${new Date().toLocaleString()},Бот запущен!`)
    }catch(err){
        console.log(err)
    }
})

