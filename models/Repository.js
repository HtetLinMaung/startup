const { model, Schema } = require("mongoose");
const {
  REQUIRED_STRING,
  DEFAULT_STRING,
} = require("../constants/mongoose-constants");

const repositorySchema = new Schema(
  {
    git: REQUIRED_STRING,
    tag: REQUIRED_STRING,
    app: DEFAULT_STRING,
    version: DEFAULT_STRING,
  },
  { timestamps: true }
);

module.exports = model("Repository", repositorySchema);
