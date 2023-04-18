const response = function (res, success, message, data, statusCode = 200) {
  var arr = {
    success: success,
    message: message,
    data: data,
  };

  res.status(statusCode).json(arr);
  res.end();
};

const response2 = (res, success, message, data) => {
  var arr = {
    success,
    message,
    data,
  };

  return res.json(arr);
};

module.exports = {
  response,
  response2,
};
