const {generateUUID} = require('../UUIDGenerator');
const { marshall } = require('@aws-sdk/util-dynamodb');

function toStudentEntity(student) {
    return {
        TableName: 'Students', Item: marshall({
            id: generateUUID(), // Generate a unique ID for the student
            firstName: student.firstName,
            lastName: student.lastName,
            age: student.age,
            addressLine1: student.addressLine1,
            addressCity: student.addressCity,
            addressState: student.addressState,
            pinCode: student.pinCode,
            profilePicUrl: student.profilePicUrl,
            gender: student.gender,
            parent1Name: student.parent1Name,
            parent1Phone: student.parent1Phone,
            parent1Email: student.parent1Email,
            parent2Name: student.parent2Name,
            parent2Phone: student.parent2Phone,
            parent2Email: student.parent2Email
        })
    };
}

module.exports = { toStudentEntity }

