import express from "express";
import cors from "cors";
import "dotenv/config";

import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { getAllProducts, postAddNewProduct } from "./modules/products.js";
import {
  deleteUserByID,
  getAllAdmin,
  getAllUsers,
  getUserTypeCheck,
  patchStoreUserLastLoginTime,
  patchStoreUserLastLogOutTime,
  patchUserAccessUpdate,
  patchUserTypeUpdate,
  postSingleUser,
} from "./modules/users.js";
import cookieParser from "cookie-parser";
import { jwtTokenClear } from "./modules/jwt.js";
import { googleCaptchaVerify } from "./modules/module.js";
import { isBaned, limiter, verifyToken } from "./modules/middlewares.js";
import { deleteCategoryOne, getAllCategories, postNewCategories, putCategoryUpdate } from "./modules/categories.js";

var app = express();
var port = process.env.PORT || 5000;

//middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://shopesmart-51ca8.web.app"],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials : true
  })
);
app.use(express.json());
app.use(cookieParser());




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
    const categoriesCollection = client.db("shopEsmartDb").collection("categories");

    // jwt json web token releted api  
    app.post('/logout', jwtTokenClear()); 


    //products releted api
    app.get("/products", getAllProducts(productsCollection));
    app.post("/products/addnew",  postAddNewProduct(productsCollection) );



    //categories releted api
    app.get('/categories', getAllCategories(categoriesCollection));
    app.post("/categories/addnew", verifyToken, isBaned, postNewCategories(categoriesCollection) );
    app.put('/categories/update/:id', verifyToken, isBaned, putCategoryUpdate(categoriesCollection, productsCollection));
    app.delete('/categories/delete/:id', verifyToken, isBaned, deleteCategoryOne(categoriesCollection));
    


    //users releted api
    app.get("/users", verifyToken, isBaned, getAllUsers(usersCollection));
    app.get("/users/admin", verifyToken, isBaned, getAllAdmin(usersCollection));
    app.post("/users",limiter, postSingleUser(usersCollection));
    app.patch("/users/login", limiter, patchStoreUserLastLoginTime(usersCollection));
    app.patch("/users/logout", patchStoreUserLastLogOutTime(usersCollection));
    app.delete("/users/:id", deleteUserByID(usersCollection));
    app.post("/users/type", verifyToken, isBaned, getUserTypeCheck(usersCollection));
    app.patch('/users/type/update', verifyToken, isBaned, patchUserTypeUpdate(usersCollection) );
    app.patch('/users/access/update', verifyToken, isBaned, patchUserAccessUpdate(usersCollection) );



    // for mongodb code customize
    app.get("/custome", async (req, res) => {
     
    });

    

    // captcha releted api
    app.post("/captcha/verify", googleCaptchaVerify());



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
