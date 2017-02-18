import { Assert } from '../util/assert';

export enum PackingMethod {
    uncompressed = 0x00000000,
    packed = 0x43707273,
    product = 0x56657273
}

export class PboHeaderEntry {

    static getSignatureEntry(): PboHeaderEntry {
        return new PboHeaderEntry('', PackingMethod.product, 0, 0, 0);
    }

    static getBoundaryEntry(): PboHeaderEntry {
        return new PboHeaderEntry('', PackingMethod.uncompressed, 0, 0, 0);
    }

    constructor(name: string, packingMethod: PackingMethod, originalSize: number, timestamp: number, dataSize: number) {
        Assert.isNotNull(name, 'name');

        this.name = name;
        this.packingMethod = packingMethod;
        this.originalSize = originalSize;
        this.timestamp = timestamp;
        this.dataSize = dataSize;
    }

    readonly name: string;

    readonly packingMethod: PackingMethod;

    readonly originalSize: number;

    readonly timestamp: number;

    readonly dataSize: number;

    readonly reserved: number = 0;

    contents: Buffer;

    getSize(): number {
        return this.name.length + 21;//name.length + 1 zero separator + 5 fields of 4-byte integers
    }
}
