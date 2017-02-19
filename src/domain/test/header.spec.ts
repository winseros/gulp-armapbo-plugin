import { expect } from 'chai';
import { Header } from '../header';
import { HeaderEntry } from '../headerEntry';
import * as sinon from 'sinon';

describe('domain/header', () => {
    describe('ctor', () => {
        it('should initialize fields', () => {

            const signature = { prop: 'signature' } as any;
            sinon.stub(HeaderEntry, 'getSignatureEntry').returns(signature);
            const boundary = { prop: 'boundary' } as any;
            sinon.stub(HeaderEntry, 'getBoundaryEntry').returns(boundary);

            const extensions = { prop: 'extensions' } as any;
            const entries = { prop: 'entries' } as any;

            const header = new Header(extensions, entries);

            expect(header.extensions).to.equal(extensions);
            expect(header.entries).to.equal(entries);
            expect(header.signature).to.equal(signature);
            expect(header.boundary).to.equal(boundary);
        });
    });
});