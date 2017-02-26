import { StackBuffer } from './stackBuffer';
import { LzhPacket } from './lzhPacket';

export class LzhCompressor {
    writeCompressed(source: Buffer, target: Buffer, offset: number, dict: StackBuffer): number {
        let sourceOffset = 0;
        let targetOffset = offset;
        while (sourceOffset < source.length) {
            const packet = this._getPacket();
            sourceOffset += packet.compose(source, sourceOffset, dict);
            targetOffset += packet.flush(target, targetOffset);
        }
        const written = targetOffset - offset;
        return written;
    }

    _getPacket() {
        return new LzhPacket();
    }
}