const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB

DB_URL ='mongodb://0.0.0/email-app';
mongoose.connect(DB_URL);
const conn = mongoose.connection;


conn.once('open', ()=>{
  console.log("MongoDB connected successfully");
})

conn.on('error', ()=>{
  console.log("Error connecting DB");
  process.exit();
})
// , {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// Define the Mongoose schema for an email
const emailSchema = new mongoose.Schema({
  from: String,
  to: String,
  subject: String,
  body: String,
  read: { type: Boolean, default: false },
  
});

// Create the Email model
const Email = mongoose.model('email', emailSchema);

// API endpoints

// Get all emails
app.get("/api/emails", async (req, res) => {
   Email.find({}).then(function(email){
  res.json(email);
  }).catch(function(err){
    console.log(err)
  })
});

//get email id
app.get("/api/emails/:id", async (req, res) => {
  try {
    const emails = await Email.find({});
    res.json(emails.map(email => email._id));
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Send a new email
app.post("/api/send-email", async (req, res) => {
  const newEmail = new Email({
from:req.body.from,
to:req.body.to,
subject:req.body.subject,
body:req.body.body,
read:req.body.read
  });
  await newEmail.save();
  res.json(newEmail);
  
});

// Get unread emails
app.get("/api/unread-emails", async (req, res) => {
  const unreadEmails = await Email.find({ read: false });
  res.json(unreadEmails);
});

// // Mark an email as read
// app.put("/api/mark-read/:id", async (req, res) => {
//   const email = await Email.findById(req.params.id);
//   email.read = true;
//   await email.save();
//   res.json(email);
// });


// API endpoint to fetch message counts
app.get("/api/email-counts", async (req, res) => {
  try {
    const totalEmails = await Email.countDocuments({});
    const unreadEmails = await Email.countDocuments({ read: false });
    res.json({ totalEmails, unreadEmails });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching message counts' });
  }
});





// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));