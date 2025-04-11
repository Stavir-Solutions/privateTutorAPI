const express = require('express');
const multer = require('multer');
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const {NodeHttpHandler} = require('@aws-sdk/node-http-handler');
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(express.json());
router.use(authMiddleware);

const s3Config = {
    region: process.env.region, credentials: {
        accessKeyId: process.env.accessKeyId, secretAccessKey: process.env.secretAccessKey,
    }, requestHandler: new NodeHttpHandler({
        connectionTimeout: 60000, // 5 minutes
        socketTimeout: 60000, // 5 minutes
    }),
};

const s3Client = new S3Client(s3Config);

const upload = multer({
    storage: multer.memoryStorage(), limits: {
        fileSize: 10 * 1024 * 1024, // limit file size to 10MB
    },
});

router.post('/', upload.single('file'), async (req, res) => {
    let uploadId = UUIDGenerator.generate();
    const { userType, userId, uploadType } = req.body;
    let fileLocation = userType+'/'+userId+'/'+uploadType+'/'+uploadId+'/'+req.file.originalname;
    const params = {
        Bucket: process.env.S3BucketName, Key: fileLocation, Body: req.file.buffer,
    };

    try {
        console.log('upload ', params)
        let response = await s3Client.send(new PutObjectCommand(params));
        console.log('File uploaded ', response);
        const fileUrl = `https://${params.Bucket}.s3.${process.env.region}.amazonaws.com/${encodeURIComponent(params.Key)}`;
        res.send({'url': fileUrl});
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error uploading file or creating DynamoDB record');
    }
});

module.exports = router;
