import socketIOClient from 'socket.io-client';
const ENDPOINT = "http://YOUR_SERVER_ADDRESS"; // Replace with your actual server address

const socket = socketIOClient(ENDPOINT, { transports: ['websocket'] });

export const subscribeToRideUpdates = (rideId, callback) => {
  socket.on(`ride-update-${rideId}`, data => {
    callback(data);
  });
};

export const initializeSocketConnection = () => {
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

// gpt_pilot_debugging_log
console.log('Socket service initialized');
