const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);
const wsShim = path.resolve(__dirname, "./shims/ws.js");
const emptyShim = path.resolve(__dirname, "./shims/empty.js");
const previousResolveRequest = config.resolver?.resolveRequest;

config.resolver = {
	...(config.resolver ?? {}),
	extraNodeModules: {
		...(config.resolver?.extraNodeModules ?? {}),
		ws: wsShim,
		stream: emptyShim,
	},
	resolveRequest: (context, moduleName, platform) => {
		if (moduleName === "ws") {
			return { filePath: wsShim, type: "sourceFile" };
		}
		if (moduleName === "stream") {
			return { filePath: emptyShim, type: "sourceFile" };
		}

		if (previousResolveRequest) {
			return previousResolveRequest(context, moduleName, platform);
		}

		return context.resolveRequest(context, moduleName, platform);
	},
};

module.exports = config;
