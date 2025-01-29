const { create } = require('../services/studentService');
const db = require('../db/dynamodb');
const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
jest.mock('../db/dynamodb', () => ({
    send: jest.fn(),
}));
jest.mock('../db/mappers/studentMapper', () => ({
    toStudentEntity: jest.fn((student) => ({
        TableName: "Students",
        Item: { id: { S: "test-id" }, ...student },
    })),
}));

describe('create function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully create a student and return the student ID', async () => {
        db.send.mockResolvedValueOnce({});

        const mockStudent = {
            firstName: "John",
            lastName: "Doe",
            age: 20,
            addressLine1: "123 Main St",
            pinCode: 123456,
            gender: "male",
            parent1Name: "Jane Doe",
            parent1Phone: "1234567890",
            parent2Phone: "0987654321",
        };

        const result = await create(mockStudent);

        expect(db.send).toHaveBeenCalledTimes(1);
        expect(db.send).toHaveBeenCalledWith(expect.any(PutItemCommand));
        expect(result).toBe("test-id");
    });

    it('should throw an error if db operation fails', async () => {
        db.send.mockRejectedValueOnce(new Error('Database error'));

        const mockStudent = {
            firstName: "John",
            lastName: "Doe",
            age: 20,
            addressLine1: "123 Main St",
            pinCode: 123456,
            gender: "male",
            parent1Name: "Jane Doe",
            parent1Phone: "1234567890",
            parent2Phone: "0987654321",
        };

        await expect(create(mockStudent)).rejects.toThrow('Database error');

        expect(db.send).toHaveBeenCalledTimes(1);
        expect(db.send).toHaveBeenCalledWith(expect.any(PutItemCommand));
    });
});
