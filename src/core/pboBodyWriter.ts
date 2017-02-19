import { Header } from '../domain/header';
import { HeaderEntry } from '../domain/headerEntry';

export class PboBodyWriter {
    writeBody(buffer: Buffer, header: Header): number {
        const size = header.entries.reduce((accumulated, entry) => {
            const copied = this._writeEntry(buffer, entry, accumulated);
            const offset = accumulated + copied;
            return offset;
        }, 0);

        return size;
    }

    _writeEntry(buffer: Buffer, entry: HeaderEntry, offset: number): number {
        const copied = entry.contents.copy(buffer, offset, 0, entry.contents.length);
        return copied;
    }
}