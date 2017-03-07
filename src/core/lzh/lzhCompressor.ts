import { StackBuffer } from './stackBuffer';
import { LzhPacket } from './lzhPacket';

export class LzhCompressor {
    writeCompressed(source: Buffer, target: Buffer, offset: number): number {
        let sourceOffset = 0;
        let targetOffset = offset;
        const dict = this._getCompressionDict();
        while (sourceOffset < source.length) {
            const packet = this._getPacket();
            sourceOffset += packet.compose(source, sourceOffset, dict);
            targetOffset += packet.flush(target, targetOffset);
        }

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