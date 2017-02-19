import { Header } from '../domain/header';
import { PboChecksumWriter } from './pboChecksumWriter';

export interface Buffers {
    header: Buffer;
    body: Buffer;

    raw: ArrayBuffer;
}

export class BufferAllocator {

    allocateBuffers(headerStruct: Header): Buffers {
        const headerSize = this._calculateHeaderSize(headerStruct);
        const bodyMaxSize = this._calculateBodyMaxSize(headerStruct);

        const raw = new ArrayBuffer(headerSize + bodyMaxSize + PboChecksumWriter.blockSize);
        const header = Buffer.from(raw, 0, headerSize);
        const body = Buffer.from(raw, headerSize, bodyMaxSize);
        return { header, body, raw };
    }

    _calculateBodyMaxSize(header: Header): number {
        const size = header.entries.reduce((s, e) => s + e.contents.length, 0);
        return size;
    }

    _calculateHeaderSize(header: Header): number {
        let size = header.signature.getSize();
        size = header.extensions.reduce((s, e) => s + e.getSize(), size);
        size += 1;//terminating null after the last extension
        size += header.entries.reduce((s, e) => s + e.getSize(), size);
        size += header.boundary.getSize();
        return size;
    }
}