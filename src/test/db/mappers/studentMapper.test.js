const { expect } = require('chai');
const sinon = require('sinon');
const { toStudentEntity } = require('../../../main/db/mappers/studentMapper');
const { marshall } = require('@aws-sdk/util-dynamodb');
const UUIDGenerator = require('../../../main/db/UUIDGenerator');

describe('toStudentEntity', () => {
    let uuidStub;

    beforeEach(() => {
        uuidStub = sinon.stub();
        sinon.replace(UUIDGenerator, 'generateUUID', uuidStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should map student object to DynamoDB entity', () => {
        // Given
        const studentData = {
            firstName: 'John',
            lastName: 'Doe',
            userName: 'johndoe123',
            password: 'securepassword',
            email: 'john.doe@example.com',
            age: 20,
            addressLine1: '123 Main St',
            addressCity: 'Anytown',
            addressState: 'Anystate',
            pinCode: '123456',
            profilePicUrl: 'http://example.com/profile.jpg',
            gender: 'Male',
            parent1Name: 'Jane Doe',
            parent1Phone: '123-456-7890',
            parent1Email: 'jane.doe@example.com',
            parent2Name: 'John Doe Sr.',
            parent2Phone: '098-765-4321',
            parent2Email: 'john.doe.sr@example.com'
        };
        // When
        const result = toStudentEntity(studentData);

        // Then
        const expected = {
            TableName: 'Students',
            Item: marshall({id: 'mocked-uuid',...studentData,}, { removeUndefinedValues: true })
        };

        expect(result.TableName).to.equal(expected.TableName);
        expect(result.Item).to.not.be.undefined;
    });

    it('should generate a unique ID for the assignment', () => {
        // Given
        const student= {
            firstName: 'John',
            lastName: 'Doe',
            userName: 'johndoe123',
            password: 'securepassword',
            email: 'john.doe@example.com',
            addressState: 'Anystate',
            parent1Name: 'Jane Doe',
            parent1Phone: '123-456-7890',
            parent1Email: 'jane.doe@example.com',
        };

        // When
        const result = toStudentEntity(student);

        // Then
        expect(result.Item.id).to.not.be.undefined;
    });
});