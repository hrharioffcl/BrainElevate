
const course= require("../models/coursesSchema")
const category = require("../models/categorySchema")


exports.getcourse = async(req,res)=>{
   const { search, categories, rating, level, price, duration } = req.query;

  const selectedFilters = {
    search: search || '',
    categories: categories ? (Array.isArray(categories) ? categories : [categories]) : [],
    rating: rating ? (Array.isArray(rating) ? rating : [rating]) : [],
    level: level ? (Array.isArray(level) ? level : [level]) : [],
    price: price ? (Array.isArray(price) ? price : [price]) : [],
    duration: duration ? (Array.isArray(duration) ? duration : [duration]) : []
  };

  // Build MongoDB query
  let query = {};
  if (search) query.name = { $regex: search, $options: 'i' }; // search in course name
  if (selectedFilters.categories.length) query.category = { $in: selectedFilters.categories };
  if (selectedFilters.rating.length) query.rating = { $gte: Math.min(...selectedFilters.rating) };
  if (selectedFilters.level.length) query.level = { $in: selectedFilters.level };
  if (selectedFilters.price.length) query.priceType = { $in: selectedFilters.price }; // paid/free
  if (selectedFilters.duration.length) query.duration = { $in: selectedFilters.duration };

  const courses = await course.find(query).populate('category');
  const categoriesList = await category.find();

  res.render('courses', { courses, categories: categoriesList, selectedFilters });
}