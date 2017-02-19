import { HeaderEntry } from './headerEntry';
import { HeaderExtension } from './headerExtension';

export class Header {
    readonly signature = HeaderEntry.getSignatureEntry();

    readonly boundary = HeaderEntry.getBoundaryEntry();

    constructor(extensions: HeaderExtension[], entries: HeaderEntry[]) {
        this.extensions = extensions;
        this.entries = entries;
    }

    readonly extensions: HeaderExtension[];

    readonly entries: HeaderEntry[];
}