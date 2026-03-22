const { nanoid } = require("nanoid");
const slugify = require("../utils/slugify");

const generateSlug = (name) => {
  return `${slugify(name)}-${nanoid(4)}`;
};

module.exports = generateSlug;