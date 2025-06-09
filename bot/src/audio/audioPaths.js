const FILE_SERVER_URL = process.env.FILE_SERVER_URL || '';


const AudioPaths = {
    BIENVENIDO: './src/audio/bienvenido.ogg',
    goodbye: './src/audio/adios.ogg',
    error: './src/audio/crocodile-mugiwara.ogg',
    success: './src/audio/exito.ogg',
    help: './src/audio/help.wav',
    external : `${FILE_SERVER_URL}/crocodile-mugiwara.mp3`,
    video : `${FILE_SERVER_URL}/fake.mp4`,
    video : `${FILE_SERVER_URL}/A Besitos.mp3`,
};

module.exports = AudioPaths;