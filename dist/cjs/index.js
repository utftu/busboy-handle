var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  busboyHandle: () => handle_form_data_default,
  default: () => src_default
});

// src/handle-form-data.ts
var import_busboy = require("@fastify/busboy");

// src/utils.ts
function skipStream(stream) {
  return new Promise((resolve) => {
    stream.on("end", resolve);
    stream.on("data", () => {
      stream.resume();
    });
  });
}
function createPromise(callback) {
  let promiseResolve = null;
  let promiseReject = null;
  const promise = new Promise((resolve, reject) => {
    promiseResolve = resolve;
    promiseReject = reject;
    callback(resolve, reject);
  });
  promise.resolve = promiseResolve;
  promise.reject = promiseReject;
  return promise;
}
var noop = () => {
};

// src/count-stream-size.ts
var import_stream = require("stream");
function countStreamSize({ maxSize, onLimit }) {
  let size = 0;
  return () => {
    return new class CountStreamSize extends import_stream.Transform {
      _transform(chunk, encoding, callback) {
        if (!chunk)
          return;
        size += chunk.length;
        if (size > maxSize) {
          onLimit();
        }
        callback(null, chunk);
      }
    }();
  };
}
var count_stream_size_default = countStreamSize;

// src/handle-form-data.ts
async function handleFormData({
  createWriteStream,
  formData,
  headers,
  onField = noop,
  onFile = noop,
  onSuccess = noop,
  onError = noop,
  limit,
  onFileLimit = noop,
  onLimit = noop
}) {
  return new Promise((resolve) => {
    const files = [];
    const busboy = new import_busboy.Busboy({
      headers
    });
    function cancel(ent) {
      onError({ ent, files, busboy });
    }
    busboy.on("field", onField);
    busboy.on("file", function(fieldName, file, fileName, encoding, mimetype) {
      const fileProps = {
        fieldName,
        file,
        fileName,
        encoding,
        mimetype
      };
      const continueFileParse = onFile?.({ ...fileProps, skipStream }) || true;
      if (!continueFileParse) {
        return;
      }
      const fileWriteStream = createWriteStream(fileProps);
      const ent = {
        meta: { ...fileProps },
        writeStream: fileWriteStream,
        readStream: file,
        promise: null
      };
      file.on("limit", () => {
        onFileLimit({ ent, files, busboy });
      });
      file.on("error", () => cancel(ent));
      ent.promise = createPromise((resolve2) => {
        file.pipe(fileWriteStream);
        fileWriteStream.on("finish", () => {
          resolve2(ent);
        });
        fileWriteStream.on("error", () => {
          cancel(ent);
        });
      });
      files.push(ent);
    });
    busboy.on("finish", async () => {
      await Promise.all(files.map(({ promise }) => promise));
      onSuccess({ files, busboy });
      resolve(files);
    });
    if (limit.maxSize) {
      formData.pipe(count_stream_size_default({
        maxSize: limit.maxSize,
        onLimit: () => onLimit({ files, busboy })
      })()).pipe(busboy);
    } else {
      formData.pipe(busboy);
    }
  });
}
var handle_form_data_default = handleFormData;

// src/index.ts
var src_default = handle_form_data_default;
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  busboyHandle
});
