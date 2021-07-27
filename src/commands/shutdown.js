module.exports = {
    name: 'shutdown',
    description: 'Saluda',
    execute(message, args){
        message.channel.send('WORKING!!!...').then(console.log(">>> Apagando el servidor")).then(
        process.exit(1))
    }
}