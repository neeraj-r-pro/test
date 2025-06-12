const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Handle POST request
app.post('/submit-review', (req, res) => {
  const { userId, rating, comment } = req.body;
  const reviewData = {
    userId,
    rating,
    comment,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };

  fs.appendFile('reviews.json', JSON.stringify(reviewData) + ',\n', err => {
    if (err) {
      console.error('Error saving review:', err);
      return res.status(500).send('Error saving review');
    }
    res.send('Review saved successfully');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
