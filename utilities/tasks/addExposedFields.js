const { EXPOSED_FIELDS_FOR_OBJECT_TYPE } = require('@waivio/objects-processor');
const { ObjectType } = require('../../database').models;

const addExposedFields = async () => {
  try {
    const objectTypes = ObjectType.find({}).lean();

    for await (const type of objectTypes) {
      const exposedFields = EXPOSED_FIELDS_FOR_OBJECT_TYPE[type?.name];
      if (!exposedFields?.length) continue;
      await ObjectType.updateOne(
        { _id: type._id },
        { $addToSet: { exposedFields: { $each: exposedFields } } },
      );
    }
    console.log('task finished');
  } catch (error) {
    console.log(error.message);
  }
};

(async () => {
  await addExposedFields();
  process.exit();
})();
