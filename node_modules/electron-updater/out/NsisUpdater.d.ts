import { AllPublishOptions } from "builder-util-runtime";
import "source-map-support/register";
import { DownloadUpdateOptions } from "./AppUpdater";
import { BaseUpdater } from "./BaseUpdater";
export declare class NsisUpdater extends BaseUpdater {
    constructor(options?: AllPublishOptions | null, app?: any);
    /*** @private */
    protected doDownloadUpdate(downloadUpdateOptions: DownloadUpdateOptions): Promise<Array<string>>;
    private verifySignature;
    protected doInstall(installerPath: string, isSilent: boolean, isForceRunAfter: boolean): boolean;
    private differentialDownloadInstaller;
    private differentialDownloadWebPackage;
}
