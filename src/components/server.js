const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    console.log('A new client connected');
    
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    // Send a message to the client right after establishing the connection
    ws.send('Hello! Message from server...');
});

console.log('WebSocket server started on ws://localhost:8080');
