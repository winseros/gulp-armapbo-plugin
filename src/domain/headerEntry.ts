import { Assert } from '../util/assert';
import { PackingMethod } from './packingMethod';

export class HeaderEntry {

    static getSignatureEntry(): HeaderEntry {
        return new HeaderEntry('', PackingMethod.product, 0, 0);
    }

    static getBoundaryEntry(): HeaderEntry {
        return new HeaderEntry('', PackingMethod.uncompressed, 0, 0);
    }

    constructor(name: string, packingMethod: PackingMethod, originalSize: number, timestamp: number) {
        Assert.isNotNull(name, 'name');

        this.name = name;
        this.packingMethod = packingMethod;
        this.originalSize = originalSize;
        this.timestamp = timestamp;
    }

    readonly name: string;

    readonly packingMethod: PackingMethod;

    readonly originalSize: number;

    readonly timestamp: number;

    readonly reserved: number = 0;

    contents: Buffer;

    dataSize: number = 0;

    getSize(): number {
        return this.name.length + 21;//name.length + 1 zero separator + 5 fields of 4-byte integers
    }
}
