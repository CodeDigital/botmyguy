"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NsisUpdater = void 0;

function _bluebirdLst() {
  const data = require("bluebird-lst");

  _bluebirdLst = function () {
    return data;
  };

  return data;
}

function _builderUtilRuntime() {
  const data = require("builder-util-runtime");

  _builderUtilRuntime = function () {
    return data;
  };

  return data;
}

function _child_process() {
  const data = require("child_process");

  _child_process = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

require("source-map-support/register");

function _BaseUpdater() {
  const data = require("./BaseUpdater");

  _BaseUpdater = function () {
    return data;
  };

  return data;
}

function _FileWithEmbeddedBlockMapDifferentialDownloader() {
  const data = require("./differentialDownloader/FileWithEmbeddedBlockMapDifferentialDownloader");

  _FileWithEmbeddedBlockMapDifferentialDownloader = function () {
    return data;
  };

  return data;
}

function _GenericDifferentialDownloader() {
  const data = require("./differentialDownloader/GenericDifferentialDownloader");

  _GenericDifferentialDownloader = function () {
    return data;
  };

  return data;
}

function _main() {
  const data = require("./main");

  _main = function () {
    return data;
  };

  return data;
}

function _Provider() {
  const data = require("./providers/Provider");

  _Provider = function () {
    return data;
  };

  return data;
}

function _fsExtraP() {
  const data = require("fs-extra-p");

  _fsExtraP = function () {
    return data;
  };

  return data;
}

function _windowsExecutableCodeSignatureVerifier() {
  const data = require("./windowsExecutableCodeSignatureVerifier");

  _windowsExecutableCodeSignatureVerifier = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class NsisUpdater extends _BaseUpdater().BaseUpdater {
  constructor(options, app) {
    super(options, app);
  }
  /*** @private */


  doDownloadUpdate(downloadUpdateOptions) {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const provider = yield _this.provider;
      const fileInfo = (0, _Provider().findFile)(provider.resolveFiles(downloadUpdateOptions.updateInfo), "exe");
      return yield _this.executeDownload({
        fileExtension: "exe",
        downloadUpdateOptions,
        fileInfo,
        task: (() => {
          var _ref = (0, _bluebirdLst().coroutine)(function* (destinationFile, downloadOptions, packageFile, removeTempDirIfAny) {
            const packageInfo = fileInfo.packageInfo;
            const isWebInstaller = packageInfo != null && packageFile != null;

            if (isWebInstaller || (yield _this.differentialDownloadInstaller(fileInfo, downloadUpdateOptions, destinationFile, downloadUpdateOptions.requestHeaders, provider))) {
              yield _this.httpExecutor.download(fileInfo.url.href, destinationFile, downloadOptions);
            }

            const signatureVerificationStatus = yield _this.verifySignature(destinationFile);

            if (signatureVerificationStatus != null) {
              yield removeTempDirIfAny(); // noinspection ThrowInsideFinallyBlockJS

              throw (0, _builderUtilRuntime().newError)(`New version ${downloadUpdateOptions.updateInfo.version} is not signed by the application owner: ${signatureVerificationStatus}`, "ERR_UPDATER_INVALID_SIGNATURE");
            }

            if (isWebInstaller) {
              if (yield _this.differentialDownloadWebPackage(packageInfo, packageFile, provider)) {
                try {
                  yield _this.httpExecutor.download(packageInfo.path, packageFile, {
                    skipDirCreation: true,
                    headers: downloadUpdateOptions.requestHeaders,
                    cancellationToken: downloadUpdateOptions.cancellationToken,
                    sha512: packageInfo.sha512
                  });
                } catch (e) {
                  try {
                    yield (0, _fsExtraP().unlink)(packageFile);
                  } catch (ignored) {// ignore
                  }

                  throw e;
                }
              }
            }
          });

          return function task(_x, _x2, _x3, _x4) {
            return _ref.apply(this, arguments);
          };
        })()
      });
    })();
  } // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
  // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
  // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }


  verifySignature(tempUpdateFile) {
    var _this2 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      let publisherName;

      try {
        publisherName = (yield _this2.configOnDisk.value).publisherName;

        if (publisherName == null) {
          return null;
        }
      } catch (e) {
        if (e.code === "ENOENT") {
          // no app-update.yml
          return null;
        }

        throw e;
      }

      return yield (0, _windowsExecutableCodeSignatureVerifier().verifySignature)(Array.isArray(publisherName) ? publisherName : [publisherName], tempUpdateFile, _this2._logger);
    })();
  }

  doInstall(installerPath, isSilent, isForceRunAfter) {
    const args = ["--updated"];

    if (isSilent) {
      args.push("/S");
    }

    if (isForceRunAfter) {
      args.push("--force-run");
    }

    const packagePath = this.downloadedUpdateHelper.packageFile;

    if (packagePath != null) {
      // only = form is supported
      args.push(`--package-file="${packagePath}"`);
    }

    const spawnOptions = {
      detached: true,
      stdio: "ignore"
    };

    try {
      (0, _child_process().spawn)(installerPath, args, spawnOptions).unref();
    } catch (e) {
      // yes, such errors dispatched not as error event
      // https://github.com/electron-userland/electron-builder/issues/1129
      if (e.code === "UNKNOWN" || e.code === "EACCES") {
        // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
        this._logger.info("Access denied or UNKNOWN error code on spawn, will be executed again using elevate");

        try {
          (0, _child_process().spawn)(path.join(process.resourcesPath, "elevate.exe"), [installerPath].concat(args), spawnOptions).unref();
        } catch (e) {
          this.dispatchError(e);
        }
      } else {
        this.dispatchError(e);
      }
    }

    return true;
  } // private downloadBlockMap(provider: Provider<any>) {
  //   await provider.getBytes(newBlockMapUrl, cancellationToken)
  // }


  differentialDownloadInstaller(fileInfo, downloadUpdateOptions, installerPath, requestHeaders, provider) {
    var _this3 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      try {
        const newBlockMapUrl = (0, _main().newUrlFromBase)(`${fileInfo.url.pathname}.blockmap`, fileInfo.url);
        const oldBlockMapUrl = (0, _main().newUrlFromBase)(`${fileInfo.url.pathname.replace(new RegExp(downloadUpdateOptions.updateInfo.version, "g"), _this3.currentVersion.version)}.blockmap`, fileInfo.url);

        _this3._logger.info(`Download block maps (old: "${oldBlockMapUrl.href}", new: ${newBlockMapUrl.href})`);

        const downloadBlockMap = (() => {
          var _ref2 = (0, _bluebirdLst().coroutine)(function* (url) {
            const requestOptions = (0, _Provider().configureRequestOptionsFromUrl)(url, {
              headers: downloadUpdateOptions.requestHeaders
            });
            requestOptions.gzip = true;
            const data = yield _this3.httpExecutor.request(requestOptions, downloadUpdateOptions.cancellationToken);

            if (data == null) {
              throw new Error(`Blockmap "${url.href}" is empty`);
            }

            try {
              return JSON.parse(data);
            } catch (e) {
              throw new Error(`Cannot parse blockmap "${url.href}", error: ${e}, raw data: ${data}`);
            }
          });

          return function downloadBlockMap(_x5) {
            return _ref2.apply(this, arguments);
          };
        })();

        const blockMapData = yield downloadBlockMap(newBlockMapUrl);
        const oldBlockMapData = yield downloadBlockMap(oldBlockMapUrl);
        yield new (_GenericDifferentialDownloader().GenericDifferentialDownloader)(fileInfo.info, _this3.httpExecutor, {
          newUrl: fileInfo.url.href,
          oldFile: path.join(_this3.app.getPath("userData"), _builderUtilRuntime().CURRENT_APP_INSTALLER_FILE_NAME),
          logger: _this3._logger,
          newFile: installerPath,
          useMultipleRangeRequest: provider.useMultipleRangeRequest,
          requestHeaders
        }).download(oldBlockMapData, blockMapData);
      } catch (e) {
        _this3._logger.error(`Cannot download differentially, fallback to full download: ${e.stack || e}`);

        return true;
      }

      return false;
    })();
  }

  differentialDownloadWebPackage(packageInfo, packagePath, provider) {
    var _this4 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      if (packageInfo.blockMapSize == null) {
        return true;
      }

      try {
        yield new (_FileWithEmbeddedBlockMapDifferentialDownloader().FileWithEmbeddedBlockMapDifferentialDownloader)(packageInfo, _this4.httpExecutor, {
          newUrl: packageInfo.path,
          oldFile: path.join(_this4.app.getPath("userData"), _builderUtilRuntime().CURRENT_APP_PACKAGE_FILE_NAME),
          logger: _this4._logger,
          newFile: packagePath,
          requestHeaders: _this4.requestHeaders,
          useMultipleRangeRequest: provider.useMultipleRangeRequest
        }).download();
      } catch (e) {
        _this4._logger.error(`Cannot download differentially, fallback to full download: ${e.stack || e}`); // during test (developer machine mac or linux) we must throw error


        return process.platform === "win32";
      }

      return false;
    })();
  }

} exports.NsisUpdater = NsisUpdater;
//# sourceMappingURL=NsisUpdater.js.map