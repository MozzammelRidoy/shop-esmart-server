import { ObjectId } from "mongodb";

// all favorite product read or load
export const getAllFavoriteProduct = (favoritesCollection) => {
  return async (req, res) => {
    const email = req.user.email; 
    const {dataLoad = 10} = req.body;
    
    const query = {email : email}; 

    try {
        const favoriteResults = await favoritesCollection.find(query).limit(Number(dataLoad)).toArray(); 
        const totalResult = await ordersCollection.countDocuments(query);
        return res.status(200).send({favoriteResults, totalResult}); 
    } catch (err) {
      return res.status(404).send({ message: "Result Not Found!" });
    }
  };
};

//add or post new favorite product
export const postNewFavoriteProduct = (favoritesCollection) => {
  return async (req, res) => {
    const email = req.user.email; 
    const favoriteData = req.body.favoriteData; 
    favoriteData.email = email; 

    try {
        const postReults = await favoritesCollection.insertOne(favoriteData); 
        return res.status(200).send(postReults)
    } catch (err) {
      return res.status(404).send({ message: "Result Not Found!" });
    }
  };
};

//favorite product delete
export const deleteFavoriteProduct = (favoritesCollection) => {
  return async (req, res) => {
    const id = req.params.id; 
    const email = req.user.email; 
    const query = {_id : new ObjectId(id), email : email}; 

    try {
        const deleteResult = await favoritesCollection.deleteOne(query); 
        return res.status(200).send(deleteResult);
    } catch (err) {
      return res.status(404).send({ message: "Result Not Found!" });
    }
  };
};
