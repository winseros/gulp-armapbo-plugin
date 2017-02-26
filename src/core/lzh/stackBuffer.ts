export interface BufferIntersection {
    position: number;

    length: number;
}

export interface SequenceInspection {
    sourceBytes: number;

    sequenceBytes: number;
}

export class StackBuffer {
    static size = 0b0000111111111111;

    private _data = Buffer.allocUnsafe(StackBuffer.size);
    private _fullfilment = 0;

    add(buffer: Buffer, offset: number, length: number): void {
        if (length >= StackBuffer.size) {//replace the buffer contents
            const sourceStart = offset + length - StackBuffer.size;
            this._fullfilment = buffer.copy(this._data, 0, sourceStart, sourceStart + length);
        } else if (this._fullfilment + length > StackBuffer.size) {//shift the buffer contents left until there is enough space for the new bunch of bytes
            const takeExisting = StackBuffer.size - length;
            this._data.copyWithin(0, this._fullfilment - takeExisting, this._fullfilment);
            buffer.copy(this._data, takeExisting, offset, offset + length);
            this._fullfilment = StackBuffer.size;
        } else {//add some bytes onto the free space of the buffer
            this._fullfilment += buffer.copy(this._data, this._fullfilment, offset, offset + length);
        }
    }

    intersect(buffer: Buffer): BufferIntersection {
        if (buffer.length) {
            let intersection: BufferIntersection | undefined;
            let offset = 0;
            while (true) {
                const next = this._intersectBufferAtOffset(buffer, offset);
                if (!intersection || intersection.length < next.length) {
                    intersection = next;
                }
                if (next.position >= 0 && next.position <= this._data.length - 1) {
                    offset = next.position + 1;
                } else {
                    break;
                }
            }
            return intersection;
        } else {
            return { position: -1, length: 0 };
        }
    }

    _intersectBufferAtOffset(buffer: Buffer, offset: number): BufferIntersection {
        const position = this._data.indexOf(buffer[0], offset);
        let length = 0;
        if (position >= 0) {
            length++;
            for (let bufIndex = 1, dataIndex = position + 1; bufIndex < buffer.length && dataIndex < this._data.length; bufIndex++ , dataIndex++) {
                if (this._data[dataIndex] === buffer[bufIndex]) {
                    length++;
                } else {
                    break;
                }
            }
        }
        return { position, length };
    }

    get isFull(): boolean {
        const isFull = this._fullfilment === StackBuffer.size;
        return isFull;
    }

    checkWhitespace(buffer: Buffer): number {
        let count = 0;
        buffer.every((e, c) => { count = c; return e === 0x20; });
        return count;
    }

    checkSequence(buffer: Buffer): SequenceInspection {
        return { sourceBytes: 0, sequenceBytes: 0 };
    }
}