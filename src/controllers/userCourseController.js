
const course= require("../models/coursesSchema")
const category = require("../models/categorySchema")


exports.getcourse = async(req,res)=>{
   const {  search, categories, rating, level, price, duration, sortBy = 'latest', page = 1, limit = 12 } = req.query;

  const selectedFilters = {
    search: search || '',
    categories: categories ? (Array.isArray(categories) ? categories : [categories]) : [],
    rating: rating ? (Array.isArray(rating) ? rating : [rating]) : [],
    level: level ? (Array.isArray(level) ? level : [level]) : [],
    price: price ? (Array.isArray(price) ? price : [price]) : [],
    duration: duration ? (Array.isArray(duration) ? duration : [duration]) : [],
  sortBy: sortBy || 'latest',
    page: Number(page),
    limit: Number(limit)
  };

  const activecategories = await category.find({status:"active"}).select('_id');
const activeCategoryids =activecategories.map((c)=>{
  return c._id. toString()
})


  // get the filter
  let query = {isDeleted:false,status:"published"};
  if (search) query.name = { $regex: search, $options: 'i' };

  //category if query 
  if (selectedFilters.categories.length) {query.category = { $in: selectedFilters.categories.filter(c=>activeCategoryids.includes(c)) }}
  else{
    query.category={$in:activeCategoryids}
  };

  if (selectedFilters.rating.length) query.rating = { $gte: Math.min(...selectedFilters.rating) };
  if (selectedFilters.level.length) query.level = { $in: selectedFilters.level };
  if (selectedFilters.price.length){
    let priceConditions =[];
    if(selectedFilters.price.includes("free")){
        priceConditions.push({price:0})
    }
   if(selectedFilters.price.includes("paid")){
    priceConditions.push({price:{$gt:0}})
  }
  if(priceConditions.length>0){
    query.$or =priceConditions
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

  const courses = await course.find(query)
    .populate('category')
    .sort(sortOption)
    .skip(skip)
    .limit(selectedFilters.limit);


  const categoriesList = await category.find({status: "active"});

  res.render('courses', {
    courses,
    categories: categoriesList,
    selectedFilters,
    totalPages,
    totalCourses,
  });
};

exports.getcoursedetails = async(req,res)=>{
  const courseId = req.params._id
  const courses = await course.findById(courseId)
res.render('singlecourse',{course:courses})

}