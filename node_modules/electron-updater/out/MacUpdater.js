"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MacUpdater = void 0;

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

function _http() {
  const data = require("http");

  _http = function () {
    return data;
  };

  return data;
}

function _AppUpdater() {
  const data = require("./AppUpdater");

  _AppUpdater = function () {
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

class MacUpdater extends _AppUpdater().AppUpdater {
  constructor(options) {
    super(options);
    this.nativeUpdater = require("electron").autoUpdater;
    this.nativeUpdater.on("error", it => {
      this._logger.warn(it);

      this.emit("error", it);
    });
  }

  doDownloadUpdate(downloadUpdateOptions) {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const files = (yield _this.provider).resolveFiles(downloadUpdateOptions.updateInfo);
      const zipFileInfo = (0, _Provider().findFile)(files, "zip", ["pkg", "dmg"]);

      if (zipFileInfo == null) {
        throw (0, _builderUtilRuntime().newError)(`ZIP file not provided: ${(0, _builderUtilRuntime().safeStringifyJson)(files)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
      }

      const server = (0, _http().createServer)();
      server.on("close", () => {
        _this._logger.info(`Proxy server for native Squirrel.Mac is closed (was started to download ${zipFileInfo.url.href})`);
      });

      function getServerUrl() {
        const address = server.address();
        return `http://${address.address}:${address.port}`;
      }

      return yield _this.executeDownload({
        fileExtension: "zip",
        fileInfo: zipFileInfo,
        downloadUpdateOptions,
        task: (destinationFile, downloadOptions) => {
          return _this.httpExecutor.download(zipFileInfo.url.href, destinationFile, downloadOptions);
        },
        done: (() => {
          var _ref = (0, _bluebirdLst().coroutine)(function* (updateFile) {
            let updateFileSize = zipFileInfo.info.size;

            if (updateFileSize == null) {
              updateFileSize = (yield (0, _fsExtraP().stat)(updateFile)).size;
            }

            return yield new Promise((resolve, reject) => {
              server.on("request", (request, response) => {
                const requestUrl = request.url;

                _this._logger.info(`${requestUrl} requested`);

                if (requestUrl === "/") {
                  const data = Buffer.from(`{ "url": "${getServerUrl()}/app.zip" }`);
                  response.writeHead(200, {
                    "Content-Type": "application/json",
                    "Content-Length": data.length
                  });
                  response.end(data);
                } else if (requestUrl.startsWith("/app.zip")) {
                  let errorOccurred = false;
                  response.on("finish", () => {
                    try {
                      setImmediate(() => server.close());
                    } finally {
                      if (!errorOccurred) {
                        _this.nativeUpdater.removeListener("error", reject);

                        resolve([]);
                      }
                    }
                  });

                  _this._logger.info(`app.zip requested by Squirrel.Mac, pipe ${updateFile}`);

                  const readStream = (0, _fsExtraP().createReadStream)(updateFile);
                  readStream.on("error", error => {
                    try {
                      response.end();
                    } catch (e) {
                      errorOccurred = true;

                      _this.nativeUpdater.removeListener("error", reject);

                      reject(new Error(`Cannot pipe "${updateFile}": ${error}`));
                    }
                  });
                  response.writeHead(200, {
                    "Content-Type": "application/zip",
                    "Content-Length": updateFileSize
                  });
                  readStream.pipe(response);
                } else {
                  _this._logger.warn(`${requestUrl} requested, but not supported`);

                  response.writeHead(404);
                  response.end();
                }
              });
              server.listen(0, "127.0.0.1", 8, () => {
                _this.nativeUpdater.setFeedURL(`${getServerUrl()}`, {
                  "Cache-Control": "no-cache"
                });

                _this.nativeUpdater.once("error", reject);

                _this.nativeUpdater.checkForUpdates();
              });
            });
          });

          return function done(_x) {
            return _ref.apply(this, arguments);
          };
        })()
      });
    })();
  }

  doProxyUpdateFile(nativeResponse, url, headers, sha512, cancellationToken, errorHandler) {
    const downloadRequest = this.httpExecutor.doRequest((0, _builderUtilRuntime().configureRequestOptionsFromUrl)(url, {
      headers
    }), downloadResponse => {
      const nativeHeaders = {
        "Content-Type": "application/zip"
      };
      const streams = [];
      const downloadListenerCount = this.listenerCount(_main().DOWNLOAD_PROGRESS);

      this._logger.info(`${_main().DOWNLOAD_PROGRESS} listener count: ${downloadListenerCount}`);

      nativeResponse.writeHead(200, nativeHeaders); // for mac only sha512 is produced (sha256 is published for windows only to preserve backward compatibility)

      if (sha512 != null) {
        // "hex" to easy migrate to new base64 encoded hash (we already produces latest-mac.yml with hex encoded hash)
        streams.push(new (_builderUtilRuntime().DigestTransform)(sha512, "sha512", sha512.length === 128 && !sha512.includes("+") && !sha512.includes("Z") && !sha512.includes("=") ? "hex" : "base64"));
      }

      streams.push(nativeResponse);
      let lastStream = downloadResponse;

      for (const stream of streams) {
        stream.on("error", errorHandler);
        lastStream = lastStream.pipe(stream);
      }
    });
    downloadRequest.on("redirect", (statusCode, method, redirectUrl) => {
      if (headers.authorization != null && headers.authorization.startsWith("token")) {
        const parsedNewUrl = new URL(redirectUrl);

        if (parsedNewUrl.hostname.endsWith(".amazonaws.com")) {
          delete headers.authorization;
        }
      }

      this.doProxyUpdateFile(nativeResponse, redirectUrl, headers, sha512, cancellationToken, errorHandler);
    });
    downloadRequest.on("error", errorHandler);
    downloadRequest.end();
  }

  quitAndInstall() {
    this.nativeUpdater.quitAndInstall();
  }

} exports.MacUpdater = MacUpdater;
//# sourceMappingURL=MacUpdater.js.map