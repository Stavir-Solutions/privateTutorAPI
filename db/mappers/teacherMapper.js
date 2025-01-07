const {generateUUID} = require('../UUIDGenerator');
const { marshall } = require('@aws-sdk/util-dynamodb');

function toTeacherEntity(teacher) {
    return {
        TableName: 'Teachers', Item: marshall({
            id: generateUUID(), // Generate a unique ID for the teacher
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            userName: teacher.userName,
            password: teacher.password,
            age: teacher.age,
            gender: teacher.gender,
            addressLine1: teacher.addressLine1,
            addressCity: teacher.addressCity,
            addressState: teacher.addressState,
            pinCode: teacher.pinCode,
            profilePicUrl: teacher.profilePicUrl,
            email: teacher.email,
            phoneNumber: teacher.phoneNumber,
            upiId: teacher.upiId,
            accountNumber: teacher.accountNumber,
            accountName: teacher.accountName,
            ifscCode: teacher.ifscCode
        })
    };
}

module.exports = { toTeacherEntity }