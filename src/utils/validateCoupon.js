
async function validateCoupon(cart, coupon, user, userUsage,req,res) {
  
    if (coupon.status === 'Inactive' || coupon.status === 'Expired' || coupon.couponQuantity === 0) {
 
    return { valid: false, message: 'Expired or inactive coupon.' };
    }
    if (userUsage && userUsage.usageCount === coupon.usesPerCustomer) {
    return { valid: false, message: `This coupon can only be redeemed ${coupon.usesPerCustomer} times.` };
    }
    if (coupon.scope === "global"  && coupon.minPurchaseAmount > cart.subTotal) {
    return { valid: false, message: `Minimum purchase of ₹${coupon.minPurchaseAmount} is required.` };
    }
    

  return { valid: true, message: "Coupon is valid." };
}

module.exports ={validateCoupon}





