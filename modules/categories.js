import { ObjectId } from "mongodb";


//get all cetegoris load
export const getAllCategories = (categoriesCollection) => {
    return async (req, res) => {
        const cursor = await categoriesCollection.find().toArray(); 
        res.send(cursor);
    }
}

// add new categories 
export const postNewCategories = (categoriesCollection) => {
    return async (req, res) => {
        const categoryName = req.body; 
        const query = {categoryName : categoryName.categoryName};
        
        const alreadeyAdded = await categoriesCollection.findOne(query); 
        if(alreadeyAdded){
            return res.send({success : false, message : 'This category already added'})
        }
        const newAddCategory = await categoriesCollection.insertOne(categoryName); 
        res.send(newAddCategory);
    }
}

//update specific category
export const putCategoryUpdate = (categoriesCollection) => {
    return async(req, res) => {
        const id = req.params.id; 
        
        const query = {_id : new ObjectId(id)}; 
        const updateDoc = {
            $set : {categoryName : req.body.categoryName}
        }
        const options = {upsert : true}; 
        // todo : all product category change
        const result = await categoriesCollection.updateOne(query, updateDoc, options); 
        
        return res.send(result);
    }
}

// category datele 
export const deleteCategoryOne = (categoriesCollection) => {
    return async(req, res)=>{
        const id = req.params.id; 
        const query = {_id : new ObjectId(id)}; 
        
        // todo : when category delete, then similar category product set new categories. 
        const result = await categoriesCollection.deleteOne(query);
       return res.send(result);
    }
}