const User = require("../models/userSchema")
const { Parser } = require("json2csv");

exports.getmanagestudents = async (req, res) => {
    let page = parseInt(req.query.page)
    let limit = 5
    let skip = (page - 1) * 5

    const sortStatus = req.query.Status;
    const timeFilter = req.query.time; // e.g., 'lastMonth', 'lastYear'
    const exportType = req.query.export; // csv export
    const search = req.query.search ? req.query.search.trim() : "";
    let filter = { isDeleted: false };
    //sort based on student status(suspended /active)
    // Filter based on student status
    if (sortStatus && sortStatus !== "all") {
        if (sortStatus === "active") filter.isBlocked = false;
        else if (sortStatus === "suspended") filter.isBlocked = true;
    }
    //search
    if (search) {
        filter.$or = [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } }
        ];
    }

    //time based sorting
    if (timeFilter) {
        const now = new Date();
        let startDate;

        if (timeFilter === "lastMonth") {
            startDate = new Date((now.getDate() - 30));
            const endDate = now
            filter.createdAt = { $gte: startDate, $lt: endDate };
        } else if (timeFilter === "lastYear") {
            startDate = new Date(now.getFullYear() - 1, 0, 1);
            const endDate = new Date(now.getFullYear(), 0, 1);
            filter.createdAt = { $gte: startDate, $lt: endDate };
        }
    }

    const totalStudents = await User.countDocuments(filter)


    const Student = await User.find(filter).skip(skip).limit(limit)
    //export filtered admins
    if (exportType === "csv") {
        const allStudentsForExport = await User.find(filter).sort({ createdAt: -1 });
        // Map Status dynamically
        const studentsForCSV = allStudentsForExport.map(student => ({
            fullName: Student.fullName,
            email: Student.email,
            Status: Student.isBlocked ? "Suspended" : "Active",
            location: Student.location,
            createdAt: Student.createdAt
        }));
        const fields = ["fullName", "email", "Status", "location", "createdAt"];
        const parser = new Parser({ fields });
        const csv = parser.parse(studentsForCSV);

        res.header("Content-Type", "text/csv");
        res.attachment("Students.csv");
        return res.send(csv);
    }
    console.log("Students fetched:", Student.length);
    res.render("managestudents", {
        Student, currentPage: page,
        totalPages: Math.ceil(totalStudents / limit), sortStatus: sortStatus || "all", timeFilter: timeFilter, search
    });



}

exports.deletestudent = async (req, res) => {
    try {
        const studentId = req.params.id
        await User.findByIdAndUpdate(studentId, { isDeleted: true })
        

        req.flash("success", "Student deleted successfully");
        res.redirect("/admin/manage-students");

    } catch (error) {
         console.log(error)
             req.flash("error", "some error occured");
 res.redirect("/admin/manage-students");
     } 

}

exports.geteditstudent = async (req, res) => {
    const studentId = req.params.id
    const student = await User.findById(studentId);
    res.render('viewandeditstudent', { student })
}

exports.editstudent = async (req, res) => {
    try {
        const studentid = req.params.id;
        const student = await User.findById(studentid);
        const { fullName, email, Contact, Status } = req.body;
        // Update fields without password
        student.fullName = fullName || student.fullName;
        student.email = email || student.email;
        student.isBlocked = req.body.isBlocked === "true";
        student.Contact = Contact || student.Contact
        await student.validate()
        await student.save()
        req.flash("success", "Student Details updated successfully");
        res.redirect("/admin/manage-students");
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/admin/manage-students");
    }

}

