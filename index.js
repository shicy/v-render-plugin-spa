// 2019-08-08

const VRender = require(__vrender__);

const configs = {};

module.exports = {
	install: function (params) {
		configs[this] = params;
		// VRender.logger.debug("plugin installed: singlepage.");
	},

	initView: function () {
		this.import("file://" + __dirname + "/style.css", {group: "plugin", index: 0});
		this.import("file://" + __dirname + "/script.js", {group: "plugin", index: 0});
	},

	renderBodyAfter: function (body) {
		let config = configs[this.__self__] || {};

		let tagid = VRender.uuid();
		let script = VRender.$("<script id='" + tagid + "'></script>").appendTo(body);

		let params = JSON.stringify({target: config.container});
		script.write("$(function(){");
		script.write("var a=VRender,b=a.plugins,c=b&&b.singlepage;");
		script.write("if(a.Utils.isFunction(c&&c.init))c.init(" + params+ ");");
		script.write("$('#" + tagid + "').remove();");
		script.write("});");
	}
};