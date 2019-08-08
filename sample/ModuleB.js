// 2019-08-08

const VRender = require(__vrender);


const ModuleB = VRender.Fragment.extend(module, {
	render (output) {
		ModuleB.super(this, output);
		output.text("Module B");
	}
});