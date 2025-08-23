const dummyuserAuth = function (req,res,next) 
{
    console.log("user auth  middleware runs...")
    const token ="12346"
    if(token===12346){
next()
 }
    else{
        res.send("invalid unauthorized")
    }
    
}