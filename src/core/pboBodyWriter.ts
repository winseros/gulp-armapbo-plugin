import { Header } from '../domain/header';
import { HeaderEntry } from '../domain/headerEntry';
import { PackingMethod } from '../domain/packingMethod';
import { LzhCompressor } from './lzhCompressor';
import { StackBuffer } from './stackBuffer';

export class PboBodyWriter {
    private _lzhCompressor = new LzhCompressor();

    writeBody(buffer: Buffer, header: Header): number {
        const dict = this._getCompressionDict(header);
        const size = header.entries.reduce((accumulated, entry) => {
            const copied = this._writeEntry(buffer, entry, accumulated, dict);
            const offset = accumulated + copied;
            return offset;
        }, 0);

        return size;
    }

    _getCompressionDict(header: Header): StackBuffer | undefined {
        const stackBuffer = header.packed ? new StackBuffer() : undefined;
        return stackBuffer;
    }

    _writeEntry(buffer: Buffer, entry: HeaderEntry, offset: number, dict?: StackBuffer): number {
        const impl = dict && dict.isFull && entry.packingMethod === PackingMethod.packed
            ? this._writeCompressed
            : this._writeUncompressed;
        entry.dataSize = impl(buffer, entry, offset, dict!);
        return entry.dataSize;
    }

    _writeUncompressed(buffer: Buffer, entry: HeaderEntry, offset: number, dict?: StackBuffer): number {
        const written = entry.contents.copy(buffer, offset, 0, entry.contents.length);
        dict && dict.add(entry.contents);//tslint:disable-line:no-unused-expression
        return written;
    }

    _writeCompressed(buffer: Buffer, entry: HeaderEntry, offset: number, dict: StackBuffer): number {
        const written = this._lzhCompressor.writeCompressed(entry.contents, buffer, offset, dict);
        return written;
    }
}