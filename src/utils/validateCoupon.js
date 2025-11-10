
async function validateCoupon(cart, coupon, user, userUsage) {

  if (coupon.isDeleted === true) {
    return { valid: false, message: 'This coupon is not available' };
  }
  if (coupon.status === 'Inactive' || coupon.status === 'Expired' || coupon.couponQuantity === 0) {

    return { valid: false, message: 'Expired or inactive coupon.' };
  }
  if (userUsage && userUsage.usageCount === coupon.usesPerCustomer) {
    return { valid: false, message: `This coupon can only be redeemed ${coupon.usesPerCustomer} times.` };
  }
  if (coupon.minPurchaseAmount > cart.subTotal) {
    return { valid: false, message: `Minimum purchase of ₹${coupon.minPurchaseAmount} is required.` };
  }

  if (coupon.scope === 'coursespecific') {
    let eligibleCourseFound = false;

    for (const item of cart.items) {
      const course = item.course
      if (coupon.courseId.some((Id) => {
        return Id.equals(course._id)
      })) {
        eligibleCourseFound = true;
        break;
      }
    }
    if (!eligibleCourseFound) {
      return { valid: false, message: 'This coupon is not applicable to any course in your cart.' };
    }
  }


  return { valid: true, message: "Coupon is valid." };
}

module.exports = { validateCoupon }





