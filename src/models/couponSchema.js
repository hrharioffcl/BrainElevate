const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponName: { 
    type: String,
     required: true 
    },
  couponCode: { 
    type: String, 
    required: true,
     unique: true 
    },
  description: { 
    type: String 
  },
  discountType: { 
    type: String,
     enum: ['Percentage', 'Amount'],
      required: true
   },
  discountValue: { 
    type: Number,
     required: true
     },
  minPurchaseAmount: { 
    type: Number, 
    default: 0 
  },
  maxDiscountAmount: {
     type: Number 
    }, 
  couponQuantity: { 
    type: Number,
     default: 1
     }, 
  usesPerCustomer: {
     type: Number,
      default: 1
     },
  status: {
     type: String, 
     enum: ['Active', 'Inactive','Expired'],
      default: 'Active' 
    },
  isDeleted:{
    type:Boolean,
    default:false
  },

  scope :{
    type:String,
    enum:['global','coursespecific']
  },
    // ✅ Date fields
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        // Ensure endDateTime is after startDateTime
        return this.startDateTime ? value > this.startDateTime : true;
      },
      message: "End date must be after start date"
    }
  },
courseId:[{
 type: mongoose.Schema.Types.ObjectId,
  ref: 'Course'
}]
},
{
    timestamps: true,      // adds createdAt, updatedAt automatically
  }
);

module.exports = mongoose.model('Coupon', couponSchema);
