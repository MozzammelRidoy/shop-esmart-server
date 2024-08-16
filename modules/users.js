import { ObjectId } from "mongodb";
import { jwtTokenCreate } from "./jwt.js";

//only all normal users loaded
export const getAllUsers = (usersCollection) => {
  return async (req, res) => {
    const query = { type: "user" };

    const cursor = await usersCollection.find(query).toArray();
    res.send(cursor);
  };
};

//only all manager, admin, moderator loaded
export const getAllAdmin = (usersCollection) => {
  return async (req, res) => {
    const query = { type: { $ne: "user" } };
    const cursor = await usersCollection
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
        { $sort: { sortOrder: 1 } },
      ])
      .toArray();

    res.send(cursor);
  };
};

// single user post in users collection or user sign UP
export const postSingleUser = (usersCollection) => {
  return async (req, res) => {
    const { email, type, isBaned } = req.body;
    const userToken = { email: email, type: type, isBaned: isBaned };

    const newUser = req.body;

    const query = { email: newUser.email };

    const alreadyExists = await usersCollection.findOne(query);
    const token = jwtTokenCreate(userToken);
    if (alreadyExists){
      await usersCollection.updateOne(query, {$set : {activity : true}}, {upsert : true}); 
      return res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .status(201)
        .send({ message: "user already exists" });}

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

// user delete
export const deleteUserByID = (usersCollection) => {
  return async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await usersCollection.deleteOne(query);
    res.send(result);
  };
};
