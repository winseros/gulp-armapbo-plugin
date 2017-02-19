import { Header } from '../domain/header';
import { PboWriter } from './pboWriter';

export class PboHeaderWriter {
    private _writer = new PboWriter();

    writeHeader(buffer: Buffer, header: Header): void {
        let offset = this._writer.writeHeaderEntry(buffer, header.signature, 0);
        offset = header.extensions.reduce((o, e) => this._writer.writeHeaderExtension(buffer, e, o), offset);
        offset = buffer.writeInt8(0, offset);
        offset = header.entries.reduce((o, e) => this._writer.writeHeaderEntry(buffer, e, o), offset);
        this._writer.writeHeaderEntry(buffer, header.boundary, offset);
    }
}