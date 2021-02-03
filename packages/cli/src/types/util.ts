export type WebpackConfigOptions = { watch?: boolean; build?: boolean; hmr?: boolean };
export type Asset = string | AssetEntry;
export interface AssetEntry {
    glob?: string;
    include?: string;
    flat?: boolean;
    exclude?: string;
    outDir?: string;
    resolve?: (dest: string) => string;
    watchAssets?: boolean;
}

export interface ActionOnFile {
    action: 'change' | 'unlink';
    item: AssetEntry;
    path: string;
    watchAssetsMode: boolean;
}
