const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user');
const generateResponse = require('./services/palmAPI');
const axios = require('axios');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json());

//Connect to MongoDB

  mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  app.post('/generate', async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await axios.post(
            'https://generativeai.googleapis.com/v1beta2/projects/neon-reporter-436318-d4/locations/us-central1/models/text-bison-001:generateText',
            {
                prompt: prompt,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        res.json({ response: response.data });
    } catch (error) {
        console.error('Error with Google PaLM API:', error);
        res.status(500).json({ message: 'Error generating response.' });
    }
});

// Chatbot 1: Fetch user data
app.post('/chatbot1', async (req, res) => {
  const { userQuery } = req.body;

  const prompt = `Fetch user data based on the query: ${userQuery}`;
  const chatbotResponse = await generateResponse(prompt);

  // Fetch users based on chatbot response
  const users = await User.find({ country: chatbotResponse.trim() });

  if (users.length > 0) {
    return res.json({ users });
  } else {
    return res.json({ message: 'No users found for the specified country.' });
  }
});

// Route to add a user
app.post('/users', async (req, res) => {
  const { name, country } = req.body;
  const newUser = new User({ name, country });
  
  try {
      await newUser.save();
      res.status(201).json(newUser);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});


// Chatbot 2: Analyze user data
app.post('/chatbot2', async (req, res) => {
  const { country } = req.body;

  // Fetch users from the database for analysis
  const users = await User.find({ country });

  // Count users from the same country
  const userCount = users.length;

  return res.json({ message: `There are ${userCount} users from ${country}.` });
});

// Serve the Chart.js visualization
app.get('/chart', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'chart.html'));
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
