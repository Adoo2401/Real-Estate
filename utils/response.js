const responseSend = (resp, status, success, message) => {
  return resp.status(status).json({
    success,
    message,
  });
};

module.exports = responseSend;
