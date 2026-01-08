
//admin/createcourse save
const saveReturnToCreateCourse= (req, res, next) => {
  if (req.method === "GET") {
    req.session.createCourseReturn = req.originalUrl;
  }
  next();
};
//admin/updatecourse save
const saveReturnToUpdateCourse= (req, res, next) => {
  if (req.method === "GET") {
    req.session.updateCourseReturn = req.originalUrl;
  }
  next();
};
//admin/addchapter save
const saveReturnToCreateChapter= (req, res, next) => {
  if (req.method === "GET") {
    req.session.createChapterReturn = req.originalUrl;
  }
  next();
};

//admin/updatechapter  save
const saveReturnToUpdateChapter= (req, res, next) => {
  if (req.method === "GET") {
    req.session.updateChapterReturn = req.originalUrl;
  }
  next();
};

module.exports= {saveReturnToCreateCourse,saveReturnToUpdateCourse,saveReturnToCreateChapter,saveReturnToUpdateChapter}