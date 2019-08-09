## v-render-plugin-spa
`v-render`单页面插件。   
扩展了路由功能，在路由变更时阻止刷新页面，更新地址栏并动态更新页面。

### 安装
```
npm install v-render-plugin-spa --save
```

### 使用
```javascript
// Index.js

const VRender = require("v-render");
const SinglePage = require("v-render-plugin-spa");

const Index = VRender.PageView.extend(module, {
    renderBody: function (body) {
        Index.super(this, body);

        let tabs = $("ul.tabs").appendTo(body);
        tabs.append("<li class='tab' name='a'><a>ModuleA</a></li>");
        tabs.append("<li class='tab' name='b'><a>ModuleB</a></li>");

        // #singlepage-container 作为插件的默认容器，动态视图在该容器里显示
        $("#singlepage-container").appendTo(body).text("Default View");
    }
});

Index.use(SinglePage);
// or use custom container
// Index.use(SinglePage, { container: "#my-container" });
```

```javascript
// Index.fe.js

var SinglePage = VR.plugins.singlepage;

// 根据 state 返回子页面内容，state 对应 VR.navigate() 第2个参数
SinglePage.setViewHandler(function (state, callback) {
    var url = "/module/"
    url += state && state.name || "a";
    // VR.loadModule() 是动态加载子模块（视图）的方法，参见[v-render说明](https://github.com/shicy/v-render)。
    VR.loadModule(url, function (err, html) {
        callback(false, html);
    });
});

// 点击事件（切换视图）
$("body").on("tap", "li.tab", function (e) {
    var item = $(e.currentTarget);
    var state = {name: item.attr("name")};
    VR.navigate("/" + state.name, state);
});
```