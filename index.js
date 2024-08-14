import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { getAllProducts } from "./modules/products.js";
import {
  getAllAdmin,
  getAllUsers,
  patchStoreUserLastLoginTime,
  postSingleUser,
} from "./modules/users.js";
import axios from "axios";

var app = express();
var port = process.env.PORT || 5000;

//middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://shopesmart-51ca8.web.app"],
  })
);
app.use(express.json());

// our middleware

// mongodb start here
// online
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASS}@cluster0.zmeeuxc.mongodb.net/?appName=Cluster0`;
// offline
// const uri = "mongodb://localhost:27017";

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

    const productsCollection = client.db("shopEsmartDb").collection("products");
    const usersCollection = client.db("shopEsmartDb").collection("users");

    //products releted api
    app.get("/products", getAllProducts(productsCollection));

    //users releted api
    app.get("/users", getAllUsers(usersCollection));
    app.get("/users/admin", getAllAdmin(usersCollection));
    app.post("/users", postSingleUser(usersCollection));
    app.patch("/users", patchStoreUserLastLoginTime(usersCollection));

    // captcha releted api
    app.post("/captcha/verify", async (req, res) => {
      const { token } = req.body;
      if (!token) {
        return res.status(400).send({ message: "Captcha Token is Required" });
      }
      try {
        const response = await axios.post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY_V2}&response=${token}`
        );

        if (response.data.success) {
          res.send(response.data);
        } else {
          res.status(400).send({ error: "Captcha Varification Failed!" });
        }
      } catch (err) {
        res.status(500).send({ error: "Captcha Varification Failed!" });
      }
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.get("/productCount", async (req, res) => {
      const count = await productsCollection.estimatedDocumentCount();
      res.send({ count });
    });

    app.get("/productsPagination", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);

      // console.log(`Page ${page} and Size ${size}`)

      const result = await productsCollection
        .find()
        .limit(size)
        .skip(page * size)
        .toArray();
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

//mongodb end here

app.get("/", (req, res) => {
  res.send("Server Active Now");
});

app.listen(port, () => {
  console.log("Server is Running on PORT : ", port);
});
