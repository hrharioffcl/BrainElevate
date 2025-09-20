
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


const totalAdmins = await Admin.countDocuments(filter)


const admins = await Admin.find(filter).skip(skip).limit(limit)



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


exports.getaddadmin =async(req,res)=>{
    res.render('addadmin')
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
  return res.redirect("/admin/manage-admin/addadmin");
}
    //place user without saving anad validate
        const tempuser = new Admin({ fullName, email, password })
        await tempuser.validate()

await Admin.create({fullName,email,password,role})
     req.flash("success", "Admin updated successfully");
res.redirect("/admin/manage-admin/addadmin")
  } catch (error) {
     console.log(error)
     req.flash('error',error.message)
     return res.redirect("/admin/manage-admin/addadmin");

  }
 

}
//
exports.geteditadmin =async(req,res)=>{
    const {admin_id}= req.params;
    const existingadmin = await Admin.findById(admin_id)
    res.render('editadmin',{admin:existingadmin})
}
//
exports.editadmin = async(req,res)=>{
   try {
    const adminId = req.params.admin_id
  const {fullName,email,password,confirmPassword,role}= req.body
  //checkexisting
   const admin = await Admin.findById(adminId);
    if (!admin) {
      req.flash("error", "Admin not found");
      return res.redirect(`/admin/manage-admin/editadmin/${adminId }`);
    }

// Check if nothing changed
    const isPasswordEmpty = !password && !confirmPassword;
    if (
      admin.fullName === fullName &&
      admin.email === email &&
      admin.role === role &&
      isPasswordEmpty
    ) {
      req.flash("error", "No changes were made.");
      return res.redirect(`/admin/manage-admin/editadmin/${adminId }`);
    }


     // Update fields without password
    admin.fullName = fullName || admin.fullName;
    admin.email = email || admin.email;
    admin.role = role || admin.role;
    
//only update password if password entered
     if (password || confirmPassword) {
      if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match");
        return res.redirect(`/admin/manage-admin/editadmin/${adminId }`);
      }
      admin.password = password; // schema will validate + hash
    }

    await admin.validate()
    await admin.save()
     req.flash("success", "Admin updated successfully");
    res.redirect(`/admin/manage-admin`);
  } catch (error) {
   
        if (error.name === "ValidationError") {
  req.flash("error", error.message);
  return res.redirect(`/admin/manage-admin/editadmin/${req.params.admin_id}`);
}

     
  console.log(error)
  req.flash("error", error.message);
  res.redirect(`/admin/manage-admin/editadmin/${req.params.admin_id}`);
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