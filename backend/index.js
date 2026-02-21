const functions = require('firebase-functions');

// Example HTTP function — ready for deployment
exports.hello = functions.https.onRequest((req, res) => {
  res.json({ message: 'Zerostrike backend is running.' });
});
