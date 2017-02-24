import { HeaderEntry } from './headerEntry';
import { HeaderExtension } from './headerExtension';
import { PackingMethod } from './packingMethod';

export class Header {
    readonly signature = HeaderEntry.getSignatureEntry();

    readonly boundary = HeaderEntry.getBoundaryEntry();

    constructor(extensions: HeaderExtension[], entries: HeaderEntry[]) {
        this.extensions = extensions;
        this.entries = entries;
        this.packed = entries.some(e => e.packingMethod === PackingMethod.packed);
    }

    readonly extensions: HeaderExtension[];

    readonly entries: HeaderEntry[];

    readonly packed: boolean;
}