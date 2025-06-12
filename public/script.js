// Generate a random user ID
function generateUserId() {
  return 'user_' + Math.random().toString(36).substring(2, 12);
}

// Get or create user ID from cookie
function getUserId() {
  const match = document.cookie.match(/userId=([^;]+)/);
  if (match) return match[1];

  const newUserId = generateUserId();
  document.cookie = `userId=${newUserId}; path=/; max-age=31536000`; // 1 year
  return newUserId;
}

document.getElementById('reviewForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const userId = getUserId();
  const rating = document.querySelector('input[name="rating"]:checked')?.value;
  const comment = document.getElementById('comment').value;

  if (!rating) {
    alert("Please select a rating.");
    return;
  }

  fetch('/submit-review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, rating, comment })
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      document.getElementById('reviewForm').reset();
    })
    .catch(err => {
      console.error(err);
      alert("❌ Failed to submit review");
    });
});
