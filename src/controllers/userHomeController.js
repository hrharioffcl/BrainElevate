
const course = require("../models/coursesSchema")
const category = require("../models/categorySchema")
const Enrollment = require("../models/enrollmentSchema")


exports.gethome = async (req, res) => {
//enrolled courses
    let enrolledCourseIds = [];

if (req.user) {

    enrolledCourseIds =
    await Enrollment.distinct(
        "courseId",
        {
            studentId: req.user._id
        }
    );
}
    // CONTINUE LEARNING
    let continueLearning = [];

    if (req.user) {

        const continueLearningCourses =
            await Enrollment.find({
                studentId: req.user._id,
                progress: {
                    $gt: 0,
                    $lt: 100
                }
            })
                .sort({
                    lastAccessed: -1
                })
                .limit(6)
                .populate(
                    "courseId",
                    "name thumbnail author slug"
                );

        continueLearning =
            continueLearningCourses.map(en => ({
                id: en.courseId._id,
                title: en.courseId.name,
                thumbnail: en.courseId.thumbnail.url,
                instructor: en.courseId.author,
                progress: en.progress,
                slug: en.courseId.slug
            }));


    }


    const courses = await course.find({ isDeleted: false, status: "published", price: { $gt: 0 }, _id: { $nin: enrolledCourseIds} }).sort({ createdAt: -1 }).limit(4).populate("category", "name")
    const freeCourses = await course.find({ isDeleted: false, status: "published", price: 0, _id: { $nin: enrolledCourseIds} }).sort({ createdAt: -1 }).limit(4).populate("category", "name")
    const lowpricecourse = await course.find({ isDeleted: false, status: "published", price: { $lte: 500, $gt: 0 }, _id: { $nin: enrolledCourseIds} }).sort({ createdAt: -1 }).limit(4).populate("category", "name")
    const categories = await category.aggregate([
        { $match: { status: "active" } },
        { $limit: 8 },
        {
            $lookup: {
                from: "courses",
                localField: "_id",
                foreignField: "category",
                as: "courses"

            }
        },
        {
            $addFields: {
                coursecount: {
                    $size: {
                        $filter: {
                            input: "$courses",
                            as: "c",
                            cond: {
                                $and: [
                                    { $eq: ["$$c.status", "published"] },
                                    { $eq: ["$$c.isDeleted", false] }

                                ]
                            }

                        }
                    }
                }
            }
        }
    ])

    res.render('home', { fullName: req.user.fullName, referralLink: res.locals.referralLink, courses, lowpricecourse, categories, freeCourses, continueLearning })
}

