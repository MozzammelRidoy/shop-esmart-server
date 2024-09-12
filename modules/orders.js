import "dotenv/config";

// personal own order load for user / public api
export const getALLOrdersRead = (ordersCollection) => {
  return async (req, res) => {
    const email = req.query.email;

    // const query = {email : email};

    try {
      const ordersResult = await ordersCollection.find().toArray();

      return res.send(ordersResult);
    } catch (err) {
      return res.status(404).send({ message: "Not Found" });
    }
  };
};

// user order submit or place by post
export const postOrdersSubmit = (ordersCollection, cartsCollection) => {
  return async (req, res) => {
    const newOrder = req.body;

    newOrder.createdAt = new Date();
    newOrder.order_status = "Pending";

    try {
      const orderSubmitResult = await ordersCollection.insertOne(newOrder);
      if (orderSubmitResult.insertedId) {
        const email = req.user.email;
         const insertedId = orderSubmitResult.insertedId.toString(); 

        const query = { email: email };
       

        await cartsCollection.deleteMany(query);

        return res.send({success : true, insertedId})
        
      }
    } catch (err) {
      return res.status(404).send({ message: "order Failed!" });
    }
  };
};
