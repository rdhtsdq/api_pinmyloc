const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const { Rekognition } = require("aws-sdk")
require('dotenv').config()

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: process.env.BUCKET_REGION,
});

const rekog = new Rekognition({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const params = (key, body, contentType) => {
  return {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType
  }
}

const command = (params) => new PutObjectCommand(params)

module.exports = { s3, rekog, params, command }