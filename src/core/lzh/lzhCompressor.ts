import { HeaderEntry } from '../../domain/headerEntry';
import { StackBuffer } from './stackBuffer';
import { LzhPacket } from './lzhPacket';
import { LzhReporter } from './lzhReporter';
import { StreamOptions } from '../streamOptions';

export class LzhCompressor {
    private readonly _progress: LzhReporter;

    constructor(options: StreamOptions) {
        this._progress = new LzhReporter(options);
    }

    writeCompressed(entry: HeaderEntry, target: Buffer, offset: number): number {
        let sourceOffset = 0;
        let targetOffset = offset;
        const dict = this._getCompressionDict();

        const source = entry.contents;

        this._progress.reportProgress(entry.name, source.length, 0);

        while (sourceOffset < source.length) {
            const packet = this._getPacket();
            sourceOffset += packet.compose(source, sourceOffset, dict);
            targetOffset += packet.flush(target, targetOffset);

            this._progress.reportProgress(entry.name, source.length, sourceOffset);
        }

        this._progress.reportProgress(entry.name, source.length, source.length);

        targetOffset = this._writeCrc(source, target, targetOffset);

        const written = targetOffset - offset;
        return written;
    }

    _writeCrc(source: Buffer, target: Buffer, offset: number): number {
        const crc = this._getCrc(source);
        offset = target.writeUInt32LE(crc, offset);
        return offset;
    }

    _getCrc(source: Buffer): number {
        let crc = 0;
        for (const byte of source) {
            crc += byte;
        }
        return crc;
    }

    _getCompressionDict(): StackBuffer {
        return new StackBuffer();
    }

    _getPacket() {
        return new LzhPacket();
    }
}