const fs = require('fs')
const Discord = require('discord.js')
const client = new Discord.Client()
const fecthVideoInfo = require('youtube-info')
const ytdl = require('ytdl-core')
const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'))
const utils = require('./utils')

const getYoutubeID = require('get-youtube-id')
const prefix = config.prefix
let dispatcher = null
let voiceChannel = null
let queue = []
let queueInfo = []
let countQueue = 0
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
        addToQueue(id)
        fecthVideoInfo(id, function (err, videoInfo) {
          if (err) throw new Error(err)
          countQueue++
          queueInfo.push(`${countQueue}-${videoInfo.title}`)
          message.reply(`** ${videoInfo.title} ** agregado a la cola`)
        })
      })
    } else {
      isPlaying = true
      utils.getID(args, id => {
        playMusic(id, message)
        fecthVideoInfo(id, function (err, videoInfo) {
          if (err) throw new Error(err)
          message.reply(`Escuchando ** ${videoInfo.title} **  :man_dancing: `)
          message.reply(queue)
        })
      })
    }
  }
  // If the message is "!mi avatar"
  if (message.content === `${prefix}mi avatar`) {
  // Send the user's avatar URL
    message.reply(message.author.avatarURL)
  }
  // delete messages of current channel example: "!clean msg 3"
  if (msg.startsWith(`${prefix}clean msg `)) {
    const limit = message.content.split(' ')
    const validateINteger = /^\+?(0|[1-9]\d*)$/.test(limit[2])
    if (validateINteger) {
      message.channel.fetchMessages({limit: parseInt(limit[2])}).then(messages => message.channel.bulkDelete(messages))
    } else {
      message.reply('Debes ingresar un número de mensajes a eliminar')
    }
  }

  if (msg.startsWith(`${prefix}cola`)) {
    if (queueInfo.length === 0) {
      message.reply('no hay música en la cola :frowning2:')
    } else {
      message.reply(queueInfo)
    }
  }
})

const playMusic = (id, message) => {
  voiceChannel = message.member.voiceChannel
  voiceChannel.join().then(connection => {
    const stream = ytdl(`https://www.youtube.com/watch?v=${id}`, {
      filter: 'audioonly'
    })
    dispatcher = connection.playStream(stream)
    dispatcher.on('end', function () {
      queue.shift()
      if (queue.length === 0) {
        queue = []
        isPlaying = false
      } else {
        playMusic(queue[0], message)
      }
    })
  })
}

const addToQueue = strID => {
  if (utils.isYoutube(strID)) {
    queue.push(getYoutubeID(strID))
  } else {
    queue.push(strID)
  }
}
