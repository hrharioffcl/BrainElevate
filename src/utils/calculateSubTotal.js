const Cart = require('../models/cartSchema')

async function calculateSubTotal(cartId) {
    const [result] = await Cart.aggregate([
        { $match: { _id: cartId } },
        {
            $lookup: {
                from: "cartitems",
                localField: "items",
                foreignField: "_id",
                as: "cartItems"

            }

        },{
            $project:{
                subTotal:{$sum:"$cartItems.basePrice"}
            }
        }
    ])
return result?result.subTotal:0
}
module.exports ={calculateSubTotal}