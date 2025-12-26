// const mongoose = require("mongoose");
// const slugify = require("slugify");
// const Course = require("../models/coursesSchema"); // adjust if name differs

// (async () => {
//   try {
//     await mongoose.connect("mongodb://127.0.0.1:27017/Brainelavate");

//     const courses = await Course.find({
//       slug: { $exists: false }
//     });

//     console.log("Courses to update:", courses.length);

//     for (const course of courses) {
//       const baseSlug = slugify(course.name, {
//         lower: true,
//         strict: true
//       });

//       let slug = baseSlug;
//       let count = 1;

//       while (await Course.findOne({ slug })) {
//         slug = `${baseSlug}-${++count}`;
//       }

//       course.slug = slug;
//       await course.save();
//     }

//     console.log("✅ Slugs generated successfully");
//     process.exit(0);
//   } catch (err) {
//     console.error("❌ Error:", err);
//     process.exit(1);
//   }
// })();
