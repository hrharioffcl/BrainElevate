const course = require("../models/coursesSchema")


exports.getsuperadmindashboard =async (req,res)=>{
res.render('superadmindashboard', {
    adminName: "Miakel Corper",
    metrics: {
      courses: 3,
      students: 3,
      orders: 3,
      revenue: 1500
    },
    activities: [
      "New student registered",
      "Course 'JavaScript Basics' added",
      "Order #123 completed"
    ]
  })

}
exports.getContributorDashboard = async (req, res) => {

    const totalCourses = await course.countDocuments({
        createdBy: req.admin._id
    });

    const pendingCourses = await course.countDocuments({
        createdBy: req.admin._id,
        status: "pending"
    });

    const publishedCourses = await course.countDocuments({
        createdBy: req.admin._id,
        status: { $in: ["approved", "published"] }
    });

    const rejectedCourses = await course.countDocuments({
        createdBy: req.admin._id,
        status: "rejected"
    });

    const recentCourses = await course.find({
        createdBy: req.admin._id
    })
    .sort({ updatedAt: -1 })
    .limit(5);
console.log("route hitt2")
    res.render("contributor/contributorDashBoard", {
        totalCourses,
        pendingCourses,
        publishedCourses,
        rejectedCourses,
        recentCourses
    });
};