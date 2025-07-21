const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve index.html

// OTP generator
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  const otp = generateOTP();

  try {
    const response = await axios.post('https://textbelt.com/text', {
      phone,
      message: `🔐 Your OTP Code is: ${otp}`,
      key: 'textbelt', // use 'textbelt' for test (1 msg/day), upgrade for production
    });

    res.json({ success: response.data.success, otp, message: 'OTP sent!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
