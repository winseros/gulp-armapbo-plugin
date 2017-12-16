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
        if (this._fullfilment + length > StackBuffer.size) {//shift the buffer contents left until there is enough space for the new bunch of bytes
            const takeExisting = StackBuffer.size - length;
            this._data.copyWithin(0, this._fullfilment - takeExisting, this._fullfilment);
            buffer.copy(this._data, takeExisting, offset, offset + length);
            this._fullfilment = StackBuffer.size;
        } else {//add some bytes onto the free space of the buffer
            this._fullfilment += buffer.copy(this._data, this._fullfilment, offset, offset + length);
        }
    }

    intersect(buffer: Buffer, length: number): BufferIntersection {
        if (length && this._fullfilment) {
            let intersection: BufferIntersection | undefined;
            let offset = 0;
            while (true) {
                const next = this._intersectBufferAtOffset(buffer, length, offset);
                if (!intersection || intersection.length < next.length) {
                    intersection = next;
                }
                if (next.position >= 0 && next.position <= this._fullfilment - 1) {
                    offset = next.position + 1;
                } else {
                    break;
                }
            }
            return intersection;
        } else {
            return {position: -1, length: 0};
        }
    }

    get fullfilment(): number {
        return this._fullfilment;
    }

    _intersectBufferAtOffset(buffer: Buffer, bLength: number, offset: number): BufferIntersection {
        let position = this._data.indexOf(buffer[0], offset);
        let length = 0;
        if (position >= 0 && position < this._fullfilment) {
            length++;
            for (let bufIndex = 1, dataIndex = position + 1; bufIndex < bLength && dataIndex < this.fullfilment; bufIndex++ , dataIndex++) {
                if (this._data[dataIndex] === buffer[bufIndex]) {
                    length++;
                } else {
                    break;
                }
            }
        } else {
            position = -1;
        }
        return {position, length};
    }

    checkWhitespace(buffer: Buffer, length: number): number {
        let count = 0;
        for (let i = 0; i < length; i++) {
            if (buffer[i] === 0x20) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    checkSequence(buffer: Buffer, length: number): SequenceInspection {
        let result = {sourceBytes: 0, sequenceBytes: 0};
        const maxSourceBytes = Math.max(this._fullfilment, length);
        for (let i = 1; i < maxSourceBytes; i++) {
            const sequence = this._checkSequence(buffer, length, i);
            if (sequence.sourceBytes > result.sourceBytes) {
                result = sequence;
            }
        }
        return result;
    }

    _checkSequence(buffer: Buffer, length: number, sequenceBytes: number): SequenceInspection {
        const result = {sequenceBytes, sourceBytes: 0};
        while (result.sourceBytes < length) {
            for (let i = this._fullfilment - sequenceBytes; i < this._fullfilment && result.sourceBytes < length; i++) {
                if (buffer[result.sourceBytes] === this._data[i]) {
                    result.sourceBytes++;
                } else {
                    return result;
                }
            }
        }
        return result;
    }
}