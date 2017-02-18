export interface IHeaderExtension {
    name: string;
    value: string;
}

export interface StreamOptions {
    fileName?: string;
    extensions?: IHeaderExtension[];
}