const course = require("../models/coursesSchema")
const category = require("../models/categorySchema")
const chapter = require("../models/chapterScheema")
const coupons = require("../models/couponSchema")

exports.getcoursemanagement = async (req, res) => {
  try {
    // Pagination setup
    let page = parseInt(req.query.page) || 1;
    let limit = 6; // courses per page
    let skip = (page - 1) * limit;

    // Filters
    const { search, status, level } = req.query;
    let filter = {};

    // 🔍 Search by course name
    if (search && search.trim() !== "") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    // 🎯 Filter by status (draft, published, pending approval, etc.)
    if (status && status !== "all") {
      filter.status = status;
    }

    // 🎯 Filter by level (Beginner, Intermediate, Advanced)
    if (level && level !== "all") {
      filter.level = level;
    }

    // Count total courses for pagination
    const totalCourses = await course.countDocuments(filter);

    // Fetch paginated + filtered courses
    const existingcourse = await course
      .find(filter)
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit);

    res.render("coursemanagemant", {
      course: existingcourse,
      currentPage: page,
      totalPages: Math.ceil(totalCourses / limit),
      search: search || "",
      statusFilter: status || "all",
      levelFilter: level || "all",
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to load courses");
    res.redirect("/admin");
  }
};


exports.getaddnewcourse = async (req, res) => {
    const categories = await category.find({status:{$ne:"archived"}})
    res.render('course-form', { course: null, existingchapater: null,categories })
}

exports.getupdatecourse = async (req, res) => {
    const id = req.params.course_id
    const existingcourse = await course.findById(id)
    const existingchapater = await chapter.find({ courseId: id })
        const categories = await category.find({status:{$ne:"archived"}})

    res.render('course-form', { course: existingcourse, existingchapater,categories })
}
exports.getaddnewchapter = async (req, res) => {
    const existingcourse = await course.findById(req.params.course_id);

    if (!existingcourse) {
        req.flash("error", "Course not found");
        return res.redirect("/admin/courses");
    }

    res.render('addnewchapter', { course: existingcourse, existingchapater: null });
}

exports.adddetails = async (req, res) => {
    console.log(req.body)
    try {
        const { name, details, author, status, description, level, learnPoints } = req.body

        // Trim spaces
        const cleanName = name.trim();

        // Escape regex special characters
        const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const existing = await course.findOne({
            name: { $regex: new RegExp(`^${escapeRegex(cleanName)}$`, "i") }
        });

        if (existing) {
            req.flash("error", "This Course already exists");
            return res.redirect("/admin/addnewcourse");
        }
        let points = [];
        if (Array.isArray(learnPoints)) {
            points = learnPoints.filter(p => p && p.trim() !== "");
        } else if (typeof learnPoints === "string" && learnPoints.trim() !== "") {
            points = [learnPoints.trim()];
        }
        const newcourse = await course.create({
            name, details, author, status, description, level,
            learnPoints: points
        });
        if (newcourse.status === "saved") {
            req.flash("success", "Course saved succesfully");
        }
        if (newcourse.status === "published") {
            req.flash("success", "Course Published succesfully");
        }
        if (newcourse.status === "draft") {
            req.flash("success", "Course added to draft succesfully");
        }
        return res.redirect(`/admin/coursesmangement/update/${newcourse.id}`)
    } catch (error) {
        console.log(error)
        if (error.name === "ValidationError") {
            req.flash("error", error.message);
        }
        return res.redirect("/admin/addnewcourse");
    }
}




exports.updatedetails = async (req, res) => {
    console.log("req.body:", req.body);
    console.log("typeof req.body.status:", typeof req.body.status);

    try {
        console.log("FORM SUBMITTED")
        const id = req.params.course_id
        console.log(id)

        const { name, details, author, status, description, level, learnPoints } = req.body

        const existing = await course.findById(id)

        if (!existing) {
            req.flash("error", "course not found");
            return res.redirect("/admin/addnewcourse");
        }

        let points = [];
        if (Array.isArray(learnPoints)) {
            points = learnPoints.filter(p => p && p.trim() !== "");
        } else if (typeof learnPoints === "string" && learnPoints.trim() !== "") {
            points = [learnPoints.trim()];
        }

        //update existing fields
        existing.name = name;
        existing.details = details;
        existing.author = author;
        existing.status = status;
        existing.description = description;
        existing.level = level;
        existing.learnPoints = points;
        await existing.save();
        console.log(existing)
        if (existing.status === "saved") {
            req.flash("success", "Course saved succesfully");
        }
        if (existing.status === "published") {
            req.flash("success", "Course Published succesfully");
        }
        if (existing.status === "draft") {
            req.flash("success", "Course added to draft succesfully");
        }

        return res.redirect(`/admin/coursesmangement/update/${existing._id}`)


    } catch (error) {
        console.log(error)
        if (error.name === "ValidationError") {
            req.flash("error", error.message);
        }
        return res.redirect(`/admin/coursesmangement/update/${req.params.course_id}`)

    }


}


exports.addchapter = async (req, res) => {
    try {
        const courseId = req.params.course_id
        const { title, lectureVideo, lectureDescription, lectureNotes, lecturePdf, status, order } = req.body
        const newChapter = await chapter.create({ title, lectureDescription, lectureNotes, order, status, courseId })
        console.log(newChapter)
        req.flash("success", "Chapter added successfully!");

        return res.redirect(`/admin/courses/${courseId}/addchapter`);


    } catch (error) {
        console.log(error)

        if (error.name === "ValidationError") {
            req.flash("error", error.message);

        } else {
            console.log(error)
            req.flash("error", "Something went wrong while adding the chapter");
        }

        return res.redirect(`/admin/courses/${req.params.course_id}/addchapter`);
    }
}


exports.geteditchapter = async (req, res) => {
    try {
        const { course_id, chapter_id } = req.params
        const existingcourse = await course.findById(course_id)
        if (!existingcourse) {
            req.flash("error", "Course not found")
            return res.redirect("/admin/courses")
        }

        const existingchapter = await chapter.findById(chapter_id)
        if (!existingchapter) {
            req.flash("error", "chapter not found")
            return res.redirect(`/admin/coursesmangement/update/${course_id}`)
        }
        res.render('editchapter', { course: existingcourse, chapter: existingchapter })
    } catch (error) {
        req.flash("error", "some error occured")
        res.redirect("/admin/courses")
    }


}

exports.editchapter = async (req, res) => {
    try {
        const { course_id, chapter_id } = req.params
        const { title, lectureVideo, lectureDescription, lectureNotes, lecturePdf, status, order } = req.body
        const existingchapter = await chapter.findById(chapter_id)
        //updaate existing chapter details
        existingchapter.title = title;
        existingchapter.lectureDescription = lectureDescription;
        existingchapter.lectureNotes = lectureNotes;
        existingchapter.status = status;
        existingchapter.order = order;
        await existingchapter.save();

        req.flash("success", "Chapter updated successfully");
        res.redirect(`/admin/coursesmangement/update/${course_id}`);

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            req.flash("error", "Order number already exists in this course");
        } else {
            req.flash("error", "Something went wrong while updating the chapter");
        }

        res.redirect(`/admin/courses/${req.params.course_id}/chapters/${req.params.chapter_id}/edit`);
    }

}




exports.deletecourse = async (req, res) => {

    try {
        const { course_id } = req.params;
        await chapter.deleteMany({ courseId: course_id })
        const deletedcourse = await course.findByIdAndDelete(course_id)
        if (!deletedcourse) {
            req.flash("error", "Course not found");
            return res.redirect("/admin/courses");
        }
        req.flash("success", "Course and related chapters deleted successfully");
        res.redirect("/admin/courses");

    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong while deleting the course");
        res.redirect("/admin/courses");
    }
}
//coupon
//get coupon page
exports.getcoupons = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 5;
        let skip = (page - 1) * limit;

        const search = req.query.search ? req.query.search.trim() : "";
        const statusFilter = req.query.Status;
        const scopeFilter = req.query.scope;

        let filter = { isDeleted: false };


        if (search) {
            filter.$or = [
                { couponName: { $regex: search, $options: "i" } },
                { couponCode: { $regex: search, $options: "i" } }
            ];
        }


        if (statusFilter && statusFilter !== "all") {
            filter.status = statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);

        }

        // ====== Scope Filter ======
        if (scopeFilter && scopeFilter !== "all") {
            filter.scope = scopeFilter.toLowerCase();

        }

        const totalCoupons = await coupons.countDocuments(filter);


        const existingCoupons = await coupons
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit).populate('courseId', 'name').lean();
        existingCoupons.forEach(coupon => {
            if (coupon.scope === "coursespecific") {
                coupon.courseNames = coupon.courseId.map((c) => {
                    return c.name
                })
            } else {
                coupon.courseNames = []
            }
        })


        const now = new Date();

        for (let coupon of existingCoupons) {
            const end = new Date(coupon.endDateTime);

            // Check if coupon has expired
            if (end <= now && coupon.status !== "Expired") {

                await coupons.updateOne({ _id: coupon._id }, { status: "Expired" });
                coupon.status = "Expired";
                coupon.timeToExpire = "Expired";
            } else if (end > now) {
                const diffMs = end - now;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                coupon.timeToExpire = `${diffDays} days ${diffHours} hrs`;
            } else {
                coupon.timeToExpire = "Expired";
            }
        }

        res.render("coupons", {
            coupons: existingCoupons,
            currentPage: page,
            totalPages: Math.ceil(totalCoupons / limit),
            sortStatus: statusFilter || "all",
            scopeFilter: scopeFilter || "all",
            search
        });

    } catch (error) {
        console.error(error);
        res.send(error);
    }
};






//addcouponpage
exports.getaddcoupon = async (req, res) => {
    courses = await course.find()
    res.render('createcoupons', courses)
}




//post add coupon

exports.addcoupon = async (req, res) => {

    try {
        const { status, couponName, description, couponCode, couponQuantity,
            usesPerCustomer, discountType, discountValue, amountdiscountValue, amountminPurchase, percentageminPurchase,
            maxDiscountAmount, startDateTime, endDateTime, scope, courseId } = req.body
        const existingcoupon = await coupons.findOne({ couponCode })
        if (existingcoupon) {
            req.flash("error", "Coupon code  already exist")
            return res.redirect('/admin/courses/coupons')
        }
        let finalMinPurchaseAmount = Number(amountminPurchase || percentageminPurchase || 0);

        let courseArray = [];
        if (scope === "coursespecific") {
            if (Array.isArray(courseId)) {
                courseArray = courseId
            } else if (courseId) {
                courseArray = [courseId]
            }
        }
        let finalDiscountValue = 0;
        if (discountType === "Amount") {
            finalDiscountValue = amountdiscountValue
        }

        else if (discountType === "Percentage") {
            if (discountValue < 1 || discountValue > 100) {
                req.flash("error", "Percentage discount must be between 1 and 100");
                return res.redirect('/admin/courses/coupons');
            }
            finalDiscountValue = parseInt(discountValue, 10);

        }
        // Create coupon
        const newCoupon = new coupons({
            status,
            couponName,
            description,
            couponCode,
            couponQuantity,
            usesPerCustomer,
            discountType,
            discountValue: finalDiscountValue,
            minPurchaseAmount: finalMinPurchaseAmount,
            maxDiscountAmount,
            startDateTime,
            endDateTime,
            scope,
            courseId: courseArray
        });

        await newCoupon.save();

        req.flash("success", "Coupon created successfully");
        res.redirect('/admin/courses/coupons');


    } catch (error) {
        console.log(error)
        req.flash("error", "some error occured")
        res.redirect('/admin/courses/coupons')
    }
}



//get edit coupon
exports.geteditcoupon = async (req, res) => {
    const couponId = req.params.coupon_id
    const coupon = await coupons.findById(couponId)
    if (!coupon) {
        req.flash("error", "cannot find coupon")
        res.redirect('/admin/courses/coupons')
    }
    const courses = await course.find()
    res.render('editcoupon', { coupon, courses })
}



//post edit coupon
exports.editcoupon = async (req, res) => {
    try {
        const { status, couponName, description, couponCode, couponQuantity,
            usesPerCustomer, discountType, discountValue, amountdiscountValue, amountminPurchase, percentageminPurchase,
            maxDiscountAmount, startDateTime, endDateTime, scope, courseId } = req.body
        const couponId = req.params.coupon_id

        const existingcoupon = await coupons.findById(couponId)
        if (!existingcoupon) {
            req.flash("error", "cannot find coupon")
            res.redirect('/admin/courses/coupons')
        }
        let finalMinPurchaseAmount = Number(amountminPurchase || percentageminPurchase || 0);

        let courseArray = [];
        if (scope === "coursespecific") {
            if (Array.isArray(courseId)) {
                courseArray = courseId
            } else if (courseId) {
                courseArray = [courseId]
            }
        }


        let finalDiscountValue = 0;
        if (discountType === "Amount") {
            finalDiscountValue = amountdiscountValue
        }

        else if (discountType === "Percentage") {
            if (discountValue < 1 || discountValue > 100) {
                req.flash("error", "Percentage discount must be between 1 and 100");
                return res.redirect('/admin/courses/coupons');
            }
            finalDiscountValue = parseInt(discountValue, 10);
        }
        await coupons.findByIdAndUpdate(couponId, {
            status,
            couponName,
            description,
            couponCode,
            couponQuantity,
            usesPerCustomer,
            discountType,
            discountValue: finalDiscountValue,
            minPurchaseAmount: finalMinPurchaseAmount,
            maxDiscountAmount,
            startDateTime,
            endDateTime,
            scope,
            courseId: courseArray
        }, { new: true })

        req.flash("success", "Coupon updated successfully");
        res.redirect("/admin/courses/coupons");

    } catch (error) {
        console.log(error);
        req.flash("error", "Some error occurred while updating the coupon");
        res.redirect("/admin/courses/coupons");
    }
}
exports.deletecoupon = async (req, res) => {
    try {
        const couponId = req.params.coupon_id
        await coupons.findByIdAndUpdate(couponId, { isDeleted: true })

        req.flash("success", "Coupon deleted successfully");
        res.redirect("/admin/courses/coupons");

    } catch (error) {
        console.log(error)
        req.flash("error", "some error occured");
        res.redirect("/admin/courses/coupons");
    }

}


exports.getcategory = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = 8;
    let skip = (page - 1) * limit;
    const { search, status, sortBy } = req.query
    let filter = {status:{$ne:"archived"}}

    // Search
    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }

    // Status filter
    if (status && status !== "all") {
        filter.status = status;
    }
    // Sorting
    let sortOption = {};
    if (sortBy === "courses_desc") {
        sortOption = { courses: -1 };
    }
    else if (sortBy === "courses_asc") {
        sortOption = { courses: 1 };
    }


    else if (sortBy === "authors_desc") {
        sortOption = { authors: -1 };
    }
    else if (sortBy === "authors_asc") {
        sortOption = { authors: 1 };
    }


    else if (sortBy === "students_desc") {
        sortOption = { students: -1 };
    }

    else if (sortBy === "students_asc") {
        sortOption = { students: 1 };
    }


    else {
        sortOption = { createdAt: -1 }; // default newest
    }
    const totalCategories = await category.countDocuments(filter)


    const categories = await category.find(filter).sort(sortOption).skip(skip).limit(limit)
    res.render('categories', { categories: categories, currentPage: page, totalPages: Math.ceil(totalCategories / limit), statusFilter: status, search, sortBy: sortOption })

}


exports.getaddcategory = async (req, res) => {
    res.render('addcategory')
}

exports.addcategory = async (req, res) => {
    try {
        const { name, status } = req.body;
        await category.create({ name, status })
        req.flash("success", "Category added successfully");
        res.redirect('/admin/courses/categories')
    } catch (error) {
        req.flash("error", "some error occured");

        res.redirect('/admin/courses/categories')
    }

}
exports.geteditcategory = async (req, res) => {
    const categoryId = req.params.categories_id;
    if (!categoryId) {
        req.flash("error", "Category not found");
        return res.redirect('/admin/courses/categories');
    }
    const categories = await category.findById(categoryId);
    res.render('editcategory', { categories: categories })
}


exports.editcategory = async (req, res) => {

    try {
        const categoryId = req.params.categories_id;
        const { name, status } = req.body;
        await category.findByIdAndUpdate(categoryId, { name: name, status: status })
        req.flash("success", "Category updated successfully");
        res.redirect('/admin/courses/categories');
    } catch (error) {
        req.flash("error", "some error occured");
        res.redirect('/admin/courses/categories')
    }
}

exports.deletecategory = async (req, res) => {
    try {
        const categoryId = req.params.categories_id;
        await category.findByIdAndUpdate(categoryId, { status: "archived" })
        req.flash("success", "Category removed successfully");
        res.redirect('/admin/courses/categories');

    } catch (error) {
        req.flash("error", "some error occured");
        res.redirect('/admin/courses/categories')
    }
}