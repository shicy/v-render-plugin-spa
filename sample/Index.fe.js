// 2019-08-08

var SinglePage = VR.plugins.singlepage;

// ==============================================
SinglePage.setViewHandler(function (state, callback) {
	var url = "/module/"
	url += state && state.name || "a";
	VR.loadModule(url, function (err, ret) {
		if (err) {
			var errmsg = err.msg || err;
			ret = "<div class='module-error'>" + errmsg + "</div>";
		}
		callback(false, ret);
	});
});

VR.on(VR.event_routerchange, function (e, state) {
	var items = $("li.tab").removeClass("active");
	var name = state.name || "a";
	items.filter("[name=" + name + "]").addClass("active");
});

// ==============================================
$("body").on("tap", "li.tab", function (e) {
	var item = $(e.currentTarget);
	if (!item.is(".active")) {
		var data = {name: item.attr("name")};
		VR.navigate("/" + data.name, data);
	}
});

SinglePage.ready(function () {
	console.log("SinglePage ready!");
	$("body").append("<div>SinglePage ready!</div>");
});