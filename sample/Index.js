// 2019-08-08

const VRender = require(__vrender);

const $ = VRender.$;

const Index = VRender.PageView.extend(module, {
	renderBody (body) {
		Index.super(this, body);

		let tabs = $("ul.tabs").appendTo(body);
		tabs.append("<li class='tab' name='a'><a>ModuleA</a></li>");
		tabs.append("<li class='tab' name='b'><a>ModuleB</a></li>");

		$("#singlepage-container").appendTo(body).text("Default View");
	}
});

Index.use(require("../index"));
