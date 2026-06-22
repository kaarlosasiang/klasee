import "dotenv/config"
import { betterAuth, type Auth } from "better-auth"
import { dash } from "@better-auth/infra"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"
import { constants } from "../../config/index.js"
import { emailOTP } from "better-auth/plugins"
// import { forgetPassword } from "better-auth/plugins"
import { sendVerificationEmail } from "../../shared/services/email.js"

const client = new MongoClient(constants.mongodbUri!, {
  maxPoolSize: 5,
  retryWrites: false,
})
const db = client.db(constants.dbName)

const dbProxy = new Proxy(db, {
  get(target, prop, receiver) {
    if (prop === "collection") {
      return function (name: string, options?: any) {
        // Redirect "user" collection to "users"
        // Redirect "organization" collection to "company"
        let collectionName = name
        if (name === "user") collectionName = "users"
        if (name === "organization") collectionName = "company"
        if (name === "emailVerification") collectionName = "emailVerifications"
        if (name === "forgetPasswordToken")
          collectionName = "passwordResetTokens"
        return target.collection(collectionName, options)
      }
    }
    return Reflect.get(target, prop, receiver)
  },
})

export const auth = betterAuth({
  database: mongodbAdapter(dbProxy as any),
  appUrl: constants.frontEndUrl, // Frontend URL for redirects
  baseURL: constants.frontEndUrl, // API origin (no path)
  basePath: "/api/auth", // Auth route prefix
  secret: constants.betterAuthSecret,
  trustedOrigins: [constants.frontEndUrl, constants.betterAuthOrigin],

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: constants.googleClientId as string,
      clientSecret: constants.googleClientSecret as string,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
      accessType: "offline",
      prompt: "select_account consent",
    },
    github: {
      clientId: constants.githubClientId as string,
      clientSecret: constants.githubClientSecret as string,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: user.role || "student",
              firstName: user.firstName || user.name?.split(" ")[0] || "",
              lastName:
                user.lastName || user.name?.split(" ").slice(1).join(" ") || "",
              onboardingCompleted: user.onboardingCompleted ?? false,
            },
          }
        },
      },
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type === "email-verification") {
          await sendVerificationEmail(email, otp)
        }
      },
    }),
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY,
      activityTracking: {
        enabled: true,
        updateInterval: 300000, // Update interval in ms (default: 5 minutes)
      },
    }),
  ],
  user: {
    additionalFields: {
      schoolId: { type: "string", required: false },
      role: { type: "string", required: false }, // "student" | "instructor" | "admin"
      firstName: { type: "string", required: false },
      middleName: { type: "string", required: false },
      lastName: { type: "string", required: false },
      phoneNumber: { type: "string", required: false },
      username: { type: "string", required: false },
      isActive: { type: "boolean", required: false },
      onboardingCompleted: { type: "boolean", required: false },
      profileSetupCompletedAt: { type: "number", required: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  // advanced: {
  //   useSecureCookies: constants.nodeEnv === "production",
  //   defaultCookieAttributes: {
  //     httpOnly: true,
  //     sameSite: constants.nodeEnv === "production" ? "none" : "lax",
  //     secure: constants.nodeEnv === "production",
  //     domain:
  //       constants.nodeEnv === "production" ? ".amfintrass.com" : undefined,
  //   },
  //   crossSubdomainCookies: {
  //     enabled: constants.nodeEnv === "production",
  //     domain: ".amfintrass.com",
  //   },
  // },
}) as unknown as Auth
