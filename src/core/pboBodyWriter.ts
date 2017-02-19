import { Header } from '../domain/header';
import { HeaderEntry } from '../domain/headerEntry';
import { PackingMethod } from '../domain/packingMethod';
import { LzhCompressor } from './lzhCompressor';

export class PboBodyWriter {
    static minOffsetToPack = 0b0000111111111111;

    private _lzhCompressor = new LzhCompressor();

    writeBody(buffer: Buffer, header: Header): number {
        const size = header.entries.reduce((accumulated, entry) => {
            const copied = this._writeEntry(buffer, entry, accumulated);
            const offset = accumulated + copied;
            return offset;
        }, 0);

        return size;
    }

    _writeEntry(buffer: Buffer, entry: HeaderEntry, offset: number): number {
        const impl = entry.packingMethod === PackingMethod.packed && offset >= PboBodyWriter.minOffsetToPack
            ? this._writeCompressed
            : this._writeUncompressed;
        entry.dataSize = impl(buffer, entry, offset);
        return entry.dataSize;
    }

    _writeUncompressed(buffer: Buffer, entry: HeaderEntry, offset: number): number {
        const written = entry.contents.copy(buffer, offset, 0, entry.contents.length);
        return written;
    }

    _writeCompressed(buffer: Buffer, entry: HeaderEntry, offset: number): number {
        let written = this._lzhCompressor.writeCompressed(entry.contents, buffer, offset);
        if (written >= entry.contents.length) {
            written = this._writeUncompressed(buffer, entry, offset);
        }
        return written;
    }
}