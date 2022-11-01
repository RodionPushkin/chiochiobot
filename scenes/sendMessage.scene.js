const {Scenes, Markup} = require('telegraf')
const fs = require('fs')
const path = require('path')
let pathForFiles = path.join(__dirname, '../files')
module.exports = new Scenes.WizardScene('sendMessage', async (ctx) => {
    try {
        global.message.push({
            callback: async () => {
                ctx.replyWithHTML(`Вы желаете сделать рассылку по папкам или новое общее сообщение?`, Markup.keyboard([['Рассылка по папкам','Общее сообщение'],['Отменить']]).oneTime().resize())
            }
        })
        ctx.state.message = null
        ctx.wizard.next()
    } catch (err) {
        console.log(err)
    }
}, async (ctx) => {
    try {
        if (ctx.message?.text?.toLowerCase() == "рассылка по папкам") {
            let buttons = []
            try{
                console.log(pathForFiles)
                fs.readdir(pathForFiles, (err, files) => {
                    if(!err){
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
                    }else{
                        global.message.push({
                            callback: async () => {
                                return await ctx.replyWithHTML("У меня не получилось прочитать папки!", Markup.removeKeyboard())
                            }
                        })
                    }
                })
            }catch (e) {
                console.log(e)
                global.message.push({
                    callback: async () => {
                        return await ctx.replyWithHTML("У меня не получилось прочитать папки!", Markup.removeKeyboard())
                    }
                })
            }
        }
        else if(ctx.message?.text?.toLowerCase() == "общее сообщение"){
            ctx.scene.leave()
            ctx.scene.enter('sendNewMessage')
        }
        else if(ctx.message?.text?.toLowerCase() == "отменить"){
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
