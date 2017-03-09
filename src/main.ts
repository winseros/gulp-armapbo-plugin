import { PboTransformStream } from './core/pboTransformStream';
import { StreamOptions } from './core/streamOptions';

export = (options?: StreamOptions): PboTransformStream => {
    return new PboTransformStream(options);
};