const course = require("../models/coursesSchema")
const category = require("../models/categorySchema")
const chapter = require("../models/chapterScheema")



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