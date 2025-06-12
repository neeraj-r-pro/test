const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Constants
const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const REVIEW_FILE = path.join(__dirname, 'reviews.json');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(PUBLIC_DIR));

// Route: Serve review form
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Route: Submit review
app.post('/submit-review', (req, res) => {
  const { userId, rating, comment } = req.body;

  // Validate input
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

  // Read existing reviews
  try {
    if (fs.existsSync(REVIEW_FILE)) {
      const fileData = fs.readFileSync(REVIEW_FILE, 'utf8');
      reviews = JSON.parse(fileData || '[]');
    }
  } catch (err) {
    console.error('Error reading review file:', err);
    return res.status(500).send('❌ Failed to read review file');
  }

  // Add new review
  reviews.push(reviewData);

  // Save to file
  try {
    fs.writeFileSync(REVIEW_FILE, JSON.stringify(reviews, null, 2), 'utf8');
    res.send('✅ Review saved successfully!');
  } catch (err) {
    console.error('Error writing review file:', err);
    res.status(500).send('❌ Failed to save review');
  }
});

// Route: View all reviews
app.get('/reviews', (req, res) => {
  try {
    if (!fs.existsSync(REVIEW_FILE)) return res.json([]);
    const data = fs.readFileSync(REVIEW_FILE, 'utf8');
    const reviews = JSON.parse(data || '[]');
    res.json(reviews);
  } catch (err) {
    console.error('Error loading reviews:', err);
    res.status(500).json({ error: 'Failed to read reviews' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
