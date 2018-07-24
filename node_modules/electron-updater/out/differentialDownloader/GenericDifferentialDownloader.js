"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GenericDifferentialDownloader = void 0;

function _bluebirdLst() {
  const data = require("bluebird-lst");

  _bluebirdLst = function () {
    return data;
  };

  return data;
}

function _DifferentialDownloader() {
  const data = require("./DifferentialDownloader");

  _DifferentialDownloader = function () {
    return data;
  };

  return data;
}

class GenericDifferentialDownloader extends _DifferentialDownloader().DifferentialDownloader {
  download(oldBlockMap, newBlockMap) {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      yield _this.doDownload(oldBlockMap, newBlockMap);
    })();
  }

} exports.GenericDifferentialDownloader = GenericDifferentialDownloader;
//# sourceMappingURL=GenericDifferentialDownloader.js.map