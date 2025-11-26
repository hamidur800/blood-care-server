const express = require("express");
const cors = require("cors");
const app = express();
const { ObjectId } = require("mongodb");
const connectDB = require("../db");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("BloodCare API running!");
});

// /doners API
app.get("/doners", async (req, res) => {
  try {
    const db = await connectDB();
    const donersCollection = db.collection("doners");
    const query = {};
    const { email } = req.query;
    if (email) query.senderEmail = email;

    const doners = await donersCollection.find(query).toArray();
    res.json(doners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch doners" });
  }
});

// POST /doners
app.post("/doners", async (req, res) => {
  try {
    const db = await connectDB();
    const donersCollection = db.collection("doners");
    const result = await donersCollection.insertOne(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add doner" });
  }
});

// DELETE /doners/:id
app.delete("/doners/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const donersCollection = db.collection("doners");
    const id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid ID" });

    const result = await donersCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) res.json({ success: true });
    else res.status(404).json({ success: false, error: "Doner not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete doner" });
  }
});

// GET /doners/:id
app.get("/doners/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const donersCollection = db.collection("doners");
    const id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid ID" });

    const doner = await donersCollection.findOne({ _id: new ObjectId(id) });
    if (!doner) return res.status(404).json({ error: "Doner not found" });

    res.json(doner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch doner" });
  }
});

// Export as serverless function
module.exports = (req, res) => {
  app(req, res);
};
