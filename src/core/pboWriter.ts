import { PboHeaderEntry } from '../domain/pboHeaderEntry';
import { PboHeaderExtension } from '../domain/pboHeaderExtension';

export class PboWriter {
    writeHeaderEntry(buffer: Buffer, entry: PboHeaderEntry, offset: number): number {
        offset = this._writeNullTerminatedString(buffer, entry.name, offset);
        offset = buffer.writeInt32LE(entry.packingMethod, offset);
        offset = buffer.writeInt32LE(entry.originalSize, offset);
        offset = buffer.writeInt32LE(entry.reserved, offset);
        offset = buffer.writeInt32LE(entry.timestamp, offset);
        offset = buffer.writeInt32LE(entry.dataSize, offset);
        return offset;
    }

    writeHeaderExtension(buffer: Buffer, extension: PboHeaderExtension, offset: number): number {
        offset = this._writeNullTerminatedString(buffer, extension.name, offset);
        offset = this._writeNullTerminatedString(buffer, extension.value, offset);
        return offset;
    }

    _writeNullTerminatedString(buffer: Buffer, str: string, offset: number): number {
        const written = buffer.write(str, offset, str.length);
        offset = buffer.writeInt8(0, offset + written);
        return offset;
    }
}