import { Header } from '../domain/header';
import { HeaderEntry } from '../domain/headerEntry';
import { PackingMethod } from '../domain/packingMethod';
import { LzhCompressor } from './lzh/lzhCompressor';
import { CompressionReporter } from './lzh/compressionReporter';
import { StreamOptions } from './streamOptions';

export class PboBodyWriter {
    private readonly _lzhCompressor = new LzhCompressor();
    private readonly _reporter: CompressionReporter;

    constructor(options: StreamOptions) {
        this._reporter = new CompressionReporter(options);
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
        let written = this._lzhCompressor.writeCompressed(entry.contents, buffer, offset);
        if (written >= entry.originalSize) {
            written = this._writeUncompressed(buffer, entry, offset);
            entry.__fallbackToUncompressed();
        }
        else {
            this._reporter.reportFile(entry.name, entry.originalSize, written);
        }
        return written;
    }
}