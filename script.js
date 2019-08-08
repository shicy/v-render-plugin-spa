// ========================================================
// 单页面插件，整站只在一个页面上显示，页面的切换不会刷新浏览器，页面主要内容通过动态异步加载实现。
// @author shicy <shicy85@163.com>
// Create on 2019-08-08
// ========================================================

define("plugin.singlepage", function ($, VR, Utils) {
	var SinglePage = VR.plugins.singlepage = function (options) {};

	var beInit = false;
	var readyCallbacks = [];

	// 主视图容器，视图变更时，容器外的视图不变
	var pageContainer = null;
	// 获取视图方法，根据路由状态获取视图对象(jQuery/html)，
	// 是一个异步回调方法，通过 setViewHandler() 方法设置
	var viewHandler = null;
	// 当前视图路由状态
	var currentState = null;
	// 视图切换时需要保留的视图，以便还原
	var retainedViews = [];
	var retainTarget = null;
	// 
	var pageScroller = null;

	// 可选的动态视图切换效果
	var animateTypes = ["animate_default"];
	var defaultAnimate = "animate_default";

	///////////////////////////////////////////////////////
	SinglePage.init = function (options) {
		if (Utils.isNotBlank(options && options.target))
			pageContainer = $(options.target);
		if (!pageContainer || pageContainer.length == 0) {
			pageContainer = $("#singlepage-container");
		}
		if (!pageContainer || pageContainer.length == 0) {
			pageContainer = $("body");
		}

		retainTarget = $("<div id='singlepage-retainviews'></div>").appendTo("body");

		beInit = true;
		Utils.each(readyCallbacks, function (callback) {
			callback();
		});
	};

	SinglePage.ready = function (callback) {
		if (beInit) {
			if (Utils.isFunction(callback))
				callback();
		}
		else {
			readyCallbacks.push(callback);
		}
	};

	// 设置视图生成方法，
	// @param handler 获取视图方法，根据 state 获取新的视图对象(jQuery/html)，
	// 		视图通过回调方法返回，型如：function (state, callback) {}
	SinglePage.setViewHandler = function (handler) {
		viewHandler = handler;
	};

	SinglePage.setScroller = function (value) {
		pageScroller = value;
	};

	///////////////////////////////////////////////////////
	// 重写 navigate() 方法
	VR.navigate = function (url, options) {
		if (Utils.isBlank(url))
			return ;

		var state = (typeof url === "string") ? {router: url} : url;
		state = $.extend({}, state, {replace: false, trigger: true, animate: false, retain: false}, options);
		state.trigger = Utils.isTrue(state.trigger);
		state.replace = Utils.isTrue(state.replace);
		state.retain = Utils.isTrue(state.retain);

		VR.trigger(VR.event_routerbefore, state); // 这里可以修改 state

		if (Utils.isNotBlank(state.router) && state.isDefaultPrevented !== true) {
			var router = currentState ? currentState.router : "__root_router";
			var pathname = router.split("?")[0];
			for (var i = retainedViews.length - 1; i >= 0; i--) {
				if (retainedViews[i].name.indexOf(pathname) >= 0) {
					retainedViews[i].view.remove();
					retainedViews.splice(i, 1);
				}
			}

			if (state.retain) {
				var temp = {name: router, view: pageContainer.children()};
				temp.scrollTop = pageScroller && pageScroller.scrollTop() || 0;
				retainedViews.push(temp);
				if (retainedViews.length > 50) {
					retainedViews[0].view.remove();
					retainedViews.shift();
				}
			}

			if (state.replace) {
				if (Utils.isFunction(history.replaceState)) {
					history.replaceState(state, state.title, state.router);
					if (state.trigger)
						VR.trigger(VR.event_routerchange, state);
				}
				else {
					return window.location.replace(state.router);
				}
			}
			else {
				if (Utils.isFunction(history.pushState)) {
					history.pushState(state, state.title, state.router);
					if (state.trigger)
						VR.trigger(VR.event_routerchange, state);
				}
				else {
					return window.location = state.router;
				}
			}

			currentState = state;
		}
	};

	// 页面回退事件
	window.addEventListener("popstate", function () {
		var state = history.state || {};
		state.isPopstate = true;
		VR.trigger(VR.event_statepop, state);
		VR.trigger(VR.event_routerchange, state);
		currentState = state;
	});

	///////////////////////////////////////////////////////
	VR.on(VR.event_routerchange, function (e, state) {
		var animate = getTransAnimation(state);
		getTransView(state, function (err, view, scrollTop) {
			var reverse = !!state.isPopstate;
			if (Utils.isFunction(animate)) {
				animate(state, pageContainer, view, reverse);
			}
			else if (animate === "animate_default") {
				doDefaultAnimation(state, pageContainer, view, reverse);
			}
			else {
				if (state.retain && !reverse) {
					pageContainer.children().appendTo(retainTarget);
					pageContainer.append(view);
				}
				else {
					pageContainer.empty().append(view);
				}
			}
			if (scrollTop && pageScroller) {
				setTimeout(function () {
					pageScroller.scrollTop(scrollTop);
				}, 400);
			}
		});
	});

	var getTransAnimation = function (state) {
		var animate = state.isPopstate ? currentState.animate : state.animate;
		if (animate === true)
			return defaultAnimate;

		if (Utils.isFunction(animate))
			return animate;

		if (typeof animate === "string") {
			if (animateTypes.indexOf(animate))
				return animate;
		}

		return false;
	};

	var getTransView = function (state, callback) {
		if (state && state.isPopstate) { // 后退操作
			var name = state.router || "__root_router";
			var transView = Utils.findBy(retainedViews, "name", name);
			if (transView) {
				Utils.removeBy(retainedViews, "name", name);
				return callback(false, transView.view, transView.scrollTop);
			}
		}

		if (Utils.isFunction(viewHandler)) {
			viewHandler(state, function (err, result) {
				callback(false, (!err ? result : ""));
			});
		}
		else {
			VR.require(state.router, function (err, result) {
				callback(false, (!err ? result : ""));
			});
		}
	};

	// ====================================================
	var doDefaultAnimation = function (state, target, view, reverse) {
		var animateTime = 300;
		target.addClass("singlepage-animate-default do");
		setTimeout(function () {
			if (state.retain && !reverse)
				target.children().appendTo(retainTarget);
			else
				target.children().remove();
			target.append(view);
			target.removeClass("do");
			setTimeout(function () {
				target.removeClass("singlepage-animate-default");
			}, animateTime);
		}, animateTime);
	};

});
