const bcrypt = require("bcrypt");

const enc = async (text) => {
  var data = "";
  bcrypt
    .genSalt(10)
    .then((salt) => {
      return bcrypt.hash(text, salt);
    })
    .then((hash) => {
      data = hash;
    })
    .catch((err) => {
      console.log(err);
    });

  return data;
};

const dec = async (text) => {
  let salt = await bcrypt.genSalt(10);
  bcrypt.compare(text, salt, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    if (result) {
      return result;
    } else {
      return;
    }
  });
};

module.exports = { enc, dec };
