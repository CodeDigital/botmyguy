import { AllPublishOptions } from "builder-util-runtime";
import { AppUpdater, DownloadUpdateOptions } from "./AppUpdater";
export declare class MacUpdater extends AppUpdater {
    private readonly nativeUpdater;
    constructor(options?: AllPublishOptions);
    protected doDownloadUpdate(downloadUpdateOptions: DownloadUpdateOptions): Promise<Array<string>>;
    private doProxyUpdateFile;
    quitAndInstall(): void;
}
