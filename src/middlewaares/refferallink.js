const createReferralLink = async (req,res,next)=>{
    console.log("two")
try {
    if(req.user){//req.user from token
       res.locals.referralLink = `http://localhost:8000/signup?ref=${req.user.referralCode}`;
    }else{
        res.locals.referralLink=null;
    }
    console.log(res.locals.referralLink)
    next()
} catch (error) {
console.log(error)
}

}

module.exports= {createReferralLink}