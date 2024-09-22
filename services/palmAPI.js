const axios = require('axios');

const PALM_API_URL = 'AIzaSyA2Odp91knlYXfRQkystMgWALJO_Rd3Awg';
const apiKey = process.env.PALM_API_KEY;

const generateResponse = async (prompt) => {
  try {
    const response = await axios.post(
      `${PALM_API_URL}?key=${apiKey}`,
      {
        prompt: { text: prompt }
      }
    );
    return response.data.candidates[0].output;
  } catch (error) {
    console.error('Error with PaLM API:', error);
    return null;
  }
};

module.exports = generateResponse;
