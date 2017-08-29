const fs = require('fs')
const Discord = require('discord.js')
const client = new Discord.Client()
const fecthVideoInfo = require('youtube-info')
const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'))
const utils = require('./utils')
const prefix = config.prefix
let queue = []
let isPlaying = false

client.login(config.token)

client.on('ready', () => {
  console.log('NyuBot is ready!')
})

client.on('message', message => {
  const msg = message.content.toLowerCase()
  const args = message.content.split(' ').slice(1).join(' ')
  // music function
  if (msg.startsWith(`${prefix}play`)) {
    if (queue.length > 0 || isPlaying) {
      utils.getID(args, id => {
        utils.addToQueue(id)
        fecthVideoInfo(id, function (err, videoInfo) {
          if (err) throw new Error(err)
          message.reply(`** ${videoInfo.title} ** agregado a la cola`)
        })
      })
    } else {
      isPlaying = true
      utils.getID(args, id => {
        queue.push('placeholder')
        utils.playMusic(id, message)
        fecthVideoInfo(id, function (err, videoInfo) {
          if (err) throw new Error(err)
          message.reply(`Escuchando ** ${videoInfo.title} **  :man_dancing: `)
        })
      })
    }
  }
  // Ping message
  if (msg === 'ping') {
    message.reply('pong')
  }

  // If the message is "!mi avatar"
  if (message.content === `${prefix}mi avatar`) {
  // Send the user's avatar URL
    message.reply(message.author.avatarURL)
  }
  // delete messages of current channel example: "!delete msg 3"
  if (msg.startsWith(`${prefix}clear msg `)) {
    const limit = message.content.split(' ')
    const validateINteger = /^\+?(0|[1-9]\d*)$/.test(limit[2])
    if (validateINteger) {
      message.channel.fetchMessages({limit: parseInt(limit[2])}).then(messages => message.channel.bulkDelete(messages))
    } else {
      message.reply('Debes ingresar un número de mensajes a eliminar')
    }
  }
})
