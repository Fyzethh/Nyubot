const fs = require('fs')
const getYoutubeID = require('get-youtube-id')
const ytdl = require('ytdl-core')
const request = require('request')
const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'))
const YtApiKey = config.yt_api_key
let dispatcher = null
let voiceChannel = null
let isPlaying = false
let skipReq = 0
let queue = []
let skippers = []

const searchVideo = (query, callback) => {
  const q = encodeURIComponent(query)
  const url = `https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=${q}&key=${YtApiKey}`
  request(url, function (err, body) {
    const json = JSON.parse(body)
    callback(json.items[0].id.videoId)
  })
}
const playMusic = (id, message) => {
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

const getID = (str, callback) => {
  if (isYoutube(str)) {
    callback(getYoutubeID(str))
  } else {
    searchVideo(str, id => {
      callback(id)
    })
  }
}

const addToQueue = strID => {
  if (isYoutube(strID)) {
    queue.push(getYoutubeID(strID))
  } else {
    queue.push(strID)
  }
}

const isYoutube = str => {
  return str.toLowerCase().indexOf('youtube.com') > -1
}

module.exports = {
  searchVideo: searchVideo,
  playMusic: playMusic,
  getID: getID,
  addToQueue: addToQueue,
  isYoutube: isYoutube
}
