const express = require("express");
const cors = require("cors");
const app = express();
const { ObjectId } = require("mongodb");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const port = process.env.PORT || 3001;

// middleware
app.use(express.json());
app.use(cors());

const uri = process.env.DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("BloodCare_User");
    const donersCollection = db.collection("doners");

    // doners api
    app.get("/doners", async (req, res) => {
      const query = {};
      const { email } = req.query;
      // /doners?email=''&
      if (email) {
        query.senderEmail = email;
      }

      const cursor = donersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/doners", async (req, res) => {
      const doners = req.body;
      const result = await donersCollection.insertOne(doners);
      res.send(result);
    });

    app.delete("/doners/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log("Deleting doner with ID:", id);

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid Doner ID format" });
        }

        const query = { _id: new ObjectId(id) };
        const result = await donersCollection.deleteOne(query);

        if (result.deletedCount === 1) {
          res.send({ success: true, message: "Doner deleted successfully" });
        } else {
          res.status(404).send({ success: false, message: "Doner not found" });
        }
      } catch (error) {
        console.error("Error deleting doner:", error);
        res.status(500).send({
          success: false,
          message: "Failed to delete doner",
          error: error.message,
        });
      }
    });

    // GET single donor by ID
    app.get("/doners/:id", async (req, res) => {
      const { id } = req.params;
      try {
        if (!ObjectId.isValid(id))
          return res.status(400).send({ error: "Invalid ID" });
        const property = await donersCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!property)
          return res.status(404).send({ error: "Property not found" });
        res.send(property);
      } catch (err) {
        console.error("Error fetching property:", err);
        res.status(500).send({ error: "Failed to fetch property" });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("BloodCare!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
