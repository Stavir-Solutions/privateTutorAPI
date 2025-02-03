const { expect } = require('chai');
const { toTeacherEntity } = require('../../../src/main/db/mappers/teacherMapper');
const { marshall } = require('@aws-sdk/util-dynamodb');
const { generateUUID } = require('../../../src/main/db/UUIDGenerator');

describe('toTeacherEntity', () => {
    it('should map teacher object to DynamoDB entity', () => {
        const teacher = {
            firstName: 'John',
            lastName: 'Doe',
            userName: 'johndoe',
            password: 'password123',
            age: 30,
            gender: 'Male',
            addressLine1: '123 Main St',
            addressCity: 'Anytown',
            addressState: 'Anystate',
            pinCode: '123456',
            profilePicUrl: 'http://example.com/profile.jpg',
            email: 'john.doe@example.com',
            phoneNumber: '1234567890',
            upiId: 'john@upi',
            accountNumber: '123456789',
            accountName: 'John Doe',
            ifscCode: 'IFSC0001234'
        };

        const result = toTeacherEntity(teacher);
        const expected = {
            TableName: 'Teachers',
            Item: marshall({
                id: generateUUID(),
                ...teacher
            })
        };

        expect(result.TableName).to.equal(expected.TableName);
        expect(result.Item).to.deep.include(marshall(teacher));
    });

    it('should generate a unique ID for the teacher', () => {
        const teacher = {
            firstName: 'Jane',
            lastName: 'Doe',
            userName: 'janedoe',
            password: 'password123',
            age: 25,
            gender: 'Female',
            addressLine1: '456 Main St',
            addressCity: 'Anytown',
            addressState: 'Anystate',
            pinCode: '654321',
            profilePicUrl: 'http://example.com/profile.jpg',
            email: 'jane.doe@example.com',
            phoneNumber: '0987654321',
            upiId: 'jane@upi',
            accountNumber: '987654321',
            accountName: 'Jane Doe',
            ifscCode: 'IFSC0004321'
        };

        const result = toTeacherEntity(teacher);
        expect(result.Item).to.have.property('id');
    });
});