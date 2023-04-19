const Validator = require("fastest-validator");
const v = new Validator();

const inputValidator = function (body, schema) {
  var validate = v.validate(body, schema);
  return validate.length;
};

module.exports = {
  inputValidator,
};
