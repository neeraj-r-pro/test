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

// Serve form
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Handle review submission
app.post('/submit-review', (req, res) => {
  const { userId, rating, comment } = req.body;

  if (!userId || !rating || !comment) {
    return res.status(400).send('❌ Missing fields');
  }

  const newReview = {
    userId,
    rating,
    comment,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };

  let reviews = [];
  if (fs.existsSync(REVIEW_FILE)) {
    try {
      const rawData = fs.readFileSync(REVIEW_FILE, 'utf8').trim();
      reviews = rawData ? JSON.parse(rawData) : [];
    } catch (err) {
      console.error("❌ Failed to parse reviews.json:", err);
      return res.status(500).send('❌ Error reading existing reviews');
    }
  }

  reviews.push(newReview);

  try {
    fs.writeFileSync(REVIEW_FILE, JSON.stringify(reviews, null, 2), 'utf8');
    res.send('✅ Review saved successfully!');
  } catch (err) {
    console.error("❌ Failed to write reviews.json:", err);
    res.status(500).send('❌ Failed to save review');
  }
});

// View all reviews as HTML table
app.get('/reviews', (req, res) => {
  if (!fs.existsSync(REVIEW_FILE)) {
    return res.send('<h3>No reviews yet</h3>');
  }

  try {
    const rawData = fs.readFileSync(REVIEW_FILE, 'utf8').trim();
    const reviews = rawData ? JSON.parse(rawData) : [];

    let html = `
      <html>
        <head>
          <title>All Reviews</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <h2>User Reviews</h2>
          <table>
            <tr>
              <th>User ID</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Timestamp</th>
            </tr>`;

    for (const review of reviews) {
      html += `
        <tr>
          <td>${review.userId}</td>
          <td>${review.rating}</td>
          <td>${review.comment}</td>
          <td>${review.timestamp}</td>
        </tr>`;
    }

    html += `
          </table>
        </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error("❌ Failed to read reviews.json:", err);
    res.status(500).send('<h3>Error loading reviews</h3>');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
