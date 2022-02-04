import FormData from 'form-data';
import handleFormData from './index';
import {Writable} from 'stream';

const createDevNull = () =>
  new (class extends Writable {
    size = 0;
    _write(chunk, encoding, callback) {
      this.size += chunk.length;
      callback(null, chunk);
    }
  })();

describe('handleFormData', () => {
  test('single valid file', async () => {
    const fileLength = 2;
    const writeStream = createDevNull();

    const formData = new FormData();
    formData.append('file0', Buffer.from('0'.repeat(fileLength)));

    const files = await handleFormData({
      createWriteStream: () => writeStream,
      formData,
      headers: formData.getHeaders() as any,
    });
    expect(files.length).toBe(1);
    expect(writeStream.size).toBe(2);
  });
  test('valid files', () => {});
  test('invalid file', (resolve) => {
    const fileLength = 2;
    const writeStream = createDevNull();

    const formData = new FormData();
    formData.append('file0', Buffer.from('0'.repeat(fileLength)));

    handleFormData({
      createWriteStream: () => writeStream,
      formData,
      headers: formData.getHeaders() as any,
      limits: {
        maxFileSize: 1,
      },
      onFileLimit: () => {
        resolve();
      },
    });
  });
  // describe('handleFormData', () => {
  //   // test('single fit file', async (done) => {
  //   //   const fileLength = 2;
  //   //
  //   //   const form = new FormData();
  //   //   form.append('file0', Buffer.from('0'.repeat(fileLength)));
  //   //
  //   //   const abort = jest.fn();
  //   //
  //   //   await handleFormData({
  //   //     headers: form.getHeaders(),
  //   //     // formData: form,
  //   //     // onField: () => {},
  //   //     // createWriteStream: () => {
  //   //     //   const writeStream = createDevNull();
  //   //     //   writeStream.abort = abort;
  //   //     //   writeStream.id = 0;
  //   //     //   return writeStream;
  //   //     // },
  //   //     // limits: {
  //   //     //   fileSize: 2
  //   //     // },
  //   //     // onSuccess: (ids) => {
  //   //     //   expect(ids.length).toBe(1);
  //   //     //   expect(ids[0]).toBe(0);
  //   //     //   expect(abort.mock.calls.length).toBe(0);
  //   //     //   done();
  //   //     // },
  //   //   });
  //   // });
  //   // test('single unfit file', async (done) => {
  //   //   const fileLength = 2
  //   //
  //   //   const form = new FormData()
  //   //   form.append('file0', Buffer.from('0'.repeat(fileLength)))
  //   //
  //   //   const abort = jest.fn()
  //   //
  //   //   await handleFormData({
  //   //     headers: form.getHeaders(),
  //   //     formData: form,
  //   //     onField: () => {},
  //   //     createWriteStream: () => {
  //   //       const writeStream = createDevNull()
  //   //       writeStream.abort = abort
  //   //       writeStream.id = 0
  //   //       return writeStream
  //   //     },
  //   //     maxSingleSize: fileLength - 1,
  //   //     maxAllSize: Infinity,
  //   //     onError(errorCode) {
  //   //       expect(errorCode).toBe(413)
  //   //       expect(abort.mock.calls.length).toBe(1)
  //   //       done()
  //   //     }
  //   //   })
  //   // })
  //   //
  //   // test('many fit files', async (done) => {
  //   //   const fileLength = 2
  //   //
  //   //   const form = new FormData()
  //   //   form.append('file0', Buffer.from('0'.repeat(fileLength)))
  //   //   form.append('file1', Buffer.from('0'.repeat(fileLength)))
  //   //
  //   //   const abort = jest.fn()
  //   //   let id = 0
  //   //
  //   //   await handleFormData({
  //   //     headers: form.getHeaders(),
  //   //     formData: form,
  //   //     onField: () => {},
  //   //     createWriteStream: () => {
  //   //       const writeStream = createDevNull()
  //   //       writeStream.abort = abort
  //   //       writeStream.id = id++
  //   //       return writeStream
  //   //     },
  //   //     maxSingleSize: Infinity,
  //   //     maxAllSize: fileLength * 2,
  //   //     onSuccess: (ids) => {
  //   //       expect(ids.length).toBe(2)
  //   //       expect(ids[0]).toBe(0)
  //   //       expect(ids[1]).toBe(1)
  //   //       expect(abort.mock.calls.length).toBe(0)
  //   //       done()
  //   //     }
  //   //   })
  //   // })
  //   //
  //   // test('many unfit files', async (done) => {
  //   //   const fileLength = 2
  //   //
  //   //   const form = new FormData()
  //   //   form.append('file0', Buffer.from('0'.repeat(fileLength)))
  //   //   form.append('file1', Buffer.from('0'.repeat(fileLength)))
  //   //
  //   //   const abort = jest.fn()
  //   //
  //   //   await handleFormData({
  //   //     headers: form.getHeaders(),
  //   //     formData: form,
  //   //     onField: () => {},
  //   //     createWriteStream: () => {
  //   //       const writeStream = createDevNull()
  //   //       writeStream.abort = abort
  //   //       writeStream.id = 0
  //   //       return writeStream
  //   //     },
  //   //     maxSingleSize: Infinity,
  //   //     maxAllSize: fileLength * 2 - 1,
  //   //     onError(errorCode) {
  //   //       expect(errorCode).toBe(413)
  //   //       expect(abort.mock.calls.length).toBe(2)
  //   //       done()
  //   //     }
  //   //   })
  //   // })
  // });
});
