import { StackBuffer } from './stackBuffer';

export class LzhPacket {
    static readonly chunks = 8;
    static readonly minBytesToPack = 3;
    static readonly maxChunkSize = LzhPacket.minBytesToPack + 0b1111;

    static readonly maxOffsetToUseWhitespaces = StackBuffer.size - LzhPacket.maxChunkSize;

    private _data = Buffer.allocUnsafe(LzhPacket.chunks * LzhPacket.maxChunkSize);
    private _next = Buffer.allocUnsafe(LzhPacket.maxChunkSize);
    private _format = 0b00000000;
    private _length = 0;

    flush(buffer: Buffer, offset: number): number {
        buffer.writeUInt8(this._format, offset);
        this._data.copy(buffer, offset + 1, 0, this._length);
        return this._length + 1;
    }

    compose(buffer: Buffer, offset: number, dict: StackBuffer): number {
        const originalOffset = offset;
        for (let i = 0; i < LzhPacket.chunks && offset < buffer.length; i++) {
            const read = Math.min(LzhPacket.maxChunkSize, buffer.length - offset);
            if (read < LzhPacket.minBytesToPack) {
                offset += this._composeUncompressed(i, buffer, offset, dict);
            } else {
                offset += this._composeCompressed(i, read, buffer, offset, dict);
            }
        }
        const sourceBytesCompressed = offset - originalOffset;
        return sourceBytesCompressed;
    }

    _composeUncompressed(chunk: number, buffer: Buffer, offset: number, dict: StackBuffer): number {
        dict.add(buffer, offset, 1);
        this._format = this._format | 1 << chunk;
        const copied = buffer.copy(this._data, this._length, offset, offset + 1);//1 byte copied
        this._length += copied;
        return copied;
    }

    _composeCompressed(chunk: number, read: number, buffer: Buffer, offset: number, dict: StackBuffer): number {
        const next = buffer.copy(this._next, 0, offset, Math.min(offset + read, buffer.length));

        const intersect = dict.intersect(this._next, next);
        const whitespace = offset < LzhPacket.maxOffsetToUseWhitespaces ? dict.checkWhitespace(this._next, next) : 0;
        const sequence = dict.checkSequence(this._next, next);

        let processed;
        if (intersect.length >= LzhPacket.minBytesToPack || whitespace >= LzhPacket.minBytesToPack || sequence.sourceBytes >= LzhPacket.minBytesToPack) {
            let pointer;
            if (intersect.length >= whitespace && intersect.length >= sequence.sourceBytes) {
                pointer = this._composePointer(dict.fullfilment - intersect.position, intersect.length);
                processed = intersect.length;
            } else if (whitespace >= intersect.length && whitespace >= sequence.sourceBytes) {
                pointer = this._composePointer(offset + whitespace, whitespace);
                processed = whitespace;
            } else {
                pointer = this._composePointer(sequence.sequenceBytes, sequence.sourceBytes);
                processed = sequence.sourceBytes;
            }
            dict.add(buffer, offset, processed);
            this._length = this._data.writeUInt16LE(pointer, this._length, true);
        } else {
            processed = this._composeUncompressed(chunk, buffer, offset, dict);
        }

        return processed;
    }

    _composePointer(offset: number, length: number): number {
        length = (length - LzhPacket.minBytesToPack) << 8;
        offset = ((offset & 0x0F00) << 4) + (offset & 0x00FF);
        const result = offset + length;
        return result;
    }
}