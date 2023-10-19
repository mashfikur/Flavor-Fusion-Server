const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome To The Flavor Fusion Server");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rnoho8k.mongodb.net/?retryWrites=true&w=majority`;

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

    const database = client.db("flavorDB");

    const productCollection = database.collection("productCollection");
    const brandAds = database.collection("brandAds");
    const cartCollection = database.collection("cartCollection");

    app.get("/brands/:name", async (req, res) => {
      const brandName = req.params.name;
      const query = { brandName: brandName };
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/brands/ads/:name", async (req, res) => {
      const brandName = req.params.name;
      const query = { brandName: brandName };
      const cursor = brandAds.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);

      res.send(result);
    });

    app.put("/products/:id/update", async (req, res) => {
      const id = req.params.id;
      const updatedInfo = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedProduct = {
        $set: {
          prodName: updatedInfo.prodName,
          brandName: updatedInfo.brandName,
          prodImg: updatedInfo.prodImg,
          type: updatedInfo.type,
          price: updatedInfo.price,
          rating: updatedInfo.rating,
          description: updatedInfo.description,
        },
      };

      const result = await productCollection.updateOne(
        filter,
        updatedProduct,
        options
      );

      res.send(result);
    });

    app.post("/cart/add", async (req, res) => {
      const cartInfo = req.body;
      const result = await cartCollection.insertOne(cartInfo);

      res.send(result);
    });

    app.post("/brands/ads", async (req, res) => {
      const adInfo = req.body;
      const result = await brandAds.insertOne(adInfo);

      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const productInfo = req.body;
      const result = await productCollection.insertOne(productInfo);

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
  console.log(`Server is running on port ${port}`);
});
