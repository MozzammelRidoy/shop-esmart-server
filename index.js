import express, { query } from "express";
import cors from "cors";
import "dotenv/config";


import { MongoClient, ServerApiVersion } from "mongodb";
import { deleteProduct, getAllProductReadForAdmin, getAllProducts, getForYouProducts, getHotPicksProducts, getProductRatingCheck, getProductSearch, getReletedProducts, getSigleProductReadForAdmin,  getSignleProductRead,  patchProductRatingSubmit,  postAddNewProduct, putUpdateProduct } from "./modules/products.js";
import {
  deleteUserByID,
  getAllAdmin,
  getAllUsers,
  getUserInformation,
  getUserTypeCheck,
  patchStoreUserLastLoginTime,
  patchStoreUserLastLogOutTime,
  patchUserAccessUpdate,
  patchUserTypeUpdate,
  postSingleUser,
  putUserInfoUpdate,
} from "./modules/users.js";
import cookieParser from "cookie-parser";
import { jwtTokenClear } from "./modules/jwt.js";
import { deleteImageFromCloudinary, googleCaptchaVerify } from "./modules/module.js";
import { isAdminOrManager, isAnyAdmin, isBaned, isUserBlocked, limiter, verifyToken } from "./modules/middlewares.js";
import { deleteCategoryOne, getAllCategories, postNewCategories, putCategoryUpdate } from "./modules/categories.js";
import { getBannerImage, postBannerUpload, putBannerImages } from "./modules/banner.js";
import { deleteOneCart, getAllCartsRead, postNewAddToCarts, updateAddToCarts } from "./modules/carts.js";
import { deleteSingleOrder, getAllCanceledOrders, getAllCompleteOrders, getAllOrdersForAdmin, getALLOrdersRead, getAllPendingOrders, getAllTransaction, getProcessingOrdersForAdmin, patchUpdateOrderStatus, postOrdersSubmit } from "./modules/orders.js";
import { postCancelPayment, postFailedPayemt, postInitiatePayment, postSuccessPayment } from "./modules/payment.js";
import { deleteCoupons, getAllAvailableCoupons, getAllCouponsForAdmin, getSingleCoupon, patchUpdateCoupons, postNewCoupons, postUserApplyCoupon, } from "./modules/coupons.js";
import { deleteFavoriteClearAll, deleteFavoriteProduct, getAllFavoriteProduct, getCheckFavoriteProduct, postNewFavoriteProduct } from "./modules/favorite.js";
import { getAllOrderSummery, getExtendedSummary, getOrderAnalysis, getRevenueSummery } from "./modules/controllers.js";

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
app.use(express.urlencoded({extended: true}));
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
    const bannersCollection = client.db("shopEsmartDb").collection("banners");
    const cartsCollection = client.db("shopEsmartDb").collection("carts");
    const ordersCollection = client.db("shopEsmartDb").collection("orders");
    const couponsCollection = client.db("shopEsmartDb").collection("coupons");
    const favoritesCollection = client.db("shopEsmartDb").collection("favorites");

    // jwt json web token releted api  
    app.post('/logout', jwtTokenClear()); 


    //products releted api
    
    app.get('/products', getAllProducts(productsCollection));
    app.get('/products-search', getProductSearch(productsCollection));
    app.get('/products-hotPicks', getHotPicksProducts(productsCollection));
    app.get('/products-releted', getReletedProducts(productsCollection));
    app.get('/products-foryou', getForYouProducts(productsCollection));
    app.get('/products/admin',verifyToken, isBaned, isAnyAdmin, getAllProductReadForAdmin(productsCollection));
    app.get('/products/:id', getSignleProductRead(productsCollection) );
    app.get('/products-review-check/:id', verifyToken, isBaned, getProductRatingCheck(productsCollection) );
    app.get('/products/admin/:id', verifyToken, isBaned, isAnyAdmin, getSigleProductReadForAdmin(productsCollection));
    app.post('/products/addnew', verifyToken, isBaned, isAnyAdmin, postAddNewProduct(productsCollection) );
    app.patch('/products-review', verifyToken, isBaned, patchProductRatingSubmit(productsCollection))
    app.put('/products/update/:id', verifyToken, isBaned, isAnyAdmin, putUpdateProduct(productsCollection));
    app.delete('/products/delete/:id', verifyToken, isBaned, isAnyAdmin, deleteProduct(productsCollection));
    


    //categories releted api
    app.get('/categories', getAllCategories(categoriesCollection));
    app.post("/categories/addnew", verifyToken, isBaned, isAnyAdmin, postNewCategories(categoriesCollection) );
    app.put('/categories/update/:id', verifyToken, isBaned, isAnyAdmin, putCategoryUpdate(categoriesCollection, productsCollection));
    app.delete('/categories/delete/:id', verifyToken, isBaned, isAnyAdmin, deleteCategoryOne(categoriesCollection, productsCollection));


    //coupons releted api
    app.get('/coupons', verifyToken, isBaned, getAllAvailableCoupons(couponsCollection) ); 
    app.get('/coupons/admin',verifyToken, isBaned, isUserBlocked, getAllCouponsForAdmin(couponsCollection) ); 
    app.get('/coupons/:id', verifyToken, isBaned, getSingleCoupon(couponsCollection) ); 
    app.post('/coupons', verifyToken, isBaned, isUserBlocked, postNewCoupons(couponsCollection) );
    app.post('/coupons-apply', verifyToken, isBaned, postUserApplyCoupon(couponsCollection));
    app.patch('/coupons/:id', verifyToken, isBaned, isUserBlocked, patchUpdateCoupons(couponsCollection) ); 
    app.delete('/coupons-delete/:id', verifyToken, isBaned, isUserBlocked, deleteCoupons(couponsCollection) ); 

    
    //banner Releted api
    app.get('/banners', getBannerImage(bannersCollection)) ;
    app.post('/site-settings/banners', verifyToken, isBaned, isUserBlocked, isAnyAdmin, postBannerUpload(bannersCollection)); 
    app.put('/site-settings/banners/:id', verifyToken, isBaned, isUserBlocked, isAnyAdmin, putBannerImages(bannersCollection)); 
   
    
    


    //users releted api
    app.get("/usersInfo", verifyToken, isBaned, getUserInformation(usersCollection));
    app.get("/users", verifyToken, isBaned, isUserBlocked, isAnyAdmin, getAllUsers(usersCollection));
    app.get("/users/admin", verifyToken, isBaned, isUserBlocked, isAnyAdmin, getAllAdmin(usersCollection));
    app.post("/users",limiter, postSingleUser(usersCollection));
    app.patch("/users/login", limiter, patchStoreUserLastLoginTime(usersCollection));
    app.patch("/users/logout", patchStoreUserLastLogOutTime(usersCollection));
    app.put("/usersInfo", verifyToken, isBaned, putUserInfoUpdate(usersCollection));
    app.delete("/users/:id",verifyToken, isBaned, isUserBlocked, isAdminOrManager, deleteUserByID(usersCollection));
    app.post("/users/type", verifyToken, getUserTypeCheck(usersCollection));
    app.patch('/users/type/update', verifyToken, isBaned, isUserBlocked, isAdminOrManager, patchUserTypeUpdate(usersCollection) );
    app.patch('/users/access/update', verifyToken, isBaned, isUserBlocked, isAnyAdmin, patchUserAccessUpdate(usersCollection) );


    //carts releted api 
    app.get('/carts', verifyToken, isBaned, getAllCartsRead(cartsCollection)); 
    app.post('/carts', verifyToken, isBaned, postNewAddToCarts(cartsCollection)); 
    app.patch('/carts/:id', verifyToken, isBaned, updateAddToCarts(cartsCollection)); 
    app.delete('/carts/:id', verifyToken, isBaned, deleteOneCart(cartsCollection)); 


    //favorite releted api
    app.get('/favorites', verifyToken, isBaned, getAllFavoriteProduct(favoritesCollection, productsCollection)); 
    app.get('/favorites-check', getCheckFavoriteProduct(favoritesCollection)); 
    app.post('/favorites', verifyToken, isBaned, postNewFavoriteProduct(favoritesCollection)); 
    app.delete('/favorites', verifyToken, isBaned, deleteFavoriteProduct(favoritesCollection));
    app.delete('/favorites-clear-all/:email', verifyToken, isBaned, deleteFavoriteClearAll(favoritesCollection));



    
    //orders releted api 
    app.get('/orders', verifyToken, isBaned, getALLOrdersRead(ordersCollection)); 
    app.get('/orders-pending', verifyToken, isBaned, isUserBlocked, getAllPendingOrders(ordersCollection)); 
    app.get('/orders-all', verifyToken, isBaned, isUserBlocked, getAllOrdersForAdmin(ordersCollection)); 
    app.get('/orders-processing', verifyToken, isBaned, isUserBlocked, getProcessingOrdersForAdmin(ordersCollection)); 
    app.get('/orders-cancel', verifyToken, isBaned, isUserBlocked, getAllCanceledOrders(ordersCollection)); 
    app.get('/orders-complete', verifyToken, isBaned, isUserBlocked, getAllCompleteOrders(ordersCollection)); 
    app.get('/orders-transaction', verifyToken, isBaned, isUserBlocked, getAllTransaction(ordersCollection)); 
    app.post('/orders', verifyToken, isBaned, postOrdersSubmit(ordersCollection, cartsCollection, couponsCollection, client));
    app.patch('/orders-update/:id', verifyToken, isBaned, isUserBlocked, patchUpdateOrderStatus(ordersCollection, productsCollection)); 
    app.delete('/orders-delete/:id', verifyToken, isBaned, isUserBlocked, deleteSingleOrder(ordersCollection)); 


    //payment releted api
    app.post('/initiate-payment', verifyToken, isBaned, postInitiatePayment(ordersCollection) ); 
    app.post('/success-payment', verifyToken, isBaned, postSuccessPayment(ordersCollection, cartsCollection, couponsCollection, client) );
    app.post('/cancel-payment', verifyToken, isBaned, postCancelPayment(ordersCollection) );
    app.post('/failed-payment', verifyToken, isBaned, postFailedPayemt(ordersCollection) );


    //dashboard controller releted api 
    app.get('/orders-summery', getAllOrderSummery(ordersCollection, usersCollection)); 
    app.get('/orders-analysis', getOrderAnalysis(ordersCollection) );
    app.get('/revenue-summery', getRevenueSummery(ordersCollection, productsCollection)); 
    app.get('/extended-summary', getExtendedSummary(ordersCollection, productsCollection)); 
    


    
    

    // for mongodb code customize
    app.get("/custome", async (req, res) => {
          
    });

    

    // captcha releted api
    app.post("/captcha/verify", googleCaptchaVerify());


    //cloudinary releted api
    app.post('/delete-image',verifyToken, isBaned, deleteImageFromCloudinary())
    app.post('/site-settings/banner/delete',verifyToken, isBaned, isUserBlocked, deleteImageFromCloudinary())



    // app.get("/product/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await productsCollection.findOne(query);
    //   res.send(result);
    // });

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
