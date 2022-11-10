const {Scenes, Markup} = require('telegraf')
const db = require('../database')
const fs = require('fs')
const path = require('path')
let pathForFiles = path.join(__dirname, '../files')
let folder = null;
module.exports = new Scenes.WizardScene('sendFiles', async (ctx) => {
    try {
        folder = ctx.state.folder
        global.message.push({
            callback: async () => {
                return await ctx.replyWithHTML(`Вы выбрали папку: "${ctx.state.folder}" всё верно?`,Markup.keyboard([[{text:"Да"},{text:"Нет"}],[{text:"Отменить"}]]).resize().oneTime())
            }
        })
        ctx.wizard.next()
    } catch (err) {
        console.log(err)
    }
},async (ctx) => {
    try {
        if(ctx.message?.text?.toLowerCase() == "да"){
            console.log(folder)
            global.message.push({
                callback: async () => {
                    return await ctx.replyWithHTML(`Отправка начата!`)
                }
            })
            global.message.push({
                callback: async () => {
                    return await ctx.replyWithHTML(`Напоминание: во время отправки файлов, бот ответит на ваши сообщения после отправки`,Markup.removeKeyboard())
                }
            })
            db.query(`SELECT * FROM chat WHERE id_telegram IS NOT null and deleted = false`).then(res=>res.rows).then(res=>{
                fs.readdir(path.join(pathForFiles+"/"+folder), (err, files) => {
                    if (err) {
                        global.message.push({
                            callback: async () => {
                                return await ctx.replyWithHTML(`Ошибка доступа к папке с файлами!`)
                            }
                        })
                    }else{
                        console.log(files.length)
                        for (let i = 0; i < files.length; i++) {
                            res.forEach(chat=>{
                                if(String(files[i]).split('.')[0].toLowerCase() == chat.title.toLowerCase()){
                                    let message = {
                                        file: `${path.join(pathForFiles,folder,files[i])}`
                                    }
                                    if(files.indexOf('message_pic.jpg') != -1) {
                                        message.photo = `${path.join(pathForFiles,folder,'message_pic.jpg')}`
                                    }else{
                                        message.default_photo = `${path.join(pathForFiles,'DEFAULT','message_pic.jpg')}`
                                    }
                                    if(files.indexOf('message_text.txt') != -1){
                                        fs.readFile(`${path.join(pathForFiles,folder,'message_text.txt')}`, 'utf8',(err,data)=>{
                                            message.text = data
                                        })
                                    }else{
                                        fs.readFile(`${path.join(pathForFiles,'DEFAULT','message_text.txt')}`, 'utf8',(err,data)=>{
                                            message.default_text = data
                                        })
                                    }
                                    let interval = setInterval(()=>{
                                        if((message.text || message.default_text) && (message.photo || message.default_photo)){
                                            clearInterval(interval)
                                            global.message.push({
                                                callback: async () => {
                                                    ctx.telegram.sendPhoto(chat.id_telegram, {source: message?.photo ? message.photo : message.default_photo},{caption: message?.text ? message.text : message.default_text})
                                                    return await ctx.telegram.sendDocument(chat.id_telegram, {source: message.file})
                                                }
                                            })
                                        }
                                    },10)
                                }
                            })
                        }
                    }
                })
                global.message.push({
                    callback: async () => {
                        return await ctx.replyWithHTML('Меню', Markup.inlineKeyboard([
                            [{text: 'Инфо', callback_data: 'menu-info'}],
                            [{text: 'Сгенерировать код', callback_data: 'menu-generate'}],
                            [{text: 'Рассылка', callback_data: 'menu-send'}]
                        ]).resize())
                    }
                })
                ctx.scene.leave()
            })
        }else if(ctx.message?.text?.toLowerCase() == "нет"){
            let buttons = []
            fs.readdir(path, (err, files) => {
                let filesArray = files.filter(item=> item != 'DEFAULT')
                for (let i = 0; i < filesArray.length; i++) {
                    let file = filesArray[i]
                    buttons.push([{text: file, callback_data: file}])
                    if (i == filesArray.length - 1) {
                        global.message.push({
                            callback: async () => {
                                ctx.replyWithHTML(`Пожалуйста выберите папку:`, Markup.inlineKeyboard(buttons))
                                ctx.scene.leave()
                            }
                        })
                    }
                }
            })
        }else if(ctx.message?.text?.toLowerCase() == "отменить"){
            global.message.push({
                callback: async () => {
                    return await ctx.replyWithHTML('Вы отменили действие!',Markup.removeKeyboard())
                }
            })

            global.message.push({
                callback: async () => {
                    return await ctx.replyWithHTML('Меню', Markup.inlineKeyboard([
                        [{text: 'Инфо', callback_data: 'menu-info'}],
                        [{text: 'Сгенерировать код', callback_data: 'menu-generate'}],
                        [{text: 'Рассылка', callback_data: 'menu-send'}]
                    ]).resize())
                }
            })
            ctx.scene.leave()
        }
    } catch (err) {
        console.log(err)
    }
})
