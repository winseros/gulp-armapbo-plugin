import {Assert} from '../util/assert';

export interface IPboHeaderExtension {
	name:string;
	value:string;
}

export class PboHeaderExtension implements IPboHeaderExtension {
	static getBoundary():PboHeaderExtension {
		return new PboHeaderExtension('', '');
	}

	static fromObject(base:IPboHeaderExtension):PboHeaderExtension {
		return new PboHeaderExtension(base.name, base.value);
	}

	constructor(public name:string,
				public value:string) {
		Assert.isNotNull(name, 'name');
		Assert.isNotNull(value, 'value');
	}

	getSize() {
		return this.name.length + this.value.length + 2;//2 strings +2 terminating zeroes
	}
}