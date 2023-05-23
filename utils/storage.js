const multer = require('multer')

const memory = multer.memoryStorage()

module.exports = multer({ storage: memory })