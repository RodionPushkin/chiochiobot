const {Scenes,Markup} = require('telegraf')
const config = require('../config.json')
const token = require('../config.json').bot.token
module.exports = new Scenes.WizardScene(
    'settings',
    async (ctx) => {
        try {
        } catch (err){
            console.log(err)
        }
    },
)