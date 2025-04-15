const db = require('../db/dynamodb');
const jwt = require('jsonwebtoken');
const {ScanCommand} = require('@aws-sdk/client-dynamodb');
const {marshall, unmarshall} = require('@aws-sdk/util-dynamodb');
const {TokenType, UserType} = require("../common/types");
const {getTeacherById} = require("./teacherService");
const {buildErrorMessage, buildSuccessResponse} = require("../routes/responseUtils");
const {getStudentById} = require("./studentService");
const {ACCESS_TOKEN_VALIDITY_SECONDS} = require('../common/config');
const {REFRESH_TOKEN_VALIDITY_SECONDS} = require('../common/config');

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
        console.log("Incorrect username or password")
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
        console.log("Incorrect username or password")
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
    generateTokenForTeacherFromRefreshToken
}
