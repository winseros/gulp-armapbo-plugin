import { Assert } from '../util/assert';
import * as crypto from 'crypto';

export class Sha1 {
    constructor(private buffer: Buffer) {
        Assert.isNotNull(buffer, 'buffer');
    }

    get(): Buffer {
        const hash = crypto.createHash('sha1');
        hash.update(this.buffer);
        const result = hash.digest();
        return result;
    }
}