const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@basic-project.hymtgk.mongodb.net/?appName=basic-project`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Welcome To LocalBite");
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const localBiteDB = client.db("LocalBiteDB");
    const reviewCollection = localBiteDB.collection("reviews");
    const userCollection = localBiteDB.collection("users");
    const favoriteReviewCollection = localBiteDB.collection('favorites')

    //user apis ;
    app.post("/users", async (req, res) => {
      try {
        const newUser = req.body;
        // Check if the user already exists
        const existingUser = await userCollection.findOne({
          email: newUser.email,
        });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "User already exists. Please login instead.",
          });
        }

        // Insert new user
        const result = await userCollection.insertOne(newUser);
        // Respond with success
        return res.status(201).json({
          success: true,
          message: "User registered successfully.",
          user: result,
        });
      } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error.",
        });
      }
    });

    //favorites apis:
    app.post("/myFavorites", async (req, res) => {
      const favorites = req.body;
      const result = await favoriteReviewCollection.insertOne(favorites);
      res.send(result);
    });
    app.get("/myFavorites", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.userEmail=email
        const cursor = favoriteReviewCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
      } else {
        return res.send({message:"user NOt found"})
      }
    });

    // POST /reviews
    app.post("/reviews", async (req, res) => {
      try {
        const newReview = {
          ...req.body,
          createdAt: new Date(), // Automatically add current date
        };

        const result = await reviewCollection.insertOne(newReview);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to add review" });
      }
    });
    // GET /reviews
    app.get("/reviews", async (req, res) => {
      try {
        const email = req.query.email;
        const query = {};
        if (email) {
          query.userEmail = email;
        }

        const cursor = reviewCollection.find(query).sort({ createdAt: -1 }); // Sort by newest first
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to fetch reviews" });
      }
    });
    // get single review
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });
    //update review;
    app.patch("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid review ID" });
      }
      const updatedReview = req.body;
      const updateDoc = {
        $set: {
          foodName: updatedReview.foodName,
          restaurantName: updatedReview.restaurantName,
          location: updatedReview.location,
          ratings: updatedReview.ratings,
          description: updatedReview.description,
          foodImage: updatedReview.foodImage, // optional if included
        },
      };
      const result = await reviewCollection.updateOne(
        {
          _id: new ObjectId(id),
        },
        updateDoc
      );
      res.send(result);
    });
    //delete review
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
