const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve review form on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'review.html'));
});

// Handle POST request
app.post('/submit-review', (req, res) => {
  const { userId, rating, comment } = req.body;
  const reviewData = {
    userId,
    rating,
    comment,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };

  const filePath = 'reviews.json';

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[\n');
  }

  // Read existing content and handle comma placement
  let existing = fs.readFileSync(filePath, 'utf8');
  existing = existing.trim();

  const isFirst = existing === '[';

  const toAppend = (isFirst ? '' : ',') + '\n' + JSON.stringify(reviewData, null, 2);

  fs.writeFileSync(filePath, existing + toAppend + '\n]', 'utf8');

  res.send('✅ Review saved successfully!');
});

// Start server
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
