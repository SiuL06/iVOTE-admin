import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

// Set up Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Set up Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow only Vue.js client running on localhost:3000
    methods: ['GET', 'POST'],       // Allow GET and POST methods
  }
});

// List of nominees and votes tracking (no initial nominees)
let nominees = [];

const votes = {
  'lpamallari.student@ua.edu.ph': false, // Example admin who has voted
};

// Get current directory name for serving static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enable CORS to allow connections from the Vue.js client (localhost:3000)
app.use(cors({
  origin: 'http://localhost:3000', // Allow Vue.js client
}));

// Serve static files (for production, the 'dist' folder should contain the client build)
app.use(express.static(join(__dirname, 'dist')));

// Handle GET requests to the root URL (to serve index.html)
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html')); // Serve the index.html from dist
});

// Add a route for /home
app.get('/home', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html')); // Serve the same index.html
});

// Catch-all route for any other paths
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html')); // Serve the index.html for any other routes
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send current nominees to the newly connected client (even if there are no nominees)
  socket.emit('nomineeUpdate', nominees);

  // Listen for nominee updates (e.g., adding a new nominee)
  socket.on('addNominee', (newNominee) => {
    nominees.push(newNominee); // Add the new nominee to the list
    io.emit('nomineeUpdate', nominees); // Broadcast updated nominees list to all clients
  });

  // Listen for vote submissions
  socket.on('submitVote', (voteData) => {
    if (votes[voteData.userId]) {
      socket.emit('voteResponse', { success: false, message: 'You have already voted.' });
      return; // Stop processing if the user has already voted
    }

    // Find the nominee by ID
    const nominee = nominees.find(n => n.id === voteData.nomineeId);
    if (nominee) {
      nominee.score += 1; // Increment the nominee's score
      votes[voteData.userId] = true; // Mark the user as having voted
      console.log(`Vote submitted for: ${nominee.name}. New score: ${nominee.score}`);
      io.emit('nomineeUpdate', nominees); // Broadcast updated nominees to all clients
      socket.emit('voteResponse', { success: true, message: 'Your vote has been submitted successfully!' });
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Set up server to listen on port 3001
server.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
