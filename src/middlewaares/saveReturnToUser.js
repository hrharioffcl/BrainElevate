const saveReturnToUser = (req, res, next) => {
  if (req.method === "GET") {
    req.session.UserReturnTo = req.originalUrl;
  }
  next();
};

module.exports= {saveReturnToUser}