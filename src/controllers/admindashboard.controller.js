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