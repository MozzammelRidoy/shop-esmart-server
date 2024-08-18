import { ObjectId } from "mongodb";

//get all cetegoris load
export const getAllCategories = (categoriesCollection) => {
  return async (req, res) => {
    const cursor = await categoriesCollection.find().toArray();
    res.send(cursor);
  };
};

// add new categories
export const postNewCategories = (categoriesCollection) => {
  return async (req, res) => {
    const {categoryName} = req.body;
    const addNewCategory = ['all', categoryName]; 
   
    const query = { categoryName: addNewCategory };

    const alreadeyAdded = await categoriesCollection.findOne(query);
    if (alreadeyAdded) {
      return res.send({
        success: false,
        message: "This category already added",
      });
    }
    const newAddCategory = await categoriesCollection.insertOne({categoryName : addNewCategory});
    return res.send(newAddCategory);
  };
};

/////////////////////// Testing Incomplete.

//update specific category
export const putCategoryUpdate = (categoriesCollection, productsCollection) => {
  return async (req, res) => {
    try {
      const id = req.params.id;
      const oldCategoryName = req.body.oldCategoryName;
      const updateCategoryName = req.body.updateCategoryName;
      console.log('update and old category name', oldCategoryName, updateCategoryName);

      if (!id || !oldCategoryName || !updateCategoryName) {
        return res.status(400).send({ message: "Invalid input data" });
      }

      const productUpdateResult = await productsCollection.updateMany(
        { categoryName: oldCategoryName },
        { $set: { "categoryName.$": updateCategoryName } }
      );

      if (productUpdateResult.matchedCount === 0) {
        return res
          .status(404)
          .send({ message: "No products found with the given category" });
      } else if (productUpdateResult.modifiedCount === 0) {
        return res.status(500).send({ message: "Failed to update products" });
      }

      const query = { _id: new ObjectId(id), categoryName : oldCategoryName };
      const updateDoc = {
        $set: { "categoryName.$": updateCategoryName },
      };
      const options = { upsert: false };

      const categoryUpdateresult = await categoriesCollection.updateOne(
        query,
        updateDoc,
        options
      );

      if (categoryUpdateresult.matchedCount === 0) {
        return res.status(404).send({ message: "Category not found" });
      }
      return res.send(categoryUpdateresult);
    } catch (err) {
      return res.status(500).send({ message: "An error occurred", err });
    }
  };
};

// category datele
export const deleteCategoryOne = (categoriesCollection) => {
  return async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    // todo : when category delete, then similar category product set new categories.
    const result = await categoriesCollection.deleteOne(query);
    return res.send(result);
  };
};
