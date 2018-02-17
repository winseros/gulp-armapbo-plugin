import { PboTransformStream } from './core/pboTransformStream';
import { StreamOptions } from './core/streamOptions';
import { Transform } from 'stream';

const pack = (options?: StreamOptions): Transform => {
    return new PboTransformStream(options);
};

export {pack, StreamOptions};