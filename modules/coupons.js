import { ObjectId } from "mongodb"

// all coupon read or load by email or for everyone
export const getAllAvailableCoupons = (couponsCollection) => {
    return async(req, res)=>{




        try{

        }
        catch(err){
            return res.status(404).send({message : 'Coupon Not Found!'})
        }
    }
}



// create a new coupon 
export const postNewCoupons = (couponsCollection) => {
    return async(req, res)=>{
        const {coupons} = req.body; 




        try{

        }
        catch(err){
            return res.status(400).send({message : "Coupon Create Failed!"})
        }
    }
}


// coupons update or edit, 
export const putUpdateCoupons = (couponsCollection) => {
    return async(req, res)=>{
        const id = req.params.id; 

        const query = {_id : new ObjectId(id)}; 

        const updateDoc = {
            $set : {

            }
        }
        const options = {upsert : true}; 


        try{

        }

        catch(err){
            return res.status(400).send({message : 'Coupon Update Failed!'})
        }
    }
}


// delete a coupon

export const deleteCoupons = (couponsCollection) => {
    return async(req, res) => {
        const id = req.params.id; 

        const filter = {_id : new ObjectId(id)}; 



        try{

        }

        catch(err){
            return res.status(400).send({message : 'Coupon Delete Failed!'})
        }
    }
}

