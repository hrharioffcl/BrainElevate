
 const Admin = require("../models/adminschema")
 const { Parser } = require("json2csv");

//get admin 
exports.getmanageadmin =async(req,res)=>{
let page = parseInt(req.query.page)
let limit = 5
let skip = (page-1)*5

const sortRole = req.query.role;
  const timeFilter = req.query.time; // e.g., 'lastMonth', 'lastYear'
      const exportType = req.query.export; // csv export
      const search = req.query.search ? req.query.search.trim() : "";

let filter = {isActive:true};

if (sortRole && sortRole !== "all") {
  filter.role = sortRole;
}

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
            startDate = new Date((now.getDate() - 30), 1);
            const endDate = now
            filter.createdAt = { $gte: startDate, $lt: endDate };
        } else if (timeFilter === "lastYear") {
            startDate = new Date(now.getFullYear() - 1, 0, 1);
            const endDate = new Date(now.getFullYear(), 0, 1);
            filter.createdAt = { $gte: startDate, $lt: endDate };
        }
    }




const admins = await Admin.find(filter).skip(skip).limit(limit)



const totalAdmins = await Admin.countDocuments(filter)
//export filtered admins
 if (exportType === "csv") {
      const allAdminsForExport = await Admin.find(filter).sort({ createdAt: -1 });
      const fields = ["fullName", "email", "role", "location", "createdAt"];
      const parser = new Parser({ fields });
      const csv = parser.parse(allAdminsForExport);

      res.header("Content-Type", "text/csv");
      res.attachment("admins.csv");
      return res.send(csv);
    }




res.render("manageadmin", { admins , currentPage: page,
    totalPages: Math.ceil(totalAdmins / limit),sortRole:sortRole||"all",timeFilter: timeFilter,search});

  
}
//addadmin modal
exports.addadmin =async(req,res)=>{
  try {
     const{fullName,email,password,confirmPassword,role}=req.body

   //confirm existing admin
      const existingadmin = await Admin.findOne({ email });
      if (existingadmin){
  req.flash("error", "admin already exist");
  return res.redirect("/admin/manage-admin");
}
  
    //confirm password check
    if (password !== confirmPassword) {
  req.flash("error", "Passwords do not match");
  return res.redirect("/admin/manage-admin");
}
    //place user without saving anad validate
        const tempuser = new Admin({ fullName, email, password })
        await tempuser.validate()

await Admin.create({fullName,email,password,role})

 return res.send("something")
  } catch (error) {
     console.log(error)
     req.flash('error',error.message)
     return res.redirect("/admin/manage-admin");

  }
 

}

exports.deleteadmin =async(req,res)=>{
  try {
     const adminId = req.params.id
  await Admin.findByIdAndUpdate(adminId,{isActive:false})
  
    req.flash("success", "Admin deleted successfully");
    res.redirect("/admin/manage-admin");

  } catch (error) {
    console.log(error)
  }
 
}