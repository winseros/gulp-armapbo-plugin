import {IPboHeaderEntry} from '../domain/pboHeaderEntry';
import {IPboHeaderExtension} from '../domain/pboHeaderExtension';

export class PboWriter {
	writeHeaderEntry(buffer:Buffer, entry:IPboHeaderEntry, offset:number):number {
		offset = this.writeNullTerminatedString(buffer, entry.name, offset);
		offset = buffer.writeInt32LE(entry.packingMethod, offset);
		offset = buffer.writeInt32LE(entry.originalSize, offset);
		offset = buffer.writeInt32LE(entry.reserved, offset);
		offset = buffer.writeInt32LE(entry.timestamp, offset);
		offset = buffer.writeInt32LE(entry.dataSize, offset);
		return offset;
	}

	writeHeaderExtension(buffer:Buffer, extension:IPboHeaderExtension, offset:number):number {
		offset = this.writeNullTerminatedString(buffer, extension.name, offset);
		offset = this.writeNullTerminatedString(buffer, extension.value, offset);
		return offset;
	}

	private writeNullTerminatedString(buffer:Buffer, str:string, offset:number):number {
		let written = buffer.write(str, offset, str.length);
		offset = buffer.writeInt8(0, offset + written);
		return offset;
	}
}