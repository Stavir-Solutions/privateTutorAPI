const express = require('express');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const router = express.Router();
router.use(express.json());

const s3Config = {
    region: process.env.region,
    credentials: {
        accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey,
    },
};

const s3Client = new S3Client(s3Config);
const dynamoClient = new DynamoDBClient(s3Config);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // limit file size to 10MB
    },
});

router.post('/', upload.single('file'), async (req, res) => {
    const params = {
        Bucket: process.env.s3BucketName,
        Key: req.file.originalname,
        Body: req.file.buffer,
    };

    try {
        const upload = new Upload({
            client: s3Client,
            params: params,
        });

        await upload.done();

        // Example DynamoDB usage
        const dynamoParams = {
            TableName: 'YourDynamoDBTable',
            Item: {
                id: { S: 'unique-id' },
                filename: { S: req.file.originalname },
                uploadDate: { S: new Date().toISOString() },
            },
        };

        await dynamoClient.send(new PutItemCommand(dynamoParams));

        res.send('File uploaded and DynamoDB record created successfully');
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error uploading file or creating DynamoDB record');
    }
});

module.exports = router;