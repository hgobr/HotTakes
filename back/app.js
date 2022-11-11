const express = require('express');
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute');
const sauceRoute = require('./routes/sauceRoute');
const path = require('path');
const app = express();

mongoose
  .connect('mongodb+srv://admin:1234@mongodb01.dihobjr.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected ✅'))
  .catch(() => console.log('MongoDB connection failed ❌'));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoute);
app.use('/api/sauces', sauceRoute);

module.exports = app;
