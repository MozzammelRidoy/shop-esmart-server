// all product load. 
export const getAllProducts = (productCollection) => {
  return async (req, res) => {
      // more operation integrate. like search, projection etc
      const cursor = await productCollection.find().toArray();
     res.send(cursor);
  };
};

// add new product
export const postAddNewProduct = (productCollection) => {
  return async(req, res) => {
    const newProduct = req.body; 
    console.log(newProduct); 
    res.send({message : 'data asche'})

  }
}






