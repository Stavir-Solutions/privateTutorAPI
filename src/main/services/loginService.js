const db = require('../db/dynamodb');
const jwt = require('jsonwebtoken');
const {
    ScanCommand,
    PutItemCommand,
    GetItemCommand,
    UpdateItemCommand,
    DeleteItemCommand
} = require('@aws-sdk/client-dynamodb');
const {marshall, unmarshall} = require('@aws-sdk/util-dynamodb');
const {TokenType, UserType} = require("../common/types");
const {getTeacherById} = require("./teacherService");
const {buildErrorMessage, buildSuccessResponse} = require("../routes/responseUtils");
const {getStudentById} = require("./studentService");
const {ACCESS_TOKEN_VALIDITY_SECONDS} = require('../common/config');
const {REFRESH_TOKEN_VALIDITY_SECONDS} = require('../common/config');
const {sendEmail} = require('../utils/emailUtils'); // Implement this
const {generateUUID} = require('../db/UUIDGenerator');
const crypto = require('crypto');

const TEACHER_TABLE = 'Teachers';
const STUDENT_TABLE = 'Students';
const RESET_REQUEST_TABLE = 'PasswordResetRequests';

const  RESET_BASE_URL= process.env.RESET_BASE_URL;

async function getTeacherIfPasswordMatches(userName, password) {
    let scanParams = {
        TableName: "Teachers",
        FilterExpression: "userName = :userName AND password = :passWord",
        ExpressionAttributeValues: marshall({
            ":userName": userName, ":passWord": password
        })
    };
    const result = await db.send(new ScanCommand(scanParams));
    const teacher = result.Items.length > 0 ? unmarshall(result.Items[0]) : null;

    if (null == teacher) {
        console.log("Incorrect userName or password")
        return null;
    } else {
        return teacher;
    }

}

async function getStudentIfPasswordMatches(userName, password) {

    let scanParams = {
        TableName: "Students",
        FilterExpression: "userName = :userName AND password = :passWord",
        ExpressionAttributeValues: marshall({
            ":userName": userName, ":passWord": password
        })
    };
    const result = await db.send(new ScanCommand(scanParams));
    const student = result.Items.length > 0 ? unmarshall(result.Items[0]) : null;

    if (null == student) {
        console.log("Incorrect userName or password")
        return null;
    } else {
        return student;
    }

}


function buildTeacherPayload(teacher, id) {
    return {
        id: id,
        userName: teacher.userName,
        email: teacher.email,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        phoneNumber: teacher.phoneNumber,
        profilePicUrl: teacher.profilePicUrl,
        gender: teacher.gender,
        age: teacher.age,
        userType: UserType.TEACHER,
        tokenType: TokenType.ACCESS
    };
}

function buildStudentPayload(student, id) {
    return {
        id: id,
        userName: student.userName,
        parent1Email: student.parent1Email,
        parent2Email: student.parent2Email,
        parent1Phone: student.parent1Phone,
        parent2Phone: student.parent2Phone,
        parent1Name: student.parent1Name,
        parent2Name: student.parent2Name,
        firstName: student.firstName,
        lastName: student.lastName,
        phoneNumber: student.phoneNumber,
        profilePicUrl: student.profilePicUrl,
        gender: student.gender,
        batches: student.batches,
        age: student.age,
        userType: UserType.STUDENT,
        tokenType: TokenType.ACCESS
    };
}

function buildTeacherRefreshTokenPayload(id) {
    return {
        id: id, userType: UserType.TEACHER
    };
}

function buildStudentRefreshTokenPayload(id) {
    return {
        id: id, userType: UserType.STUDENT
    };
}

async function generateAccessToken(payload) {

    const jwtPublicKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf-8');
    console.log('jwtPublicKey:', jwtPublicKey);
    const token = jwt.sign(payload, jwtPublicKey, {algorithm: 'RS256', expiresIn: ACCESS_TOKEN_VALIDITY_SECONDS});

    console.log(token)
    return token;
}

async function generateRefreshToken(payload) {

    const jwtPublicKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf-8');
    console.log('jwtPublicKey:', jwtPublicKey);
    const token = jwt.sign(payload, jwtPublicKey, {algorithm: 'RS256', expiresIn: REFRESH_TOKEN_VALIDITY_SECONDS});

    console.log(token)
    return token;
}


async function decodeToken(token, jwtPublicKey) {
    return jwt.verify(token, jwtPublicKey);
}

async function validateToken(token) {
    const jwtPublicKey = Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString('utf-8');
    try {
        let decoded = await decodeToken(token, jwtPublicKey);
        console.log('decoded {}', decoded);
        return decoded;
    } catch (error) {
        console.error('Token validation error:', error);
        return null;
    }
}

async function generateTokenForTeacherFromRefreshToken(payload, res, refreshToken) {
    console.log("refresh refreshToken for teacher ", payload.id)
    const teacher = await getTeacherById(payload.id);
    if (null == teacher) {
        return buildErrorMessage(res, 401, 'Invalid refreshToken, teach does not exist', payload.id);
    }
    buildSuccessResponse(res, 200, {
        token: await generateAccessToken(buildTeacherPayload(teacher, teacher.id)), refreshToken: refreshToken
    });
}

async function generateTokenForStudentFromRefreshToken(payload, res, refreshToken) {
    const student = await getStudentById(payload.id);
    if (null == student) {
        return buildErrorMessage(res, 401, 'Invalid refreshToken, login again');
    }
    buildSuccessResponse(res, 200, {
        token: await generateAccessToken(buildStudentPayload(student, student.id)), refreshToken: refreshToken
    });
}

async function generateNewTokenFromRefreshToken(payload, res, refreshToken) {
    if (payload.userType === UserType.TEACHER) {
        return await generateTokenForTeacherFromRefreshToken(payload, res, refreshToken);
    } else if (payload.userType === UserType.STUDENT) {
        return await generateTokenForStudentFromRefreshToken(payload, res, refreshToken);
    } else {
        return buildErrorMessage(res, 401, 'Invalid refreshToken, login again');
    }
}

async function getUserFromTable(userName, userType) {

    if (userType === 'TEACHER') {
        const teacherParams = {
            TableName: TEACHER_TABLE,
            FilterExpression: 'userName = :userName',
            ExpressionAttributeValues: {
                ':userName': {S: userName},
            },
        };

        const result = await db.send(new ScanCommand(teacherParams));
        if (result.Items && result.Items.length > 0) {
            user = unmarshall(result.Items[0]);
        } else {
            throw new Error(`TEACHER not found for userName: ${userName}`);
        }
    } else if (userType === 'STUDENT') {
        const studentParams = {
            TableName: STUDENT_TABLE,
            FilterExpression: 'userName = :userName',
            ExpressionAttributeValues: {
                ':userName': {S: userName},
            },
        };

        const result = await db.send(new ScanCommand(studentParams));
        if (result.Items && result.Items.length > 0) {
            user = unmarshall(result.Items[0]);
        } else {
            throw new Error(`STUDENT not found for userName: ${userName}`);
        }
    } else {
        throw new Error(`Invalid userType: ${userType}`);
    }

    return user;
}

async function resetPasswordRequest(userName, userType) {
    try {
        const user = await getUserFromTable(userName, userType);

        if (!user.email) {
            throw new Error('User email not found');
        }

        const requestId = generateUUID();
        ;

        const insertParams = {
            TableName: RESET_REQUEST_TABLE,
            Item: marshall({
                userName,
                userType,
                'request-id': requestId,
                status: 'pending',
            }),
        };

        await db.send(new PutItemCommand(insertParams));

        const resetLink = `${RESET_BASE_URL}/login/reset-password/${requestId}`;
        const emailSubject = 'Password Reset Request';
        const emailBody = `Click here to reset your password: ${resetLink}`;

        await sendEmail(user.email, emailSubject, emailBody);

        return {message: 'Password reset link sent to email', resetLink};
    } catch (err) {
        console.error('Error in resetPasswordRequest:', err.message);
        throw err;
    }
}

async function resetPasswordWithRequestId(requestId) {
    const getParams = {
        TableName: RESET_REQUEST_TABLE,
        Key: marshall({'request-id': requestId})
    };

    const data = await db.send(new GetItemCommand(getParams));
    if (!data.Item) {
        throw new Error('Invalid or expired request-id');
    }

    const resetRequest = unmarshall(data.Item);
    const {userName, userType} = resetRequest;

    const user = await getUserFromTable(userName, userType);

    const newPassword = generateRandomPassword(8);

    let tableName;

    if (userType === 'TEACHER') {
        tableName = TEACHER_TABLE;
    } else if (userType === 'STUDENT') {
        tableName = STUDENT_TABLE;
    } else {
        throw new Error('Invalid userType');
    }
    const getUserIdParams = {
        TableName: tableName,
        FilterExpression: "#userName = :userName",
        ExpressionAttributeNames: {
            "#userName": "userName"
        },
        ExpressionAttributeValues: {
            ":userName": {S: user.userName}
        }
    };

    const result = await db.send(new ScanCommand(getUserIdParams));

    if (!result.Items || result.Items.length === 0) {
        throw new Error("User not found");
    }

    const userId = result.Items[0].id.S;
    console.log("Fetched User ID:", userId);

    const updateParams = {
        TableName: tableName,
        Key: {id: {S: userId}},
        UpdateExpression: "SET password = :newPassword",
        ExpressionAttributeValues: {
            ":newPassword": {S: newPassword}
        }
    };


    await db.send(new UpdateItemCommand(updateParams));
    console.log("Password updated successfully");

    await sendEmail(user.email, 'Your new password', `Your new password is: ${newPassword}`);


    const deleteParams = {
        TableName: RESET_REQUEST_TABLE,
        Key: marshall({'request-id': requestId})
    };
    console.log(`New password for user ${userId}: ${newPassword}`);

    await db.send(new DeleteItemCommand(deleteParams));

    return {message: 'Password reset successful. New password sent to user email.'};
}

function generateRandomPassword(length = 8) {
    return crypto.randomBytes(length)
        .toString('base64')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, length);
}

module.exports = {
    getTeacherIfPasswordMatches,
    getStudentIfPasswordMatches,
    generateAccessToken,
    generateRefreshToken,
    buildTeacherRefreshTokenPayload,
    buildStudentRefreshTokenPayload,
    buildTeacherPayload,
    buildStudentPayload,
    validateToken,
    generateNewTokenFromRefreshToken,
    decodeToken,
    generateTokenForStudentFromRefreshToken,
    generateTokenForTeacherFromRefreshToken,
    resetPasswordRequest,
    resetPasswordWithRequestId
}
