import express from 'express'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import os from 'node:os'

import osc from 'osc'
import WebSocket from 'ws'
//
// crear app de express
const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url))

console.log('directorio', __dirname)
console.log(import.meta.url)
//
// servir todos los archivos en el directorio /public
app.use(express.static('public', { etag: false }))

// servir assets
app.use('/p5', express.static(__dirname + '/node_modules/p5/lib/'))
app.use('/osc', express.static(__dirname + '/node_modules/osc/dist/'))

// OSC

// funcion que toma la direccion IP
const getIPAddresses = () => {
    const interfaces = os.networkInterfaces()
    const ipAddresses = []

    for (const deviceName in interfaces){
        var addresses = interfaces[deviceName]

        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];

            if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }
    return ipAddresses
}

// puerto UDP
const udp = new osc.UDPPort({
    localAddress: '0.0.0.0',
    localPort: 7400,
    remoteAddress: '127.0.0.1',
    remotePort: 7500
});

udp.on('ready', () => {
    const ipAddresses = getIPAddresses()
    console.log('Listening for OSC over UDP.')
    ipAddresses.forEach( (address) => {
        console.log(' Host:', address + ', Port:', udp.options.localPort);
    });
    console.log('Broadcasting OSC over UDP to', udp.options.remoteAddress + ', Port:', udp.options.remotePort);

})

udp.on('message', (oscPacket) => {
  console.log('got something: ', oscPacket)

})
udp.open()

// socket para transmitir el
// osc que llega por udp a la app de p5js
// que esta en el browser
const wss = new WebSocket.Server({
  port: 8081
})

// cuando se conecta la app al socket se toma
// el socket que se conecto y se realiza el puente
// udp/ws a la app
wss.on('connection', (socket) => {
  console.log('WS connection established')
  const socketPort = new osc.WebSocketPort({
    socket: socket
  })
  // socket.on('close', (socket) => {
  //   socket.terminate()
  // })

  new osc.Relay(udp, socketPort, {
    raw: true
  })

  //console.log('relay', relay)
})

// servir index.html
app.get('/', (_, res) => {
  res.sendFile(join(__dirname, 'index.html'))
})

// puerto de escucha
const port = 3000;

// iniciar la app
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

