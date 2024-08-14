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
    const cursor = await usersCollection.find(query).toArray();

    res.send(cursor);
  };
};

// single user post in users collection
export const postSingleUser = (usersCollection) => {
  return async (req, res) => {
    const newUser = req.body;

    const query = { email: newUser.email };
    const alreadyExists = await usersCollection.findOne(query);
    if (alreadyExists)
      return res.status(409).send({ message: "user already exists" });

    const result = await usersCollection.insertOne(newUser);
    res.status(201).send({
      message: "user created successfully",
      insertedId: result.insertedId,
    });
  };
};

//single user lastlogin time store or login time store
export const patchStoreUserLastLoginTime = (usersCollection) => {
  return async (req, res) => {
    const email = req.query.email;

    const query = { email: email };

    const lastLoginTime = {
      $set: {
        lastSignInTime: req.body.lastSignInTime,
      },
    };

    const options = { upsert: true };

    const result = await usersCollection.updateOne(
      query,
      lastLoginTime,
      options
    );
    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "user not found" });
    }

    res.send({ message: "last login time updated successfully", result });
  };
};
