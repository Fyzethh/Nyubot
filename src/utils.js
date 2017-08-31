const fs = require('fs')
const getYoutubeID = require('get-youtube-id')
const request = require('request')
const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'))
const YtApiKey = config.yt_api_key

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

module.exports = {
  searchVideo: searchVideo,
  getID: getID,
  isYoutube: isYoutube
}
