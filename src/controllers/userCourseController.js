
const course = require("../models/coursesSchema")
const category = require("../models/categorySchema")
const Cart = require("../models/cartSchema");
const Wishlist = require("../models/wishListSchema")
const User = require("../models/userSchema")
const Enrollments = require("../models/enrollmentSchema")
const Chapters = require("../models/chapterScheema")
const Review = require("../models/reviewSchema")
const getSignedVideoUrl = require("../utils/getSignedVidoeUrl");
exports.getcourse = async (req, res) => {
  try {
    const { search, categories, rating, level, price, duration, sortBy = 'latest', page = 1, limit = 12 } = req.query;
    const user = res.locals.user;

    const selectedFilters = {
      search: search || '',
      categories: categories ? (Array.isArray(categories) ? categories : [categories]) : [],
      rating: rating ? (Array.isArray(rating) ? rating : [rating]).map(Number) : [],
      level: level ? (Array.isArray(level) ? level : [level]) : [],
      price: price ? (Array.isArray(price) ? price : [price]) : [],
      duration: duration ? (Array.isArray(duration) ? duration : [duration]) : [],
      sortBy: sortBy || 'latest',
      page: Number(page),
      limit: Number(limit)
    };

    const activecategories = await category.find({ status: "active" }).select('_id');
    const activeCategoryids = activecategories.map((c) => {
      return c._id.toString()
    })


    // get the filter
    let query = { isDeleted: false, status: "published" };
    if (search) query.name = { $regex: search, $options: 'i' };

    //category if query 
    if (selectedFilters.categories.length) { query.category = { $in: selectedFilters.categories.filter(c => activeCategoryids.includes(c)) } }
    else {
      query.category = { $in: activeCategoryids }
    };

    if (selectedFilters.rating.length) query.rating = { $gte: Math.min(...selectedFilters.rating) };
    if (selectedFilters.level.length) query.level = { $in: selectedFilters.level };
    if (selectedFilters.price.length) {
      let priceConditions = [];
      if (selectedFilters.price.includes("free")) {
        priceConditions.push({ price: 0 })
      }
      if (selectedFilters.price.includes("paid")) {
        priceConditions.push({ price: { $gt: 0 } })
      }
      if (priceConditions.length > 0) {
        query.$or = priceConditions
      }
    }

    if (selectedFilters.duration.length) query.duration = { $in: selectedFilters.duration };

    // Sorting
    let sortOption = {};
    switch (sortBy) {
      case "latest": sortOption = { createdAt: -1 }; break;
      case "rating": sortOption = { rating: -1 }; break;
      case "priceLow": sortOption = { price: 1 }; break;
      case "priceHigh": sortOption = { price: -1 }; break;

    }



    // Pagination logic
    const skip = (selectedFilters.page - 1) * selectedFilters.limit;

    const totalCourses = await course.countDocuments(query);
    const totalPages = Math.ceil(totalCourses / selectedFilters.limit);

    let courses = await course.find(query)
      .populate('category')
      .sort(sortOption)
      .skip(skip)
      .limit(selectedFilters.limit);

    //adding addedtocartlogic flag for every course (checking wether ithe course isadded to the cart)
    //ADD WISHLIST IN FUTURE// ALSO BOUGHT LIST IF NEEDED
    if (user) {

      let cartCourseIds = [];
      const cart = await Cart.findOne({ cartUser: user._id }).populate({
        path: 'items',
        populate: { path: 'course', model: 'Course' },
        select: 'name author thumbnail price details slug'
      })
      if (cart) {
        cartCourseIds = cart.items.map((i) => {
          return i.course._id.toString()
        })

      }
      const wishlistItems = await Wishlist.find({ userId: user._id }).select('courseId');
      const wishlistCourseIds = wishlistItems.map(w => w.courseId.toString());

      courses = courses.map((c) => {
        return {
          ...c.toObject(), inCart: cartCourseIds.includes(c._id.toString()),
          inWish: wishlistCourseIds.includes(c._id.toString())
        }
      })
    } else {
      courses = courses.map((c) => {
        return {
          ...c.toObject(), inCart: false, inWish: false

        }
      })
    }

    const categoriesList = await category.find({ status: "active" });

    res.render('courses', {
      courses,
      categories: categoriesList,
      selectedFilters,
      totalPages,
      totalCourses,
    });
  } catch (error) {
    console.log(error)
    res.redirect('/home')
  }
};

exports.getcoursedetails = async (req, res) => {
  try {
    const user = res.locals.user
    let courses = await course.findOne({ slug: req.params.slug })

    if (!courses) {
      req.flash('error', 'Course not found');
      return res.redirect('/courses');
    }
    let freeCourse = false
    if (courses.price === 0) {
      freeCourse = true;
    }

    //adding incartgfalg can be used for future wishlist
    //here its single course so just tries to find if the course belongs tio the cart coiurse ids
    let inCart = false;
    let enrolled = false;
    let eid = 0;
    if (user) {
      let cartCourseIds = [];

      const enrollments = await Enrollments.findOne({ studentId: user._id, courseId: courses._id })
      const cart = await Cart.findOne({ cartUser: user._id }).populate({
        path: 'items',
        populate: { path: 'course', model: 'Course' },
        select: 'name author thumbnail price details slug'
      })
      if (cart) {
        cartCourseIds = cart.items.map((i) => {
          return i.course._id.toString()
        })
        inCart = cartCourseIds.includes(courses._id.toString())
      }
      if (enrollments) {
        enrolled = true
        eid = enrollments._id
      }

    }
    const courseDet = {
      ...courses.toObject(), inCart, enrolled, eid, freeCourse
    }
    console.log('Course inCart flag:', inCart);
    //review
    const { rating } = req.query
    let review = []
    console.log(rating)
    if (rating) {
      review = await Review.find({ course: courses._id, rating: rating }).sort({ createdAt: -1 }).populate({
        path: "user"
      })
    } else {
      review = await Review.find({ course: courses._id }).sort({ createdAt: -1 }).populate({
        path: "user"
      })
    }
    const stats = await Review.aggregate([{ $match: { course: courses._id } }, {
      $group: {
        _id: "$course",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        star5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        star4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        star3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        star2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        star1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },

      }


    }])

    const reviewStats = stats[0] || {
      avgRating: 0,
      totalReviews: 0,
      star5: 0,
      star4: 0,
      star3: 0,
      star2: 0,
      star1: 0
    };

    res.render('singlecourse', { course: courseDet, review, reviewStats, rating })

  } catch (error) {
    console.log(error)
    res.redirect('/courses')
  }

}

exports.tryFreeCourse = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      req.flash('warning', 'Please sign up or log in first');
      return res.redirect('/signup');
    }

    const user = await User.findById(userId);
    if (!user) {
      req.flash('warning', 'User not found');
      return res.redirect('/signup');
    }
    const { courseId } = req.body
    const courses = await course.findById(courseId)
    const enrollment = await Enrollments.create({ studentId: userId, courseId: courses._id })
    req.flash('success', "congragulations you have enrolled for free")
    res.redirect(`profile/${user.fullName}/mylearning/${courses.name}/${enrollment._id}`)
  } catch (error) {
    console.log(error)
  }
}




exports.getBoughtCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const eid = req.params.eid
    const user = await User.findById(userId)
    const enrolled = await Enrollments.findOne({ studentId: user._id, _id: eid })
    if (!enrolled) {
      return res.status(404).send("404 - Page Not Found")
    }
    const courses = await course.findById(enrolled.courseId)
    const chapters = await Chapters.find({ courseId: courses._id, status: "published" }).sort({ order: 1 });

    const chapterWithProgress = chapters.map(ch => {
      const progress = enrolled.chaptersProgress.find(
        cp => cp.chapterId.toString() === ch._id.toString()
      );
      return {
        ...ch.toObject(),
        progressPercent: progress ? progress.progressPercent : 0,
        completed:progress?progress.completed:false,
        totalDuration:progress?(progress.totalDuration/60).toFixed(2):0
      }
    })

    res.render('boughtCourse', { course: courses, enrolled, chapters: chapterWithProgress, user })
  } catch (error) {
    console.log(error)
  }
}

exports.postAddReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, rating, comment, title } = req.body
    console.log("course=", courseId
      , "rating=", rating
      , "comment=", comment,
      "title=", title,
      'userId=', req.user.fullName
    )

    const courses = await course.findById(courseId)

    const enrollment = await Enrollments.findOne({ studentId: userId, courseId: courseId })

    const review = await Review.create({
      course: courseId, rating: rating, comment: comment, title: title, user: userId
    })

    const stats = await Review.aggregate([{ $match: { course: courses._id } }, {
      $group: {
        _id: "$course",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        star5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        star4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        star3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        star2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        star1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
      }
    }])
    await course.findByIdAndUpdate(courseId, {
      rating: Number(stats[0].avgRating.toFixed(2)),
      reviewCount: stats[0].totalReviews
    });



    req.flash('success', "Thank you for your feedback")
    res.redirect(`/profile/${req.user.fullName}/mylearning/${courses.name}/${enrollment._id}`)
  } catch (error) {
    console.log(error)
  }
}


exports.getViewChapter = async (req, res) => {
  try {
    const userId = req.user._id;
    const eid = req.params.eid
    const chapterId = req.params.chapterId
    const user = await User.findById(userId)
    const enrolled = await Enrollments.findOne({ studentId: user._id, _id: eid })
    if (!enrolled) {
      return res.status(404).send("404 - Page Not Found")
    }
    const chapter = await Chapters.findById(chapterId)
    if (!chapter) {
      return res.status(404).send("Chapter not found");
    }
    if (chapter.courseId.toString() !== enrolled.courseId.toString()) {
      return res.status(403).send("Unauthorized access");
    }
    let chapterProgress = enrolled.chaptersProgress.find(
      cp => cp.chapterId.toString() === chapterId
    );

    if (!chapterProgress) {
      chapterProgress = {
        chapterId: chapter._id,
        watchedDuration: 0,
        totalDuration: 0,
        progressPercent: 0,
        completed: false
      };

      enrolled.chaptersProgress.push(chapterProgress);
      await enrolled.save();
    }

    const nextChapter = await Chapters.findOne({
      courseId: chapter.courseId,
      order: chapter.order + 1
    });
    const courses = await course.findById(chapter.courseId)
    const resumeTime = chapterProgress.watchedDuration || 0;
    const totalChapters = await Chapters.countDocuments({ courseId: chapter.courseId, status: "published" })
    const signedVideoUrl = await getSignedVideoUrl(
      chapter.lectureVideoKey,
      900
    );


    res.render('view-Chapter', {
      chapter, course: courses, enrolled, resumeTime, nextChapter, totalChapters, signedVideoUrl
    })
  } catch (error) {
    console.log(error)
  }
}

exports.updateChapterProgress = async (req, res) => {

  try {
    const userId = req.user._id;

    const {
      enrollmentId,
      chapterId,
      watchedDuration,
      totalDuration,
      completed
    } = req.body;

    const enrollment = await Enrollments.findOne({
      _id: enrollmentId,
      studentId: userId
    });

    if (!enrollment) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let chapterProgress = enrollment.chaptersProgress.find(
      cp => cp.chapterId.toString() === chapterId
    );
    if (!chapterProgress) {
      chapterProgress = {
        chapterId,
        watchedDuration: 0,
        totalDuration: 0,
        progressPercent: 0,
        completed: false
      };
      enrollment.chaptersProgress.push(chapterProgress);
    }
    //know current duration or already saved duration is more and save that
    chapterProgress.watchedDuration = Math.max(
      chapterProgress.watchedDuration,
      watchedDuration
    );
    console.log(completed)
    //total
    console.log(totalDuration)
    chapterProgress.totalDuration = totalDuration;

    //progresspercentage
    chapterProgress.progressPercent = Math.round(
      (chapterProgress.watchedDuration / totalDuration) * 100
    );

    const completionRatio =
      chapterProgress.watchedDuration / chapterProgress.totalDuration;

    if (completionRatio >= 0.95) {
      chapterProgress.completed = true;
      chapterProgress.progressPercent = 100;
    } else {
      chapterProgress.completed = false;
    }


    const completedCount = enrollment.chaptersProgress.filter(
      cp => cp.completed
    ).length;

    const totalChapters = await Chapters.countDocuments({ courseId: enrollment.courseId, status: "published" })

    enrollment.overallProgress = Math.round(
      (completedCount / totalChapters) * 100
    );
    enrollment.progress = enrollment.overallProgress
    if (enrollment.overallProgress === 100) {
      enrollment.status = "completed";
    }

    enrollment.lastAccessed = new Date();

    await enrollment.save();

    res.json({ success: true });

  } catch (error) {
    console.log(error)
  }
}

exports.continueLearning = async (req, res) => {

  try {
      console.log("Route hit--- :)")
    const userId = req.user._id;
    console.log(userId)
    const eid = req.params.eid
    const user = await User.findById(userId)
    const enrolled = await Enrollments.findOne({ studentId: user._id, _id: eid })
    if (!enrolled) {
      return res.status(404).send("404 - Page Not Found")
    }
    const courses = await course.findById(enrolled.courseId)
    const chapters = await Chapters.find({ courseId: courses._id, status: "published" }).sort({ order: 1 });
    let targetChapter = null;

    console.log("📘 chapters count:", chapters.length);
    console.log("📊 progress entries:", enrolled.chaptersProgress.length);

    for (const ch of chapters) {
      console.log(
        "Checking chapter:",
        ch._id.toString(),
        "matched progress:",
        !!enrolled.chaptersProgress.find(
          cp => cp.chapterId.toString() === ch._id.toString()
        )
      );

      const progress = enrolled.chaptersProgress.find(
        cp => cp.chapterId.toString() === ch._id.toString()
      )

      if (!progress || !progress.completed) {
        targetChapter = ch;
        break;
      }
    }
    if (!targetChapter) {
      targetChapter = chapters[chapters.length - 1]
    }
    console.log(enrolled._id)
    return res.redirect(`/profile/${user.fullName}/myLearning/${courses.slug}/${enrolled._id}/${targetChapter._id}`)

  } catch (error) {
    console.log(error)
  }
}