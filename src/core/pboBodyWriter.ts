import { Header } from '../domain/header';
import { HeaderEntry } from '../domain/headerEntry';
import { PackingMethod } from '../domain/packingMethod';
import { LzhCompressor } from './lzh/lzhCompressor';
import { LzhReporter } from './lzh/lzhReporter';
import { StreamOptions } from './streamOptions';

export class PboBodyWriter {
    private readonly _lzhCompressor: LzhCompressor;
    private readonly _reporter: LzhReporter;

    constructor(options: StreamOptions) {
        this._reporter = new LzhReporter(options);
        this._lzhCompressor = new LzhCompressor(options);
    }

    writeBody(buffer: Buffer, header: Header): number {
        const size = header.entries.reduce((accumulated, entry) => {
            const copied = this._writeEntry(buffer, entry, accumulated);
            const offset = accumulated + copied;
            return offset;
        }, 0);

        return size;
    }

    _writeEntry(buffer: Buffer, entry: HeaderEntry, offset: number): number {
        const impl = entry.packingMethod === PackingMethod.packed
            ? this._writeCompressed
            : this._writeUncompressed;
        entry.dataSize = impl.call(this, buffer, entry, offset);
        return entry.dataSize;
    }

    _writeUncompressed(buffer: Buffer, entry: HeaderEntry, offset: number): number {
        const written = entry.contents.copy(buffer, offset, 0, entry.contents.length);
        return written;
    }

    _writeCompressed(buffer: Buffer, entry: HeaderEntry, offset: number): number {
        let written = this._safeWriteCompressed(buffer, entry, offset);

        if (written >= entry.originalSize) {
            written = this._writeUncompressed(buffer, entry, offset);
            entry.__fallbackToUncompressed();
            this._reporter.reportFile(entry.name, 1, 1);//0% compression
        }
        else {
            this._reporter.reportFile(entry.name, entry.originalSize, written);
        }
        return written;
    }

    _safeWriteCompressed(buffer: Buffer, entry: HeaderEntry, offset: number): number {
        let written = 0;
        try {
            written = this._lzhCompressor.writeCompressed(entry, buffer, offset);
        } catch (ex) {
            if (ex instanceof RangeError) {//in some circumstances thrown when the last entry has been compressed to a size greater than original size and has owerflown the buffer space remaining
                written = buffer.length;
            } else {
                throw ex;
            }
        }
        return written;
    }
}