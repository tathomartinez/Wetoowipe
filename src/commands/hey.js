module.exports = {
    name: 'hola',
    description: 'Saluda',
    execute(message, args){
        message.channel.send('Hola ' + message.author.username + '??? ')
    }
}