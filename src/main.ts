import { PboTransformStream } from './core/pboTransformStream2';
import { StreamOptions } from './core/streamOptions';

export = (options?: StreamOptions): PboTransformStream => {
    return new PboTransformStream(options);
};