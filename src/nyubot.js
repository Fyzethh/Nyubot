const Discord = require('discord.js')
const client = new Discord.Client()
const fs = require('fs')

const utils = require('./utils')
const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'))
const prefix = config.prefix

client.login(config.discord_token)

client.on('ready', () => {
  console.log('NyuBot is ready!')
})

client.on('message', message => {
  let MessageText = message.content
  if (MessageText[0] === prefix) {
    utils.handleCommand(message, MessageText.substring(1))
  }
})
