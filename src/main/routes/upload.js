const express = require('express');
const multer = require('multer');
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const {NodeHttpHandler} = require('@aws-sdk/node-http-handler');
const authMiddleware = require("../middleware/authMiddleware");
const {generateUUID} = require('../db/UUIDGenerator');
const {UserType} = require('../common/types');  // Assuming you have types for user type
const router = express.Router();
router.use(express.json());
router.use(authMiddleware);

const s3Config = {
    region: process.env.region,
    credentials: {
        accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey,
    },
    requestHandler: new NodeHttpHandler({
        connectionTimeout: 60000, // 5 minutes
        socketTimeout: 60000, // 5 minutes
    }),
};

const s3Client = new S3Client(s3Config);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // limit file size to 10MB
    },
});

const getFileLocation = (userType, userId, uploadType, uploadId, fileName) => {
    let fileLocation = '';

    if (userType === UserType.TEACHER) {
        if (uploadType === 'notes') {
            fileLocation = `teachers/${userId}/notes/${uploadId}/${fileName}`;
        } else if (uploadType === 'assignments') {
            fileLocation = `teachers/${userId}/assignments/${uploadId}/${fileName}`;
        } else {
            throw new Error('Invalid upload type for teacher');
        }
    } else if (userType === UserType.STUDENT) {
        if (uploadType === 'notes') {
            fileLocation = `students/${userId}/notes/${uploadId}/${fileName}`;
        } else if (uploadType === 'assignments') {
            fileLocation = `students/${userId}/assignments/${uploadId}/${fileName}`;
        } else {
            throw new Error('Invalid upload type for student');
        }
    } else {
        throw new Error('Invalid user type');
    }

    return fileLocation;
};
router.post('/', upload.single('file'), async (req, res) => {
    let uploadId = generateUUID();
    const {userType, userId, uploadType} = req.body;

    if (!userType || !userId || !uploadType || !req.file) {
        return res.status(400).send('Missing required fields: userType, userId, uploadType, or file');
    }
    try {
        const fileLocation = getFileLocation(userType, userId, uploadType, uploadId, req.file.originalname);


        const params = {
            Bucket: process.env.S3BucketName,
            Key: fileLocation,
            Body: req.file.buffer,
        };


        console.log('Uploading file with params:', params);
        let response = await s3Client.send(new PutObjectCommand(params));
        console.log('File uploaded successfully:', response);

        const fileUrl = `https://${params.Bucket}.s3.${process.env.region}.amazonaws.com/${encodeURIComponent(params.Key)}`;

        res.send({url: fileUrl});
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error uploading file to S3');

    }
});

module.exports = router;
