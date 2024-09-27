import { ObjectId } from "mongodb";
import { jwtTokenCreate } from "./jwt.js";

export const getUserInformation = (usersCollection) => {
  return async(req, res) => {
    const email = req.query.email; 

    const query = {email : email}; 

    try{  
      const userInfoResult = await usersCollection.findOne(query); 
      return res.send(userInfoResult); 

    }

    catch(err){
      return res.status(404).send({message : 'not found'})
    }

  }
}


//only all normal users loaded
export const getAllUsers = (usersCollection) => {
  return async (req, res) => {
    const {dataLoad = 10, search} = req.query;  
    let query = { type: "user" };

    if(search){
      const searchQuery = {
        $or : [
          {email : {$regex : search, $options : 'i'}},
          {phone : {$regex : search, $options : 'i'}}
        ]
      } 

      if(ObjectId.isValid(search)){
        searchQuery.$or.push({_id : new ObjectId(search)})
      }

      query = {$and : [query, searchQuery]}
    }

   

    try{
      const usersResults = await usersCollection.find(query).limit(Number(dataLoad)).sort({createdAt : -1}).toArray();
      const totalResults = await usersCollection.countDocuments(query)

    return  res.status(200).send({users : usersResults, totalResults});
    }
    catch(err){
      return res.status(400).send({message : 'Operation Failed!'})
    }
  };
};



//only all manager, admin, moderator loaded
export const getAllAdmin = (usersCollection) => {
  return async (req, res) => {
    const {dataLoad = 10, search} = req.query; 
    let query = { type: { $ne: "user" } };
    if(search){
      const searchQuery = {
        $or : [
          {email : {$regex : search, $options : 'i'}},
          {phone : {$regex : search, $options : 'i'}}
        ]
      } 

      if(ObjectId.isValid(search)){
        searchQuery.$or.push({_id : new ObjectId(search)})
      }

      query = {$and : [query, searchQuery]}
    }
    
    try{
      const usersResults = await usersCollection
      .aggregate([
        { $match: query },
        {
          $addFields: {
            sortOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$type", "manager"] }, then: 1 },
                  { case: { $eq: ["$type", "admin"] }, then: 2 },
                  { case: { $eq: ["$type", "moderator"] }, then: 3 },
                ],
                default: 4,
              },
            },
          },
        },
        { $sort: { sortOrder: 1} },
      ]).limit(Number(dataLoad))
      .toArray();
      const totalResults = await usersCollection.countDocuments(query); 

     return res.status(200).send({users : usersResults, totalResults});
    }
    catch(err){
      return res.status(400).send({message : 'Operation Failed'})
    }
  };
};

// single user post in users collection or user sign UP
export const postSingleUser = (usersCollection) => {
  return async (req, res) => {
    const { email, type, isBaned } = req.body;
    const newUserToken = { email: email, type: type, isBaned: isBaned };

    const newUser = req.body;
    newUser.createdAt = new Date(); 

    const query = { email: newUser.email };

    const alreadyExists = await usersCollection.findOne(query);

    if (alreadyExists) {
      const alreadyExistsUserToken = {
        email: newUser.email,
        type: alreadyExists.type,
        isBaned: alreadyExists.isBaned,
      };
      
      const updateDoc = {
        $set: {
          lastSignInTime: newUser.lastSignInTime,
          activity: newUser.activity,
          type: alreadyExists.type,
          isBaned: alreadyExists.isBaned,
        },
      };
      const token = jwtTokenCreate(alreadyExistsUserToken);

      await usersCollection.updateOne(query, updateDoc, { upsert: true });
      return res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .status(201)
        .send({ message: "user already exists" });
    }

    const token = jwtTokenCreate(newUserToken);
    const result = await usersCollection.insertOne(newUser);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(201)
      .send({
        message: "user created successfully",
        insertedId: result.insertedId,
      });
  };
};

//single user lastlogin time store
export const patchStoreUserLastLoginTime = (usersCollection) => {
  return async (req, res) => {
    const { email, lastSignInTime } = req.body;
    const query = { email: email };

    const user = await usersCollection.findOne(query);

    if (!user) {
      return res.status(404).send({ message: "user not found" });
    }

    const updateDoc = {
      $set: { lastSignInTime: lastSignInTime, activity: true },
    };

    const options = { upsert: true };

    const result = await usersCollection.updateOne(query, updateDoc, options);
    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "user not found" });
    }

    const userToken = {
      email: user.email,
      type: user.type,
      isBaned: user.isBaned,
    };
    const token = jwtTokenCreate(userToken);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(201)
      .send({ success: true, result });
  };
};

// user last logout time store .

export const patchStoreUserLastLogOutTime = (usersCollection) => {
  return async (req, res) => {
    const { email, lastSignOutTime } = req.body;

    const query = { email: email };

    const user = await usersCollection.findOne(query);

    if (!user) {
      return res.status(404).send({ message: "user not found" });
    }

    const updateDoc = {
      $set: { lastSignOutTime: lastSignOutTime, activity: false },
    };

    const options = { upsert: true };

    const result = await usersCollection.updateOne(query, updateDoc, options);
    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "user not found" });
    }

    res.clearCookie("token").send({ success: true });
  };
};

// user information update 
export const putUserInfoUpdate = (usersCollection) => {
  return async(req, res) => {
    const email = req.query.email; 

    const userInfo = req.body ; 



    // console.log('user email', email, 'user shippin info', userInfo) ;

    try{
      const filter = {email : email}; 
      const updateDoc = {
        $set: {
          ...userInfo
        }
      }

      const options = {upsert : true}; 

      const updateInfoResult = await usersCollection.updateOne(filter, updateDoc, options); 

      return res.send(updateInfoResult)

    }
    catch(error){
      return res.status(500).send({ message: 'Failed to update user info', error })
    }

    
  }
}

// user delete
export const deleteUserByID = (usersCollection) => {
  return async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await usersCollection.deleteOne(query);
    res.send(result);
  };
};


// user type check 
export const getUserTypeCheck = (usersCollection) => {
  return async(req, res) => {
    const {email} = req.body;
    
    const query = {email : email}; 
    
    const user = await usersCollection.findOne(query); 
    if(!user){
      return res.status(401).send({message : "user not found"})
    }

    const type = user.type; 
    const isBaned = user.isBaned; 
   return res.status(200).send({type : type, isBaned : isBaned})
  }
}

// user role / type update || manager, admin, moderator or user
export const patchUserTypeUpdate = (usersCollection) => {
  return async(req, res) => {
    const {email, type} = req.body; 
    
    const query = {email : email}
    const updateDoc = {
      $set : {type : type }
    }
    const options = {upsert : true}
    const user = await usersCollection.updateOne(query, updateDoc, options)
    if(user.modifiedCount === 0){
      return res.send({message : 'Change failed', success : false})
    }
    if(user.modifiedCount){
      return res.send({success : true});
    }
  }
}

//user access update , access or banned
export const patchUserAccessUpdate = (usersCollection) => {
  return async(req, res) => {
    const {email, isBaned} = req.body; 
    
    const query = {email : email}
    const updateDoc = {
      $set : {isBaned : isBaned }
    }
    const options = {upsert : true}
    const user = await usersCollection.updateOne(query, updateDoc, options)
    if(user.modifiedCount === 0){
      return res.send({message : 'Ban failed', success : false})
    }
    if(user.modifiedCount){
      return res.send({success : true});
    }
  }
}