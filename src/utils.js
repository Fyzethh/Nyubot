const commands = require('./commands')

const searchCommand = (CommandName) => {
  console.log(CommandName)
  for (var i = 0; i < commands.length; i++) {
    if (commands[i].command === CommandName.toLowerCase()) {
      return commands[i]
    }
  }
  return false
}

const handleCommand = (message, text) => {
  let params = text.split(' ')
  let command = searchCommand(params[0])
  if (command) {
    if (params.length - 1 < command.parameters.length) {
      message.reply('Insufficient parameters!')
    } else {
      command.execute(message, params)
    }
  }
}

module.exports = {
  search_command: searchCommand,
  handleCommand: handleCommand
}
