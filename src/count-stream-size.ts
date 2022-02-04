import {Transform} from 'stream';

function countStreamSize({maxSize, onLimit}) {
  let size = 0;
  return () => {
    return new (class CountStreamSize extends Transform {
      _transform(chunk, encoding, callback) {
        if (!chunk) return;

        size += chunk.length;

        if (size > maxSize) {
          onLimit();
        }

        callback(null, chunk);
      }
    })();
  };
}

export default countStreamSize;
