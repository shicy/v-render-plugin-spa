// 2019-08-08

const VRender = require(__vrender);


const ModuleA = VRender.Fragment.extend(module, {
	render (output) {
		ModuleA.super(this, output);
		output.text("Module A");
	}
});