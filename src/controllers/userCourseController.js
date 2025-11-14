
const course = require("../models/coursesSchema")
const category = require("../models/categorySchema")
const Cart = require("../models/cartSchema");
const Wishlist = require("../models/wishListSchema")

exports.getcourse = async (req, res) => {
  try {
    const { search, categories, rating, level, price, duration, sortBy = 'latest', page = 1, limit = 12 } = req.query;
    const user = res.locals.user;

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

    const activecategories = await category.find({ status: "active" }).select('_id');
    const activeCategoryids = activecategories.map((c) => {
      return c._id.toString()
    })


    // get the filter
    let query = { isDeleted: false, status: "published" };
    if (search) query.name = { $regex: search, $options: 'i' };

    //category if query 
    if (selectedFilters.categories.length) { query.category = { $in: selectedFilters.categories.filter(c => activeCategoryids.includes(c)) } }
    else {
      query.category = { $in: activeCategoryids }
    };

    if (selectedFilters.rating.length) query.rating = { $gte: Math.min(...selectedFilters.rating) };
    if (selectedFilters.level.length) query.level = { $in: selectedFilters.level };
    if (selectedFilters.price.length) {
      let priceConditions = [];
      if (selectedFilters.price.includes("free")) {
        priceConditions.push({ price: 0 })
      }
      if (selectedFilters.price.includes("paid")) {
        priceConditions.push({ price: { $gt: 0 } })
      }
      if (priceConditions.length > 0) {
        query.$or = priceConditions
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

    let courses = await course.find(query)
      .populate('category')
      .sort(sortOption)
      .skip(skip)
      .limit(selectedFilters.limit);

    //adding addedtocartlogic flag for every course (checking wether ithe course isadded to the cart)
    //ADD WISHLIST IN FUTURE// ALSO BOUGHT LIST IF NEEDED
    if (user) {

      let cartCourseIds = [];
      const cart = await Cart.findOne({ cartUser: user._id }).populate({
        path: 'items',
        populate: { path: 'course', model: 'Course' },
        select: 'name author thumbnail price details'
      })
      if (cart) {
        cartCourseIds = cart.items.map((i) => {
          return i.course._id.toString()
        })

      }
      const wishlistItems = await Wishlist.find({ userId: user._id }).select('courseId');
      const wishlistCourseIds = wishlistItems.map(w => w.courseId.toString());


      courses = courses.map((c) => {
        return {
          ...c.toObject(), inCart: cartCourseIds.includes(c._id.toString()),
          inWish: wishlistCourseIds.includes(c._id.toString())
        }
      })
    } else {
      courses = courses.map((c) => {
        return {
          ...c.toObject(), inCart: false, inWish: false

        }
      })
    }

    const categoriesList = await category.find({ status: "active" });

    res.render('courses', {
      courses,
      categories: categoriesList,
      selectedFilters,
      totalPages,
      totalCourses,
    });
  } catch (error) {
    console.log(error)
    res.redirect('/home')
  }
};

exports.getcoursedetails = async (req, res) => {
  try {
    const courseId = req.params._id
    const user = res.locals.user
    let courses = await course.findById(courseId)

    if (!courses) {
      req.flash('error', 'Course not found');
      return res.redirect('/courses');
    }

    //adding incartgfalg can be used for future wishlist
    //here its single course so just tries to find if the course belongs tio the cart coiurse ids
    let inCart = false;
    if (user) {
      let cartCourseIds = [];
      const cart = await Cart.findOne({ cartUser: user._id }).populate({
        path: 'items',
        populate: { path: 'course', model: 'Course' },
        select: 'name author thumbnail price details'
      })
      if (cart) {
        cartCourseIds = cart.items.map((i) => {
          return i.course._id.toString()
        })
        inCart = cartCourseIds.includes(courses._id.toString())
      }
    }
    const courseDet = {
      ...courses.toObject(), inCart
    }
    console.log('Course inCart flag:', inCart);

    res.render('singlecourse', { course: courseDet })

  } catch (error) {
    console.log(error)
    res.redirect('/courses')
  }

}