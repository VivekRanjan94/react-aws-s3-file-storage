require('dotenv').config()
var express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const app = express()

const PORT = 5000

app.use(fileUpload())
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)

var AWS = require('aws-sdk')

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

const s3 = new AWS.S3()

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/upload', async (req, res) => {
  // Restricting file formats
  const formats = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  if (!formats.includes(req.files.file.mimeType)) {
    return res
      .status(415)
      .send({ Success: false, message: 'File type not supported' })
  }

  // Restricting file size
  const size = 10240000
  if (req.files.file.size > size) {
    return res.status(406).send({ Success: false, message: 'File too large' })
  }

  // Binary data base64
  const fileContent = Buffer.from(req.files.file.data, 'binary')

  // Setting up S3 upload parameters
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: req.files.file.name, // File name you want to save as in S3
    Body: fileContent,
  }

  // Uploading files to the bucket
  s3.upload(params, function (err, data) {
    if (err) {
      throw err
    }
    res.send({
      response_code: 200,
      response_message: 'Success',
      response_data: data,
    })
  })
})

app.get('/files', (req, res) => {
  s3.getSignedUrl(
    'getObject',
    {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: req.query.filename,
    },
    (err, url) => {
      if (err) {
        return res.status(400).send({ success: false, err: err })
      } else {
        console.log(url)
        return res.send(url)
      }
    }
  )
})

app.get('/all-files', (req, res) => {
  s3.listObjects(
    { Bucket: process.env.AWS_S3_BUCKET_NAME },
    function (err, data) {
      if (err) {
        console.log('Error', err)
      } else {
        // console.log('Success', data.Contents)
        res.json(data.Contents)
      }
    }
  )
})

app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`)
})
