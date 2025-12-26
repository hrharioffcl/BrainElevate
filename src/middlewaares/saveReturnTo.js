const saveReturnTo = (req, res, next) => {
  if (req.method === "GET") {
    req.session.returnTo = req.originalUrl;
  }
  next();
};

module.exports= {saveReturnTo}