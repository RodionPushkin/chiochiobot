const {Scenes,Markup} = require('telegraf')
const config = require('../config.json')
const md5 = require("md5");
const db = require('../database')
let message = null;
module.exports = new Scenes.WizardScene(
    'generate',
    async (ctx) => {
        try {
            ctx.replyWithHTML(`Введите название организации (как имя файла для отправки)`,Markup.removeKeyboard()).then(()=>{
                ctx.replyWithHTML(`Напоминание: По этому имени бот будет искать файлы и отправлять в нужный чат`)
            })
            ctx.state.message = null
            ctx.wizard.next()
        } catch (err){
            console.log(err)
        }
    },
    async (ctx) => {
        try {
            if(ctx.message.text.toLowerCase() == "да"){
                if(message){
                    ctx.replyWithHTML(`Скопируйте сообщение ниже и отправьте нужному клиенту`).then(()=>{
                        db.query(`INSERT INTO "Chat" (username, code) VALUES ('${message}', '${md5(message)}')`).then(()=>{
                            ctx.replyWithHTML(`Ваш код: ${md5(message)}`,Markup.removeKeyboard())
                            ctx.scene.leave()
                        })
                    })
                }
            }else if(ctx.message.text.toLowerCase() == "нет"){
                ctx.replyWithHTML(`Введите название организации (как имя файла для отправки)`,Markup.removeKeyboard()).then(()=>{
                    ctx.replyWithHTML(`Напоминание: По этому имени бот будет искать файлы и отправлять в нужный чат`)
                })
            }else{
                message = ctx.message.text
                ctx.replyWithHTML(`Вы ввели: "${message}", проверьте на точность, всё верно?`,Markup.keyboard(['Нет','Да']))
            }
        } catch (err){
            console.log(err)
        }
    },
)