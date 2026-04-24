type LogMeta = Record<string, unknown>;

const withMeta = (message: string, meta?: LogMeta) => {
	if (!meta) return message;
	return `${message} ${JSON.stringify(meta)}`;
};

export const logger = {
	info: (message: string, meta?: LogMeta) => {
		console.log(withMeta(message, meta));
	},
	warn: (message: string, meta?: LogMeta) => {
		console.warn(withMeta(message, meta));
	},
	error: (message: string, meta?: LogMeta) => {
		console.error(withMeta(message, meta));
	},
};

