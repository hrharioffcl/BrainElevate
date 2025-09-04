
 const Admin = require("../models/adminschema")

exports.getmanageadmin =async(req,res)=>{
const admins = await Admin.find()
res.render("manageadmin", { admins } );
  
}

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