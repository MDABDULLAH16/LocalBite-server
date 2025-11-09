const express = require("express"); const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://LocalBite:nesbRiO2TTh5lIIt@basic-project.hymtgk.mongodb.net/?appName=basic-project";

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

      const localBiteDB = client.db('LocalBiteDB');
      const reviewCollection = localBiteDB.collection('reviews');
      const userCollection = localBiteDB.collection('users');

      ///reviews apis;
      app.post('/reviews', async (req, res) => {
          const newReview = req.body;
          const result = await reviewCollection.insertOne(newReview);
          res.send(result);
      });
      app.get('/reviews', async (req, res) => {
          const email = req.query.email;
          const query = {};
          if (email) {
              query.userEmail = email;
          }
          const cursor = reviewCollection.find(query);
          const result = await cursor.toArray();
          res.send(result)
      })

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
