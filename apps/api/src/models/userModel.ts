import mongoose from "mongoose"

/**
 * Read-only Mongoose model mirroring Better Auth's `users` collection.
 * Used solely for populate() in relations. Better Auth owns all writes.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    image: { type: String },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    schoolId: { type: String },
    firstName: { type: String },
    middleName: { type: String },
    lastName: { type: String },
    phoneNumber: { type: String },
    username: { type: String },
    dateOfBirth: { type: String },
    isActive: { type: Boolean, default: true },
    onboardingCompleted: { type: Boolean, default: false },
    profileSetupCompletedAt: { type: Number },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    collection: "users",
    timestamps: false, // Better Auth manages createdAt/updatedAt
  }
)

export const User = mongoose.model("User", userSchema)
