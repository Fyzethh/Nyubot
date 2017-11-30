const getYoutubeID = require('get-youtube-id')
const fecthVideoInfo = require('youtube-info')
const ytdl = require('ytdl-core')

const utils = require('./utils')

let dispatcher = null
let voiceChannel = null
let queue = []
let queueInfo = []
let countQueue = 0
let isPlaying = false

const commands = [
    {
        command: "play",
        description: "comand for play music !play 'url video of youtube'",
        parameters: [],
        execute: function(message, params) {
          const args = message.content.split(' ').slice(1).join(' ')        
          if (queue.length > 0 || isPlaying) {
            getID(args, id => {
              addToQueue(id)
              fecthVideoInfo(id, function (err, videoInfo) {
                if (err) throw new Error(err)
                countQueue++
                queueInfo.push(`${countQueue}-${videoInfo.title}`)
                message.reply(`** ${videoInfo.title} ** agregado a la cola :man_dancing:'`)
              })
            })
          } else {
            isPlaying = true
            getID(args, id => {
              playMusic(id, message)
              fecthVideoInfo(id, function (err, videoInfo) {
                if (err) throw new Error(err)
                message.reply(`Escuchando ** ${videoInfo.title} **  :man_dancing: `)
                message.reply(queue)
              })
            })
          }
        }
    },

    {
      command: "pause",
      description: "command pause for pause the current song'",
      parameters: [],
      execute: function(message, params) {
        if (dispatcher==null){
          message.reply('No hay canciones sonando')
        } else{
        if (isPlaying == true){
          isPlaying = false
          message.reply('se ha pausado la canción')
          dispatcher.pause()
        }else{
          isPlaying = true
          message.reply('se ha reanudado la canción')
          dispatcher.resume()
        }
      }
      }
  },
    
    {
        command: "cola",
        description: "ver la cola de música",
        parameters: [],
        execute: function(message, params) {
            if (queueInfo.length === 0) {
              message.reply('no hay música en la cola :frowning2:')
            } else {
              message.reply(queueInfo)
            }
        }
    },
    {
        command: "clean",
        description: "Resumes playlist",
        parameters: [],
        execute: function(message, params) {
            const limit = message.content.split(' ')
            const validateINteger = /^\+?(0|[1-9]\d*)$/.test(limit[2])
            if (validateINteger) {
              message.channel.fetchMessages({limit: parseInt(limit[2])}).then(messages => message.channel.bulkDelete(messages))
            } else {
              message.reply('Debes ingresar un número de mensajes a eliminar')
            }
        }
    },
    {
        command: "avatar",
        description: "Resumes playlist",
        parameters: [],
        execute: function(message, params) {
          message.reply(message.author.avatarURL)
        }
    },
  ]

  const searchVideo = (query, callback) => {
    const q = encodeURIComponent(query)
    const url = `https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=${q}&key=${YtApiKey}`
    request(url, function (err, body) {
      const json = JSON.parse(body)
      callback(json.items[0].id.videoId)
    })
  }
  
  const getID = (str, callback) => {
    if (isYoutube(str)) {
      callback(getYoutubeID(str))
    } else {
      searchVideo(str, id => {
        callback(id)
      })
    }
  }
  
  const isYoutube = str => {
    return str.toLowerCase().indexOf('youtube.com') > -1
  }
  
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
    if (isYoutube(strID)) {
      queue.push(getYoutubeID(strID))
    } else {
      queue.push(strID)
    }
  }
  
module.exports = commands
