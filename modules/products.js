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
    if(!newProduct){
      return res.status(404).send({message : 'Failed to Add new Product'})
    }
    try{
      const result = await productCollection.insertOne(newProduct); 
      if(!result.insertedId){
        return res.status(404).send({message : 'Failed to Add new Product'})
      }
      return res.send(result)
    }
    catch(err){
      return res.status(404).send({message : 'Failed to Add new Product' , err})
    }

  }
}






