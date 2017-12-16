import { IMinimatch, Minimatch } from 'minimatch';

export class PatternMatcher {
    static create(patterns: string[]) {
        const matchers = patterns.map(p => new Minimatch(p));
        return new PatternMatcher(matchers);
    }

    private readonly _matchers: IMinimatch[];

    constructor(matchers: IMinimatch[]) {
        this._matchers = matchers;
    }

    match(fileName: string): boolean {
        let result = false;
        this._matchers.forEach(m => {
            if (result === m.negate) {
                const match = m.match(fileName);
                if (match && !m.negate) { result = true; }
                if (!match && m.negate) { result = false; }
            }
        });
        return result;
    }
}