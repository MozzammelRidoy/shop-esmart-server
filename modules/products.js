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
      query.productCategory = { $in : [category]};
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
      projection: { _id : 1, productName : 1, discountPercent : 1, images : 1, finalPrice : 1, ratings : 1, ratingsCount : 1 },
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
        numberOfPage: Math.ceil(totalResults / size),
        totalResults: totalResults,
      });
    } catch (err) {
      res.status(500).send({ message: "Failed to retrieve products", err });
    }
  };
};



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
    const query = {};

    try {
      const productsResult = await productCollection.find(query).toArray();
      res.send(productsResult);
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
