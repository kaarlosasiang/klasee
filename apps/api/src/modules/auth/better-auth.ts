import "dotenv/config"
import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"
import { constants } from "../../config/index.js"

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
        return target.collection(collectionName, options)
      }
    }
    return Reflect.get(target, prop, receiver)
  },
})

export const auth = betterAuth({
  database: mongodbAdapter(dbProxy as any),
  appUrl: constants.frontEndUrl, // Frontend URL for redirects
  baseURL: constants.betterAuthOrigin, // API origin (no path)
  basePath: "/api/v1/auth", // Auth route prefix
  secret: constants.betterAuthSecret,
  trustedOrigins: [constants.frontEndUrl, constants.betterAuthOrigin],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: constants.googleClientId as string,
      clientSecret: constants.googleClientSecret as string,
    },
    github: {
      clientId: constants.githubClientId as string,
      clientSecret: constants.githubClientSecret as string,
    },
  },
  user: {
    additionalFields: {
      companyId: { type: "string", required: false }, // Optional for social login
      role: {
        type: "string",
        required: false, // Will be set after social login
      },
      first_name: { type: "string", required: false },
      middle_name: { type: "string", required: false },
      last_name: { type: "string", required: false },
      phone_number: { type: "string", required: false },
      username: { type: "string", required: false },
      // Onboarding tracking fields
      profileSetupCompletedAt: { type: "string", required: false },
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
})
