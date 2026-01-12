const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        chaptersProgress: [
            {
                chapterId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Chapter",
                    required: true
                },
                watchedDuration: {
                    type: Number, // seconds
                    default: 0
                },
                totalDuration: {
                    type: Number, // seconds
                    default: 0
                },
                progressPercent: {
                    type: Number,
                    min: 0,
                    max: 100,
                    default: 0
                },
                completed: {
                    type: Boolean,
                    default: false
                },
                lastWatchedAt: {
                    type: Date
                }
            }
        ],
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        status: {
            type: String,
            enum: ["ongoing", "completed"],
            default: "ongoing"
        },
        lastAccessed: {
            type: Date,
            default: Date.now
        },
        enrolledAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Prevent duplicate enrollments for same student + course
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
