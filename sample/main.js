// 2019-08-08

const Path = require("path");

global.__vrender = "v-render";
global.__vrender = Path.resolve(__dirname, "../../v-render");

const VRender = require(__vrender);

// ==============================================
const router = VRender.router();

router("/module/a", (name, params, callback) => {
	callback(false, "sample/ModuleA");
});

router("/module/b", (name, params, callback) => {
	callback(false, "sample/ModuleB");
});

router(null, (name, params, callback) => {
	callback(false, "sample/Index");
});

// ==============================================
new VRender({
	mode: "development",
	cwd: Path.resolve(__dirname, "../"),
	server: {
		port: 9000
	}
});