const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler');
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

router.post('/', upload.single('file'), async (req, res) => {
    let uploadId = generateUUID();  // Generates a unique upload ID for each upload
    const { userType, userId, uploadType } = req.body;

    // Validate required fields
    if (!userType || !userId || !uploadType || !req.file) {
        return res.status(400).send('Missing required fields: userType, userId, uploadType, or file');
    }

    // Default file location, separate for teacher and student
    let fileLocation = '';

    // For teacher or student, and based on upload type (notes or assignments)
    if (userType === UserType.TEACHER) {
        if (uploadType === 'notes') {
            fileLocation = `teachers/${userId}/notes/${uploadId}/${req.file.originalname}`;
        } else if (uploadType === 'assignments') {
            fileLocation = `teachers/${userId}/assignments/${uploadId}/${req.file.originalname}`;
        } else {
            // Handle other upload types if necessary
            return res.status(400).send('Invalid upload type for teacher');
        }
    } else if (userType === UserType.STUDENT) {
        if (uploadType === 'notes') {
            fileLocation = `students/${userId}/notes/${uploadId}/${req.file.originalname}`;
        } else if (uploadType === 'assignments') {
            fileLocation = `students/${userId}/assignments/${uploadId}/${req.file.originalname}`;
        } else {
            // Handle other upload types if necessary
            return res.status(400).send('Invalid upload type for student');
        }
    } else {
        // Handle case for invalid userType
        return res.status(400).send('Invalid user type');
    }

    const params = {
        Bucket: process.env.S3BucketName,
        Key: fileLocation,
        Body: req.file.buffer,
    };

    try {
        console.log('Uploading file with params:', params);
        let response = await s3Client.send(new PutObjectCommand(params));
        console.log('File uploaded successfully:', response);

        // Construct the URL of the uploaded file
        const fileUrl = `https://${params.Bucket}.s3.${process.env.region}.amazonaws.com/${encodeURIComponent(params.Key)}`;

        // Respond with the file URL
        res.send({ url: fileUrl });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error uploading file to S3');
    }
});

module.exports = router;
