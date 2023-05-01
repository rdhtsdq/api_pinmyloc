const response = function (res, success, message, data = [], statusCode = 200) {
  var arr = {
    success: success,
    message: message,
    data: data,
  };

  res.status(statusCode).json(arr);
  res.end();
};

module.exports = {
  response,
};
