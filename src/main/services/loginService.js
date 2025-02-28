const db = require('../db/dynamodb');
const jwt = require('jsonwebtoken');
const {ScanCommand} = require('@aws-sdk/client-dynamodb');
const {marshall, unmarshall} = require('@aws-sdk/util-dynamodb');
const {buildSuccessResponse} = require("../routes/responseUtils");

async function getTeacherIfPasswordMatches(userName, password) {

    let scanParams = {
        TableName: "Teachers", FilterExpression: "userName = :userName", ExpressionAttributeValues: marshall({
            ":userName": userName
        })
    };
    const result = await db.send(new ScanCommand(scanParams));
    const teacher = result.Items.length > 0 ? unmarshall(result.Items[0]) : null;

    if (null == teacher) {
        console.log("Teacher does not exist")
        return null;
    }

    if (teacher.password === password) {
        return teacher;
    } else {
        console.log("incorrect password")
    }
    return null;
}

async function getStudentIfPasswordMatches(userName, password) {

    let scanParams = {
        TableName: "Students", FilterExpression: "userName = :userName", ExpressionAttributeValues: marshall({
            ":userName": userName
        })
    };
    const result = await db.send(new ScanCommand(scanParams));
    const student = result.Items.length > 0 ? unmarshall(result.Items[0]) : null;

    if (null == student) {
        console.log("Student does not exist")
        return null;
    }

    if (student.password === password) {
        return student;
    } else {
        console.log("incorrect password")
    }
    return null;
}


function buildTeacherPayload(teacher,id) {
    return {
        id : id,
        userName: teacher.userName,
        email: teacher.email,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        phoneNumber: teacher.phoneNumber,
        profilePicUrl: teacher.profilePicUrl,
        gender: teacher.gender,
        age: teacher.age,
    };
}

function buildStudentPayload(student,id) {
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
        age: student.age
    };
}

async function generateToken(payload) {

    const jwtPublicKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf-8');
    console.log('jwtPublicKey:', jwtPublicKey);
    const token = jwt.sign(payload, jwtPublicKey, {algorithm: 'RS256'});

    console.log(token)
    return token;
}


async function validateToken(token, res) {
    const jwtPublicKey = Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString('utf-8');
    try {
        let decoded = await jwt.verify(token, jwtPublicKey);
        console.log('decoded {}', decoded);
        return true;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}

module.exports = {
    getTeacherIfPasswordMatches,
    getStudentIfPasswordMatches,
    generateToken,
    buildTeacherPayload,
    buildStudentPayload,
    validateToken
}