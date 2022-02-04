import {Busboy, BusboyHeaders, BusboyFileStream} from '@fastify/busboy';
import {createPromise, skipStream, noop, ControlledPromise} from './utils';
import countStreamSize from './count-stream-size';
import {Readable, Writable} from 'stream';

type FileEnt = {
  writeStream: Writable;
  promise: ControlledPromise<FileEnt>;
  readStream: Readable;
  meta: FileProps;
};

type Props = {
  createWriteStream: (fileProps: FileProps) => Writable;
  headers: BusboyHeaders;
  formData: Readable;
  onField?: (fieldName: string, value: any) => any;
  onFile?: (fileProps: FileProps & {skipStream: any}) => boolean;
  onSuccess?: (props: {files: FileEnt[]; busboy: Busboy}) => any;
  onError?: (props: {
    ent: FileEnt;
    files: FileEnt[];
    busboy: Busboy;
    defaultDestroy: () => void;
  }) => any;
  limits?: {
    maxFileSize?: number;
    maxSize?: number;
  };
  onFileLimit?: (props: {
    ent: FileEnt;
    files: FileEnt[];
    busboy: Busboy;
    defaultDestroy: () => void;
  }) => any;
  onLimit?: (props: {
    files: FileEnt[];
    busboy: Busboy;
    defaultDestroy: () => void;
  }) => any;
};

type FileProps = {
  fieldName: string;
  file: BusboyFileStream;
  fileName: string;
  encoding: string;
  mimetype: string;
};

async function handleFormData({
  createWriteStream,
  formData,
  headers,
  onField = noop,
  onFile = noop,
  onSuccess = noop,
  onError = noop,
  limits = {},
  onFileLimit = noop,
  onLimit = noop,
}: Props) {
  return new Promise<FileEnt[]>((resolve, reject) => {
    const files: FileEnt[] = [];

    const busboy = new Busboy({
      headers,
      limits: {
        fileSize: limits.maxFileSize,
      },
    });
    function defaultDestroy() {
      files.forEach((ent) => {
        ent.readStream.destroy();
        ent.writeStream.destroy();
        ent.promise.reject();
      });
      busboy.destroy();
      reject({files, busboy});
    }

    function cancel(ent) {
      onError({ent, files, busboy, defaultDestroy});
    }

    busboy.on('field', onField);

    busboy.on('file', function (fieldName, file, fileName, encoding, mimetype) {
      const fileProps: FileProps = {
        fieldName,
        file,
        fileName,
        encoding,
        mimetype,
      };

      const continueFileParse = onFile({...fileProps, skipStream}) || true;
      if (!continueFileParse) {
        return;
      }

      const fileWriteStream = createWriteStream(fileProps);

      const ent: FileEnt = {
        meta: {...fileProps},
        writeStream: fileWriteStream,
        readStream: file,
        promise: null,
      };

      file.on('limit', () => {
        onFileLimit({ent, files, busboy, defaultDestroy});
      });
      file.on('error', () => cancel(ent));
      ent.promise = createPromise<typeof ent>((resolve) => {
        file.pipe(fileWriteStream);
        fileWriteStream.on('finish', () => {
          resolve(ent);
        });
        fileWriteStream.on('error', () => {
          cancel(ent);
        });
      });
      files.push(ent);
    });

    busboy.on('finish', async () => {
      await Promise.all(files.map(({promise}) => promise));
      onSuccess({files, busboy});
      resolve(files);
    });

    if (limits.maxSize) {
      formData
        .pipe(
          countStreamSize({
            maxSize: limits.maxSize,
            onLimit: () => onLimit({files, busboy, defaultDestroy}),
          })()
        )
        .pipe(busboy);
    } else {
      formData.pipe(busboy);
    }
  });
}

export default handleFormData;
