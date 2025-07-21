const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

let currentOtp = null;
let otpPhone = null;
let otpExpiry = null;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });

  currentOtp = generateOtp();
  otpPhone = phone;
  otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

  try {
    // Textbelt free API - only 1 SMS per day per IP (testing purpose)
    const response = await axios.post('https://textbelt.com/text', {
      phone,
      message: `Your OTP code is ${currentOtp}`,
      key: 'textbelt' // free key (limits apply)
    });

    if (response.data.success) {
      return res.json({ success: true, message: 'OTP sent successfully' });
    } else {
      return res.status(500).json({ success: false, message: response.data.error || 'Failed to send OTP' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error sending OTP', error: error.message });
  }
});

app.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
  }

  if (phone !== otpPhone) {
    return res.status(400).json({ success: false, message: 'Phone number does not match' });
  }

  if (Date.now() > otpExpiry) {
    return res.status(400).json({ success: false, message: 'OTP expired' });
  }

  if (otp === currentOtp) {
    // OTP verified successfully
    // Reset OTP data
    currentOtp = null;
    otpPhone = null;
    otpExpiry = null;

    return res.json({ success: true, message: 'OTP verified successfully' });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

app.listen(PORT, () => {
  console.log(`OTP server running on port ${PORT}`);
});
