const toNumber = (value: string | undefined, fallback: number): number => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

export const appConfig = {
	nodeEnv: process.env.NODE_ENV ?? "development",
	port: toNumber(process.env.PORT, 4000),
	clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
	mongoUri: process.env.MONGO_URI,
	dbName: process.env.DB_NAME ?? "klasee",
} as const;

