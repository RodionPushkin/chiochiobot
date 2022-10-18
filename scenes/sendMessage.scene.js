const {Scenes,Markup} = require('telegraf')
const config = require('../config.json')
const notification = require("../lib/notification");
let message = null;
module.exports = new Scenes.WizardScene(
    'sendMessage',
    async (ctx) => {
        try {
            ctx.replyWithHTML(`Введите сообщение`,Markup.removeKeyboard())
            ctx.state.message = null
            ctx.wizard.next()
        } catch (err){
            console.log(err)
        }
    },
    async (ctx) => {
        try {
            if(ctx.message?.text?.toLowerCase() == "да"){
                ctx.replyWithHTML(`Сообщение отправлено!`,Markup.removeKeyboard())
                if(message.photo && message.photo[0]?.file_id){
                    await notification.send((item)=>{
                        // if(message.text){
                        //     ctx.telegram.sendPhoto(Number(item.tgid), message.photo[0].file_id, {caption: message.text.replace('%%user%%',item.username).replace('%%month%%',new Date().toLocaleString('ru', { month: 'long' }))})
                        // }else{
                        //     ctx.telegram.sendPhoto(Number(item.tgid), message.photo[0].file_id)
                        // }
                    })
                }else if(message.document && message.document.file_id){
                    await notification.send((item)=>{
                        // if(message.text){
                        //     ctx.telegram.sendDocument(Number(item.tgid), message.document.file_id, {caption: message.text.replace('%%user%%',item.username).replace('%%month%%',new Date().toLocaleString('ru', { month: 'long' }))})
                        // }else{
                        //     ctx.telegram.sendDocument(Number(item.tgid), message.document.file_id)
                        // }
                    })
                }else{
                    await notification.send((item)=>{
                        // ctx.telegram.sendMessage(Number(item.tgid),message.text.replace('%%user%%',item.username).replace('%%month%%',new Date().toLocaleString('ru', { month: 'long' })))
                    })
                }
                ctx.scene.leave()
            }else if(ctx.message?.text?.toLowerCase() == "нет"){
                ctx.replyWithHTML(`Введите сообщение`,Markup.removeKeyboard())
            }else{
                message = {
                    text: ctx.message.text ? ctx.message.text : ctx.message.caption ? ctx.message.caption : undefined,
                    document: ctx.message.document,
                    photo: ctx.message.photo
                }
                if(message.photo && message.photo[0]?.file_id){
                    await ctx.replyWithHTML(`Проверьте ваше сообщение на точность, всё ли верно?`,Markup.keyboard(['Нет','Да'])).then(async ()=>{
                        await ctx.replyWithPhoto(message.photo[0].file_id, {caption: message.text})
                    })
                }else if(message.document && message.document.file_id){
                    await ctx.replyWithHTML(`Проверьте ваше сообщение на точность, всё ли верно?`,Markup.keyboard(['Нет','Да'])).then(async ()=>{
                        await ctx.replyWithDocument(message.document.file_id, {caption: message.text})
                    })
                }else{
                    await ctx.replyWithHTML(`Вы ввели: "${message.text}", проверьте на точность, всё ли верно?`,Markup.keyboard(['Нет','Да']))
                }
            }
        } catch (err){
            console.log(err)
        }
    },
)