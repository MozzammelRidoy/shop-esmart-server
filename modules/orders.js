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
export const postOrdersSubmit = (ordersCollection, cartsCollection, couponsCollection, client) => {
  return async (req, res) => {
    const newOrder = req.body;
    const email = req.user.email;

    newOrder.createdAt = new Date();
    newOrder.order_status = "Pending";

    const session = client.startSession(); 


    try {
      session.startTransaction(); 

      const orderSubmitResult = await ordersCollection.insertOne(newOrder, {session});
      if (orderSubmitResult.insertedId) {
         const insertedId = orderSubmitResult.insertedId.toString(); 

        const query = { email: email };
       
        

            if (newOrder.couponCode) {
              const couponQuery = {
                coupon_code: newOrder.couponCode,
              };
              const coupon = await couponsCollection.findOne(couponQuery, {session}); 

              const user = coupon?.usage?.users?.find((u)=> u.email === email); 

              let couponDataUpdate = {}; 

              if(user){
                couponDataUpdate = {
                  $inc : {
                    total_count : 1,
                     "usage.users.$[elem].count": 1
                  }
                }
                await couponsCollection.updateOne(couponQuery, couponDataUpdate, {arrayFilters: [{ "elem.email": email }], session })
              }
              else{
                couponDataUpdate = {
                  $inc : {total_count : 1},
                  $push : {
                    "usage.users" : {email : email, count : 1}
                  }
                }
                await couponsCollection.updateOne(couponQuery, couponDataUpdate, {session})
              }

             }

        await cartsCollection.deleteMany(query, {session});

        await session.commitTransaction(); 
        session.endSession(); 

        return res.send({success : true, insertedId})
        
      }
    } catch (err) {
      await session.abortTranstion(); 
      session.endSession(); 
      
      return res.status(404).send({ message: "order Failed!" });
    }
  };
};
