const fs = require('fs')
const getYoutubeID = require('get-youtube-id')
const request = require('request')

const commands = require('./commands')
const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'))
const YtApiKey = config.yt_api_key

const  searchCommand = (command_name) => {
	for(var i = 0; i < commands.length; i++) {
		if(commands[i].command == command_name.toLowerCase()) {
			return commands[i]
		}
	}
	return false;
}

const  handleCommand = (message, text) => {
  let params = text.split(" ")
	let command = searchCommand(params[0])
	if(command) {
		if(params.length - 1 < command.parameters.length) {
			message.reply("Insufficient parameters!")
		} else {
      console.log(message)
			command.execute(message, params)
		}
	}
}

module.exports = {
  search_command: searchCommand,
  handleCommand: handleCommand,
}
