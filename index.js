const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Client
const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Database & Collection
let donersCollection;

// MongoDB Connection + Server Start
async function startServer() {
  try {
    await client.connect();
    console.log("MongoDB Connected");

    const db = client.db("BloodCare_User");
    donersCollection = db.collection("doners");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

startServer();

// Routes

// Root
app.get("/", (req, res) => {
  res.send("BloodCare API running!");
});

// GET all doners
app.get("/doners", async (req, res) => {
  try {
    const result = await donersCollection.find().toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch doners" });
  }
});

// GET single doner by ID
app.get("/doners/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Doner ID" });
    }

    const doner = await donersCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!doner) {
      return res.status(404).json({ error: "Doner not found" });
    }

    res.json(doner);
  } catch (error) {
    console.error("GET DONER ERROR:", error);
    res.status(500).json({ error: "Failed to fetch doner" });
  }
});

// POST add doner
app.post("/doners", async (req, res) => {
  try {
    const doner = req.body;

    if (!doner || Object.keys(doner).length === 0) {
      return res.status(400).json({ error: "Doner data missing" });
    }

    const result = await donersCollection.insertOne(doner);

    res.status(201).json({
      success: true,
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("POST DONER ERROR:", error);
    res.status(500).json({ error: "Failed to add doner" });
  }
});

// DELETE doner by ID
app.delete("/doners/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Doner ID" });
    }

    const result = await donersCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Doner not found" });
    }

    res.json({ success: true, message: "Doner deleted successfully" });
  } catch (error) {
    console.error("DELETE DONER ERROR:", error);
    res.status(500).json({ error: "Failed to delete doner" });
  }
});
