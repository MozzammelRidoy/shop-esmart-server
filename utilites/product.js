

export const getAllProducts = (productCollection) => {
  return async (req, res) => {
   
      const cursor = await productCollection.find().toArray();
     res.send(cursor);
  };
};




