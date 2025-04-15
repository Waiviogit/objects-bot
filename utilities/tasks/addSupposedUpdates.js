const { SUPPOSED_UPDATES_BY_TYPE } = require('@waivio/objects-processor');
const { ObjectType } = require('../../database').models;

const addSupposedUpdates = async () => {
  try {
    const objectTypes = ObjectType.find({}).lean();

    for await (const type of objectTypes) {
      const supposedUpdates = SUPPOSED_UPDATES_BY_TYPE[type?.name];
      if (!supposedUpdates?.length) continue;
      await ObjectType.updateOne(
        { _id: type._id },
        { $set: { supposed_updates: supposedUpdates } },
      );
    }
    console.log('task finished');
  } catch (error) {
    console.log(error.message);
  }
};

(async () => {
  await addSupposedUpdates();
  process.exit();
})();
