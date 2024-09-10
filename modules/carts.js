import { ObjectId } from "mongodb";

export const getAllCartsRead = (cartsCollection) => {
  return async (req, res) => {
    const email = req.query.email;

    const cartsResults = await cartsCollection
      .aggregate([
        { $match: { email: email } },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: "$quantity" },
            totalPrice: { $sum: { $multiply: ["$quantity", "$productPrice"] } },
            carts: { $push: "$$ROOT" },
          },
        },
      ])
      .toArray();

    if (cartsResults.length === 0) return res.send([]);

    res.send({
      totalQuantity: cartsResults[0].totalQuantity,
      totalPrice: cartsResults[0].totalPrice,
      carts: cartsResults[0].carts,
    });
  };
};

export const postNewAddToCarts = (cartsCollection) => {
  return async (req, res) => {
    const cartInfo = req.body;

   try{
       const insertCartsResult = await cartsCollection.insertOne(cartInfo);
       return res.send(insertCartsResult);

   }
   catch(err){
    return res.send({message : 'Operation Failed!'})
   }

  };
};

export const updateAddToCarts = (cartsCollection) => {
  return async (req, res) => {
    const id = req.params.id;
    const { quantity } = req.body;

    const query = { _id: new ObjectId(id) };

    const updateDoc = {
      $set: {
        quantity: quantity,
      },
    };

    const updateResult = await cartsCollection.updateOne(query, updateDoc);
    res.send(updateResult);
  };
};

export const deleteOneCart = (cartsCollection) => {
  return async (req, res) => {
    const id = req.params.id;

    const query = { _id: new ObjectId(id) };

    const deleteResult = await cartsCollection.deleteOne(query);
    res.send(deleteResult);
  };
};
