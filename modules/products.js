import Fuse from "fuse.js";
import { ObjectId } from "mongodb";

// all product read for public.
export const getAllProducts = (productCollection) => {
  return async (req, res) => {
    const {
      category = "all",
      page = 0,
      size = 10,
      min = 0,
      max = 999999,
      sort = "date_asc",
    } = req.query;

    let query = {
      finalPrice: { $gte: Number(min), $lte: Number(max) },
    };
    if (category && category !== "all") {
      query.productCategory = { $in: [category] };
    }

    let sortOption = {};

    if (sort === "price_asc") {
      sortOption.finalPrice = 1;
    } else if (sort === "price_desc") {
      sortOption.finalPrice = -1;
    } else if (sort === "date_asc") {
      sortOption.createdAt = 1;
    } else if (sort === "date_desc") {
      sortOption.createdAt = -1;
    } else if (sort === "alpha_asc") {
      sortOption.productName = 1;
    } else if (sort === "alpha_desc") {
      sortOption.productName = -1;
    }
    const options = {
      projection: {
        _id: 1,
        productName: 1,
        discountPercent: 1,
        images: 1,
        finalPrice: 1,
        ratings: 1,
        totalRatingsCount: 1,
        averageRating : 1
      },
    };
    try {
      const products = await productCollection
        .find(query, options)
        .sort(sortOption)
        .skip(Number(page) * Number(size))
        .limit(Number(size))
        .toArray();
      const totalResults = await productCollection.countDocuments(query);

      res.send({
        products,
        numberOfPage: Math.ceil(totalResults / Number(size)),
        totalResults: totalResults,
      });
    } catch (err) {
      res.status(500).send({ message: "Failed to retrieve products", err });
    }
  };
};

// //product search with fuse.js
// export const getProductSearch = (productCollection) => {
//   return async(req, res)=> {
//     const {search = '', dataLoad = 10} = req.query; 

    

//     const options = {
//       projection: {
//         _id: 1,
//         productName: 1,
//         discountPercent: 1,
//         images: 1,
//         finalPrice: 1,
//         ratings: 1,
//         totalRatingsCount: 1,
//         averageRating : 1
//       },
//     };

//     try{
//       const products = await productCollection.find({}, options).limit(1000).toArray(); 

//       const fuse = new Fuse(products, {
//         keys : ['productName', 'productCode'],
//         includeScore : true,
//         threshold : 0.2,
//         tokenize : true,
//         matchAllTokens : true
//       }); 

//       const searchResults = fuse.search(search); 
//       const results = searchResults.map(result => result.item); 

      

      
//       return res.status(200).send({totalResults : results.length, searchResultss : results.slice(0, Number(dataLoad)) })
//     }
//     catch(err){
//       return res.status(400).send({message : 'Operation Failed!'})
//     }
//   }
// } 

//product search with mongodb regex
export const getProductSearch = (productCollection) => {
  return async(req, res)=> {
    const {search, dataLoad = 10} = req.query; 

    const query = {
      $or : [
        {productName : {$regex : search.split(' ').join("|"), $options : 'i'}},
        {productCode : {$regex : search.split(' ').join("|"), $options : 'i'}}
      ]
    }; 

    const options = {
      projection: {
        _id: 1,
        productName: 1,
        discountPercent: 1,
        images: 1,
        finalPrice: 1,
        ratings: 1,
        totalRatingsCount: 1,
        averageRating : 1
      },
    };

    try{
      const searchResultss = await productCollection.find(query, options).limit(Number(dataLoad)).toArray(); 

      const totalResults = await productCollection.countDocuments(query);
      return res.status(200).send({totalResults, searchResultss})
    }
    catch(err){
      return res.status(400).send({message : 'Operation Failed!'})
    }
  }
} 


//read single product for public
export const getSignleProductRead = (productCollection) => {
  return async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const options = {
      projection: { costPrice: 0, profit: 0 },
    };

    try {
      const singleProductResult = await productCollection.findOne(
        query,
        options
      );
      res.send(singleProductResult);
    } catch (err) {
      res.status(404).send({ message: "Product Not Found", err });
    }
  };
};

//all product read for admin
export const getAllProductReadForAdmin = (productCollection) => {
  return async (req, res) => {
    const { page = 0, size = 10, search = "" } = req.query;

    let query = {};
    if (search) {
      const searchWord = search.split(" ").filter((word) => word.trim() !== "");

      const isValidObjectId = ObjectId.isValid(search);
      query = {
        $or: [
          { code: { $regex: search, $options: "i" } },
          { productName: { $regex: searchWord.join("|"), $options: "i" } },
          ...(isValidObjectId ? [{ _id: new ObjectId(search) }] : []),
        ],
      };
    }

    try {
      const productsResult = await productCollection
        .find(query)
        .skip(Number(page) * Number(size))
        .limit(Number(size))
        .toArray();
      const totalResults = await productCollection.countDocuments(query);
      res.send({
        collections: productsResult,
        numberOfPage: Math.ceil(totalResults / Number(size)),
        totalResults: totalResults,
      });
    } catch {
      res.status(404).send({ message: "Products Not Found" });
    }
  };
};

// read single product for admin
export const getSigleProductReadForAdmin = (productCollection) => {
  return async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    try {
      const singleProductResult = await productCollection.findOne(query);
      res.send(singleProductResult);
    } catch (err) {
      return res.status(404).send({ message: "Product Not Found", err });
    }
  };
};

// add new product admin
export const postAddNewProduct = (productCollection) => {
  return async (req, res) => {
    const newProduct = req.body;
    if (!newProduct) {
      return res.status(404).send({ message: "Failed to Add new Product" });
    }

    newProduct.createdAt = new Date();
    (newProduct.totalRatingsCount = 0),
      (newProduct.averageRating = 0),
      (newProduct.ratings = []);

    try {
      const result = await productCollection.insertOne(newProduct);
      if (!result.insertedId) {
        return res.status(404).send({ message: "Failed to Add new Product" });
      }
      return res.send(result);
    } catch (err) {
      return res
        .status(404)
        .send({ message: "Failed to Add new Product", err });
    }
  };
};

// update a product
export const putUpdateProduct = (productCollection) => {
  return async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const productUpdateValue = req.body;
    const updateDoc = {
      $set: {
        ...productUpdateValue,
        lastEdit: new Date(),
      },
    };
    const options = { upsert: true };

    try {
      const updateProductResult = await productCollection.updateOne(
        query,
        updateDoc,
        options
      );

      return res.send(updateProductResult);
    } catch (err) {
      return res
        .status(404)
        .send({ message: "Failed to Add new Product", err });
    }
  };
};

// delete a product
export const deleteProduct = (productCollection) => {
  return async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    try {
      const deleteProduct = await productCollection.deleteOne(query);
      res.send(deleteProduct);
    } catch (err) {
      return res.status(404).send({ message: "Failed to Delete Product", err });
    }
  };
};

// products ratings check
export const getProductRatingCheck = (productCollection) => {
  return async(req, res)=> {
    const id = req.params.id; 
    const email = req.user.email; 

    const query = {_id : new ObjectId(id)}; 

    try{

      const product = await productCollection.findOne(query, {projection : {ratings : 1}}); 
     
      if(!product){
        return res.status(404).send({message : "Product Not Found"}); 

      }

      const hasRated = product.ratings.some(rating => rating.user === email); 

      if(hasRated){
        const userReview = product.ratings.find(rating => rating.user === email); 

        return res.status(200).send({ratingSubmit : false, userReview})
      }
      else{
        return res.status(200).send({ratingSubmit : true, message : 'User can submit a rating'})
      }

    }
    catch(err){
      return res.status(500).json({ message: "Server error, please try again later." });
    }


  }
}

// ratings submit
export const patchProductRatingSubmit = (productsCollection) => {
  return async (req, res) => {
    const { productId, user, rating, review = "" } = req.body;

    try {
      const product = await productsCollection.findOne({
        _id: new ObjectId(productId),
      });

      const currentRatings = product.ratings || []; 

      const updatedRatings = [
        ...currentRatings,
        { user, rating: Number(rating), review, createdAt: new Date() },
      ];

      const totalRatingsCount = updatedRatings.length;

      const sumOfRatings = updatedRatings.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = (sumOfRatings / totalRatingsCount).toFixed(1);

      const ratingSubmitResult = await productsCollection.updateOne(
        { _id: new ObjectId(productId) },
        {
          $set: {
            ratings: updatedRatings,
            totalRatingsCount,
            averageRating,
          },
        },
        {
          upsert: true,
        }
      );

      return res.status(200).send(ratingSubmitResult);
    } catch (err) {
      return res.status(400).send({ message: "Error submitting rating" });
    }
  };
};
