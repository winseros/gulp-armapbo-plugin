import { expect } from 'chai';
import { Header } from '../header';
import { HeaderExtension } from '../headerExtension';
import { HeaderEntry } from '../headerEntry';
import { PackingMethod } from '../packingMethod';
import * as sinon from 'sinon';

describe('domain/header', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('ctor', () => {
        it('should initialize fields', () => {

            const signature = { prop: 'signature' } as any;
            sandbox.stub(HeaderEntry, 'getSignatureEntry').returns(signature);
            const boundary = { prop: 'boundary' } as any;
            sandbox.stub(HeaderEntry, 'getBoundaryEntry').returns(boundary);

            const extensions = [new HeaderExtension('h_ext_n', 'h_ext_v')];
            const entries = [new HeaderEntry('', PackingMethod.uncompressed, 0, 0)];

            const header = new Header(extensions, entries);

            expect(header.extensions).to.equal(extensions);
            expect(header.entries).to.equal(entries);
            expect(header.signature).to.equal(signature);
            expect(header.boundary).to.equal(boundary);
            expect(header.packed).to.equal(false);
        });

        it('should initialize packed to true', () => {
            const entries = [
                new HeaderEntry('', PackingMethod.uncompressed, 0, 0),
                new HeaderEntry('', PackingMethod.uncompressed, 0, 0),
                new HeaderEntry('', PackingMethod.packed, 0, 0),
                new HeaderEntry('', PackingMethod.uncompressed, 0, 0)
            ];

            const header = new Header([], entries);
            expect(header.packed).to.equal(true);
        });
    });
});