const { expect } = require('chai');
const sinon = require('sinon');
const {getTeacherIfPasswordMatches} = require('../../main/services/loginService');
const {getStudentIfPasswordMatches} = require('../../main/services/loginService');
const {generateAccessToken} = require('../../main/services/loginService');
const {generateRefreshToken} = require('../../main/services/loginService');
const {buildTeacherRefreshTokenPayload} = require('../../main/services/loginService');
const {buildStudentRefreshTokenPayload} = require('../../main/services/loginService');
const {buildTeacherPayload} = require('../../main/services/loginService');
const {buildStudentPayload} = require('../../main/services/loginService');
const {validateToken} = require('../../main/services/loginService');
const {generateNewTokenFromRefreshToken} = require('../../main/services/loginService');
const db = require('../../main/db/dynamodb');
const jwt = require('jsonwebtoken');
const { ScanCommand } = require('@aws-sdk/client-dynamodb');
const UserType = require('../../main/common/UserType'); 


const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');


describe('getTeacherIfPasswordMatches', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the teacher when found', async () => {
        // given
        const userName = 'teacher-username';
        const password = 'teacher-password';
        const teacherItem = { userName, password, id: 'teacher-id' };
        const marshalledItem = marshall(teacherItem);

        dbStub.resolves({ Items: [marshalledItem] });
        // when
        const result = await getTeacherIfPasswordMatches(userName, password);

        // then
        expect(result).to.deep.equal(teacherItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should return empty when the teacher is not found', async () => {
        // Given
        const userName = 'teacher-username';
        const password = 'teacher-password';

        dbStub.resolves({ Items: [] });

        // When
        const result = await getTeacherIfPasswordMatches(userName, password);

        // Then
        expect(result).to.be.null;
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        // Given
        const userName = 'teacher-username';
        const password = 'teacher-password';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getTeacherIfPasswordMatches(userName, password);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
    });
});
describe('getStudentIfPasswordMatches', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the student when found', async () => {
        // given
        const userName = 'student-username';
        const password = 'student-password';
        const studentItem = { userName, password, id: 'student-id' };
        const marshalledItem = marshall(studentItem);

        dbStub.resolves({ Items: [marshalledItem] });
        // when
        const result = await getStudentIfPasswordMatches(userName, password);

        // then
        expect(result).to.deep.equal(studentItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should return null when the student is not found', async () => {
        // Given
        const userName = 'student-username';
        const password = 'student-password';

        dbStub.resolves({ Items: [] });

        // When
        const result = await getStudentIfPasswordMatches(userName, password);

        // Then
        expect(result).to.be.null;
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        // Given
        const userName = 'student-username';
        const password = 'student-password';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getStudentIfPasswordMatches(userName, password);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
    });
});
describe('generateAccessToken', () => {
    
    it('should generate an access token',  () => {
        // given
        const payload = { id: 'user-id', userType: 'user-type' };
        // when
        const result =  generateAccessToken(payload);
        // then
        expect(result).to.be.a('string');
    });
});
describe('generateRefreshToken', () => {
    it('should generate a refresh token', () => {
        // given
        const payload = { id: 'user-id', userType: 'user-type' };
        // when
        const result = generateRefreshToken(payload);
        // then
        expect(result).to.be.a('string');
    });
});


describe('buildTeacherRefreshTokenPayload', () => {
    it('should build the teacher refresh token payload', () => {
        // given
        const teacherId = 'teacher-id';
        // when
        const result = buildTeacherRefreshTokenPayload(teacherId);

        // then
        expect(result).to.deep.equal({
            id: 'teacher-id',
            userType: UserType.TEACHER
        });
    });
});

describe('buildStudentRefreshTokenPayload', () => {
    it('should build the student refresh token payload', () => {
        // given
        const studentId = 'student-id';

        // when
        const result = buildStudentRefreshTokenPayload(studentId);

        // then
        expect(result).to.deep.equal({
            id: 'student-id',
            userType: UserType.STUDENT
        });
    });
});
describe('buildTeacherPayload', () => {
    it('should build the teacher payload', () => {
        // given
        const teacher = {  
            userName: 'teacher-username',
            email: 'teacher-email',
            firstName: 'teacher-firstName',
            lastName: 'teacher-lastName',
            phoneNumber: 'teacher-phoneNumber',
            profilePicUrl: 'teacherURL',
            age: 30,
            gender: 'male'
        };
        const teacherId = 'teacher-id';

        // when
        const result = buildTeacherPayload(teacher, teacherId);

        // then
        expect(result).to.deep.equal({  
            id: teacherId,
            userName: 'teacher-username',
            email: 'teacher-email',
            firstName: 'teacher-firstName',
            lastName: 'teacher-lastName',
            phoneNumber: 'teacher-phoneNumber',
            profilePicUrl: 'teacherURL',
            age: 30,
            gender: 'male',
            userType: 'TEACHER',  
            tokenType: 'ACCESS'  
        });
    });
});

describe('buildStudentPayload', () => {
    it('should build the student payload', () => {
        // given
        const student = {  
            userName: 'student-username',
            parent1Email: 'parent1-email',
            parent2Email: 'parent2-email',
            parent1Phone: 'parent1-phone',
            parent2Phone: 'parent2-phone',
            parent1Name: 'parent1-name',
            parent2Name: 'parent2-name',
            firstName: 'student-firstName',
            lastName: 'student-lastName',
            phoneNumber: 'student-phoneNumber',
            profilePicUrl: 'studentURL',
            age: 10,
            gender:'male',
            batches:'student-batches',
        };
            const studentId = 'student-id';
            // when
            const result = buildStudentPayload(student, studentId);
            // then
            expect(result).to.deep.equal({  
                id: studentId,
                userName: 'student-username',
                parent1Email: 'parent1-email',
                parent2Email: 'parent2-email',
                parent1Phone: 'parent1-phone',
                parent2Phone: 'parent2-phone',
                parent1Name: 'parent1-name',
                parent2Name: 'parent2-name',
                firstName: 'student-firstName',
                lastName: 'student-lastName',
                phoneNumber: 'student-phoneNumber',
                profilePicUrl: 'studentURL',
                age: 10,
                gender:'male',
                batches:'student-batches',
                userType: 'STUDENT',  
                tokenType: 'ACCESS'  
            });
        });
    });
describe('validateToken', () => {
    let jwtStub;

    beforeEach(() => {
        jwtStub = sinon.stub(jwt, 'verify');
    });

    afterEach(() => {
        jwtStub.restore();
    });

    it('should validate the token', () => {
        // given
        const token = 'token';
        const expectedPayload = { id: 'user-id', userType: 'user-type' };

        jwtStub.returns(expectedPayload);

        // when
        const result = validateToken(token);

        // then
        expect(result).to.deep.equal(expectedPayload);
        expect(jwtStub.calledOnce).to.be.true;
        expect(jwtStub.calledWith(token)).to.be.true;
    });

    it('should throw an error for invalid token', () => {
        // given
        const token = 'invalid-token';
        const errorMessage = 'Invalid token';

        jwtStub.throws(new Error(errorMessage));

        try {
            validateToken(token);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
    });
});

describe('generateNewTokenFromRefreshToken', () => {
    it('should generate a new token from the refresh token', () => {
        // given
        const refreshToken = 'refresh-token';
        const payload = { id: 'user-id', userType: 'user-type' };
        const res = {};
        // when
        const result = generateNewTokenFromRefreshToken(payload, res, refreshToken);
        // then
        expect(result).to.be.a('string');
    });
});