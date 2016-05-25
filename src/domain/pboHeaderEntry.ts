import {Assert} from '../util/assert';

export enum PackingMethod {
    uncompressed = 0x00000000,
    packed = 0x43707273,
    product = 0x56657273
}

export interface IPboHeaderEntry {
    name: string;
    packingMethod: PackingMethod;
    originalSize: number;
	reserved: number;
    timestamp: number;
    dataSize: number;
    getSize(): number;
    contents: Buffer;
}

export class PboHeaderEntry implements IPboHeaderEntry {

    static getSignatureEntry(): IPboHeaderEntry {
        return new PboHeaderEntry('', PackingMethod.product, 0, 0, 0);
    }

    static getBoundaryEntry(): IPboHeaderEntry {
        return new PboHeaderEntry('', PackingMethod.uncompressed, 0, 0, 0);
    }

    public reserved: number;
    public contents: Buffer;

    constructor(
        public name: string,
        public packingMethod: PackingMethod,
        public originalSize: number,
        public timestamp: number,
        public dataSize: number) {
        Assert.isNotNull(name, 'name');
        Assert.isNumber(packingMethod, 'packingMethod');
        Assert.isNumber(originalSize, 'originalSize');
        Assert.isNumber(timestamp, 'timestamp');
        Assert.isNumber(dataSize, 'dataSize');

        this.reserved = 0;
    }

    getSize(): number {
        return this.name.length + 21;//name.length + 1 zero separator + 5 fields of 4-byte integers
    }
}