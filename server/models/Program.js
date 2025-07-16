const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  longDescription: String,
  image: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels', 'Customized']
  },
  maxParticipants: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: String,
  instructor: {
    name: {
      type: String,
      required: true
    },
    image: String,
    experience: String,
    certifications: [String],
    bio: String,
    specialties: [String]
  },
  benefits: [String],
  features: [String],
  equipment: [String],
  whatToExpect: [String],
  schedule: [{
    day: String,
    time: String,
    spots: Number,
    type: String,
    focus: String,
    isAvailable: { type: Boolean, default: true }
  }],
  category: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'group', 'personal', 'specialized'],
    required: true
  },
  tags: [String],
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  caloriesBurn: {
    min: Number,
    max: Number
  },
  prerequisites: [String],
  contraindications: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false }
  }],
  media: {
    images: [String],
    videos: [String],
    documents: [String]
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes
programSchema.index({ id: 1 });
programSchema.index({ category: 1 });
programSchema.index({ level: 1 });
programSchema.index({ isActive: 1 });
programSchema.index({ 'rating.average': -1 });
programSchema.index({ enrollmentCount: -1 });

// Virtual for formatted price
programSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toLocaleString()}`;
});

// Method to calculate average rating
programSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }
  
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  this.rating.average = Math.round((sum / this.reviews.length) * 10) / 10;
  this.rating.count = this.reviews.length;
};

// Method to add review
programSchema.methods.addReview = function(userId, rating, comment) {
  this.reviews.push({
    userId,
    rating,
    comment,
    date: new Date()
  });
  
  this.calculateAverageRating();
  return this.save();
};

// Method to update enrollment count
programSchema.methods.incrementEnrollment = function() {
  this.enrollmentCount += 1;
  return this.save();
};

module.exports = mongoose.model('Program', programSchema);