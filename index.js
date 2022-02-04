import Busboy from '@fastify/busboy'
import FormData from 'form-data'
import fs from 'fs'

const formData = new FormData()
const busboy = Busboy({
  headers: formData.getHeaders(),
  // limits: {
    // files: 1,
    // fileSize: 1,
    // headerPairs: 1
  // }
})
formData.append('index.js', fs.createReadStream('./test'))


busboy.on('file', (name, file) => {
  console.log('file')
  file.destroy()
  // file.on('limit', () => {
  //   console.log('limit1')
  // })
  file.pipe(fs.createWriteStream('./test1'))
})
// busboy.on('limit', () => {
//   console.log('limit')
// })
busboy.on('finish', () => {
  console.log('finish')
})
// busboy.on('close', () => {
//   console.log('close')
// })

formData.pipe(busboy)

function a(stream) {
  return new Promise((resolve) => {
    stream.on('end', resolve)
    stream.on('data', stream.resume())
  })
}



