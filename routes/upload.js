const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const router = express.Router();
router.use(express.json());

// Configure AWS SDK
// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION
// });

// const s3 = new AWS.S3();

// Configure multer storage to use S3
// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: process.env.S3_BUCKET_NAME,
//         acl: 'public-read',
//         metadata: function (req, file, cb) {
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: function (req, file, cb) {
//             cb(null, Date.now().toString() + path.extname(file.originalname));
//         }
//     })
// });

// Upload route actual
// router.post('/upload', upload.single('file'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).send('No file uploaded.');
//     }
//     const fileUri = req.file.location;
//     res.json({ uri: fileUri });
// });

// Upload route dummy
router.post('/', (req, res) => {
    console.log('file uploaded');
    res.json({ uri: 'https://example-bucket.s3.us-west-2.amazonaws.com/sample-file.png' });
});

module.exports = router;