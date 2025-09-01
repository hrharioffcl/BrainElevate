const createReferralLink = async (req,res,next)=>{
try {
    if(req.user){
      // res.locals.referralLink = `http://localhost:8000/signup?ref=${req.user.referralCode}`;
       console.log(req.locals.referralLink)
    }else{
        res.locals.referralLink=null;
    }
    next()
} catch (error) {
console.log(error)
}

}

module.exports= {createReferralLink}