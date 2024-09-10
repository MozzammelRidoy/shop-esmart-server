
// personal own order load for user / public api 
export const getALLOrdersRead = (ordersCollection) => {
    return async(req, res) => {
        const email = req.query.email; 

        const query = {email : email};

        try{
            const ordersResult = await ordersCollection.find(query).toArray(); 

            return res.send(ordersResult);
        }
        catch(err){
            return res.status(404).send({message : 'Not Found'}); 
        }
    }
} 

// user order submit or place by post 
export const postOrdersSubmit = (ordersCollection) => {
    return async(req, res)=> {
        const {orderData} = req.body; 
        orderData.createdAt = new Date(); 
        orderData.status = 'pending'; 

        try{
            const orderSubmitResult = await ordersCollection.insertOne(orderData); 
            return res.send(orderSubmitResult)
        }
        catch(err){
            return res.status(404).send({message : "order Failed!"})
        }
    }
}

