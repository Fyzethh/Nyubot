const fs = require('fs')
const Discord = require('discord.js')
const ytdl = require('ytdl-core')
const request = require('request')
const client = new Discord.Client()
const fecthVideoInfo = require('youtube-info')
const getYoutubeID = require('get-youtube-id')
const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'))
const prefix = config.prefix
const YtApiKey = config.yt_api_key
let queue = []
let isPlaying = false

let dispatcher = null
let voiceChannel = null
let skipReq = 0
let skippers = []

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
      getID(args, id => {
        addToQueue(id)
        fecthVideoInfo(id, function (err, videoInfo) {
          if (err) throw new Error(err)
          message.reply(`** ${videoInfo} ** agregado a la cola`)
        })
      })
    } else {
      isPlaying = true
      getID(args, id => {
        queue.push('placeholder')
        playMusic(id, message)
        fecthVideoInfo(id, function (err, videoInfo) {
          if (err) throw new Error(err)
          message.reply(`Escuchando ** ${videoInfo} **`)
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
  if (msg.startsWith(`${prefix}delete msg `)) {
    const limit = message.content.split(' ')
    const validateINteger = /^\+?(0|[1-9]\d*)$/.test(limit[2])
    if (validateINteger) {
      message.channel.fetchMessages({limit: parseInt(limit[2])}).then(messages => message.channel.bulkDelete(messages))
    } else {
      message.reply('Debes ingresar un número de mensajes a eliminar')
    }
  }
})

function searchVideo (query, callback) {
  const q = encodeURIComponent(query)
  const url = `https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=${q}&key=${YtApiKey}`
  request(url, function (err, body) {
    const json = JSON.parse(body)
    callback(json.items[0].id.videoId)
  })
}
function playMusic (id, message) {
  voiceChannel = message.member.voiceChannel
  voiceChannel.join().then(connection => {
    const stream = ytdl(`https://www.youtube.com/watch?v=${id}`, {
      filter: 'audioonly'
    })
    skipReq = 0
    skippers = []
    dispatcher = connection.playStream(stream)
    dispatcher.on('end', function () {
      skipReq = 0
      skippers = []
      queue.shit()
      if (queue.length === 0) {
        queue = []
        isPlaying = false
      } else {
        playMusic(queue[0], message)
      }
    })
  })
}
function getID (str, callback) {
  if (isYoutube(str)) {
    callback(getYoutubeID(str))
  } else {
    searchVideo(str, id => {
      callback(id)
    })
  }
}

function addToQueue (strID) {
  if (isYoutube(strID)) {
    queue.push(getYoutubeID(strID))
  } else {
    queue.push(strID)
  }
}

function isYoutube (str) {
  return str.toLowerCase().indexOf('youtube.com') > -1
}
