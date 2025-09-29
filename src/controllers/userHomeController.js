
const course= require("../models/coursesSchema")
const category = require("../models/categorySchema")


exports.gethome = async (req,res)=>{

    
    const courses = await course.find({isDeleted:false,status:"published"}).sort({createdAt:-1}).limit(4).populate("category","name")
    const lowpricecourse =await course.find({isDeleted:false,status:"published",price:{$lte:500}}).sort({createdAt:-1}).limit(4).populate("category","name")
    const categories = await category.aggregate([
        {$match:{status:"active"}},
        {$limit:8},
        {
            $lookup:{
                from:"courses",
                localField:"_id",
                foreignField:"category",
                as:"courses"

            }
        },
        {
            $addFields:{
                coursecount:{
                    $size:{
                        $filter:{
                            input:"$courses",
                            as:"c",
                            cond:{
                                $and:[
                                    {$eq:["$$c.status","published"]},
                                    {$eq:["$$c.isDeleted",false]}

                                ]
                            }

                        }
                    }
                }
            }
        }
    ])
    console.log(categories)
    res.render('home', { fullName: req.user.fullName,referralLink:res.locals.referralLink ,courses,lowpricecourse,categories})
}

