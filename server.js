const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const REVIEW_FILE = path.join(__dirname, 'reviews.json');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(PUBLIC_DIR));

// Serve review form page
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Submit review
app.post('/submit-review', (req, res) => {
  const { userId, rating, comment } = req.body;

  if (!userId || !rating || !comment) {
    return res.status(400).send('❌ Invalid review data');
  }

  const reviewData = {
    userId,
    rating,
    comment,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  };

  let reviews = [];

  if (fs.existsSync(REVIEW_FILE)) {
    try {
      const fileData = fs.readFileSync(REVIEW_FILE, 'utf8');
      reviews = JSON.parse(fileData);
    } catch (err) {
      return res.status(500).send('❌ Failed to read review file');
    }
  }

  reviews.push(reviewData);

  try {
    fs.writeFileSync(REVIEW_FILE, JSON.stringify(reviews, null, 2), 'utf8');
    res.send('✅ Review saved successfully!');
  } catch (err) {
    res.status(500).send('❌ Failed to save review');
  }
});

// View all reviews
app.get('/reviews', (req, res) => {
  if (!fs.existsSync(REVIEW_FILE)) {
    return res.json([]);
  }

  try {
    const data = fs.readFileSync(REVIEW_FILE, 'utf8');
    const reviews = data ? JSON.parse(data) : [];
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read reviews' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
