const course = require("../models/coursesSchema")
const category = require("../models/categorySchema")
const chapter = require("../models/chapterScheema")
const { encodeXText } = require("nodemailer/lib/shared")
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
    try {
console.log("FORM SUBMITTED")
        const id = req.params.id
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
        
           return res.redirect(`/admin/coursesmangement/update/${existing.id}`)


    } catch (error) {
        console.log(error)
        if (error.name === "ValidationError") {
            req.flash("error", error.message);
        }
     return res.redirect(`/admin/coursesmangement/update/${id}`)

    }


}

