import { Header } from '../domain/header';
import { PboChecksumWriter } from './pboChecksumWriter';
import { PboHeaderWriter } from './pboHeaderWriter';

export interface Buffers {
    header: Buffer;
    body: Buffer;
    raw: ArrayBuffer;
}

export class BufferAllocator {
    private _headerWriter = new PboHeaderWriter();

    allocateBuffers(headerStruct: Header): Buffers {
        const headerSize = this._headerWriter.measureHeader(headerStruct);
        const bodyMaxSize = this._headerWriter.measureBody(headerStruct);

        const raw = new ArrayBuffer(headerSize + bodyMaxSize + PboChecksumWriter.blockSize);
        const header = Buffer.from(raw, 0, headerSize);
        const body = Buffer.from(raw, headerSize, bodyMaxSize);
        return { header, body, raw };
    }
}