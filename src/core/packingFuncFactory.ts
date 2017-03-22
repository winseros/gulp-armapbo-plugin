import * as File from 'vinyl';
import { StreamOptions } from './streamOptions';
import { PatternMatcher } from './patternMatcher';
import { PackingMethod } from '../domain/packingMethod';

export interface PackingFunc {
    (f: File): PackingMethod;
}

export class PackingFuncFactory {
    static getPackingFunc(options: StreamOptions): PackingFunc {
        const compress = options.compress;
        switch (true) {
            case (typeof compress === 'string'): {
                return getMatchByPatterns([compress as string]);
            }
            case (Array.isArray(compress)): {
                const patterns = (compress as string[]).filter(s => !!(typeof s === 'string' && s.trim()));
                if (patterns.length) {
                    return getMatchByPatterns(patterns);
                } else {
                    return uncompressed;
                }
            }
            default: {
                return uncompressed;
            }
        }
    }
}

function uncompressed() { return PackingMethod.uncompressed; }

function getMatchByPatterns(patterns: string[]): PackingFunc {
    const matcher = PatternMatcher.create(patterns);
    return (file: File): PackingMethod => {
        let result = PackingMethod.uncompressed;
        const contents = file.contents as Buffer;
        if (contents.length > 0) {
            const match = matcher.match(file.relative);
            if (match) { result = PackingMethod.packed; }
        }
        return result;
    };
}