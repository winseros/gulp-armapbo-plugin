import { Assert } from '../util/assert';

export class HeaderExtension {
    static getBoundary(): HeaderExtension {
        return new HeaderExtension('', '');
    }

    constructor(name: string, value: string) {
        Assert.isNotNull(name, 'name');
        Assert.isNotNull(value, 'value');
        this.name = name;
        this.value = value;
    }

    readonly name: string;

    readonly value: string;

    getSize() {
        return this.name.length + this.value.length + 2;//2 strings +2 terminating zeroes
    }
}