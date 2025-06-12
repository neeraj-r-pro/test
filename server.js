const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MongoDB connection
mongoose.connect('mongodb+srv://neeraj:NEERA1234@cluster0.cii2lea.mongodb.net/reviewsDB?retryWrites=true&w=majority')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


// Define review schema
const reviewSchema = new mongoose.Schema({
  userId: String,
  rating: Number,
  comment: String,
  timestamp: {
    type: String,
    default: () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  }
});

const Review = mongoose.model('Review', reviewSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(PUBLIC_DIR));

// Serve review form
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Handle review submission
app.post('/submit-review', async (req, res) => {
  const { userId, rating, comment } = req.body;

  if (!userId || !rating || !comment) {
    return res.status(400).send('❌ Missing fields');
  }

  try {
    const newReview = new Review({ userId, rating, comment });
    await newReview.save();
    res.send('✅ Review saved to MongoDB!');
  } catch (err) {
    console.error("❌ Failed to save review:", err);
    res.status(500).send('❌ Failed to save review');
  }
});

// View all reviews in HTML table
app.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ _id: -1 }); // latest first

    let html = `
      <html>
        <head>
          <title>User Reviews</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background-color: #f0f2f5; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background-color: #e0e0e0; }
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
      </html>`;

    res.send(html);
  } catch (err) {
    console.error("❌ Error loading reviews:", err);
    res.status(500).send('<h3>Error loading reviews</h3>');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
