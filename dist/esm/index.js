// src/handle-form-data.ts
import { Busboy } from "@fastify/busboy";

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
import { Transform } from "stream";
function countStreamSize({ maxSize, onLimit }) {
  let size = 0;
  return () => {
    return new class CountStreamSize extends Transform {
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
    const busboy = new Busboy({
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
export {
  handle_form_data_default as busboyHandle,
  src_default as default
};
