const { expect } = require('chai');
const sinon = require('sinon');
const {getTeacherIfPasswordMatches, generateTokenForTeacherFromRefreshToken, generateTokenForStudentFromRefreshToken} = require('../../main/services/loginService');
const {getStudentIfPasswordMatches} = require('../../main/services/loginService');
const {generateAccessToken} = require('../../main/services/loginService');
const {generateRefreshToken} = require('../../main/services/loginService');
const {buildTeacherRefreshTokenPayload} = require('../../main/services/loginService');
const {buildStudentRefreshTokenPayload} = require('../../main/services/loginService');
const {buildTeacherPayload} = require('../../main/services/loginService');
const {buildStudentPayload} = require('../../main/services/loginService');
const {validateToken} = require('../../main/services/loginService');
const {decodeToken} = require('../../main/services/loginService');
const {generateNewTokenFromRefreshToken} = require('../../main/services/loginService');
const db = require('../../main/db/dynamodb');
const jwt = require('jsonwebtoken');
const { ScanCommand } = require('@aws-sdk/client-dynamodb');
const UserType = require('../../main/common/UserType');
const dotenv = require('dotenv');
const loginService = require('../../main/services/loginService');
const responseUtils = require('../../main/routes/responseUtils');
const {getTeacherById} = require("../../main/services/teacherService");
const {getStudentById} = require("../../main/services/studentService");
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const {teacherService} = require("../../main/services/teacherService");
const {studentService} = require("../../main/services/studentService");
const {buildSuccessResponse,buildErrorMessage} = require("../../main/routes/responseUtils");
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
describe('generateAccessToken', function () {
    let jwtStub;

    beforeEach(() => {
        jwtStub = sinon.stub(jwt, 'sign').returns('mocked.jwt.token');

        process.env.JWT_PRIVATE_KEY = Buffer.from('mock-private-key').toString('base64');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should generate a valid JWT token', async function () {
        const payload = { userName: 'user-name',userType:'usertype' };

        const token = await generateAccessToken(payload);

        expect(jwtStub.calledOnce).to.be.true;
        expect(jwtStub.calledWith(payload, sinon.match.string, { algorithm: 'RS256', expiresIn: sinon.match.number })).to.be.true;
        expect(token).to.equal('mocked.jwt.token');
    });
});
describe('generateRefreshToken', function () {
    let jwtSignStub;

    beforeEach(() => {
        process.env.JWT_PRIVATE_KEY = Buffer.from('mock-private-key').toString('base64');
        jwtSignStub = sinon.stub(jwt, 'sign').returns('mocked.jwt.refresh.token');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should generate a refresh token with username', async function () {
        const payload = {userName: 'user-name',userType:'usertype' };

        const token = await generateRefreshToken(payload);

        expect(jwtSignStub.calledOnce).to.be.true;
        expect(token).to.equal('mocked.jwt.refresh.token');
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
describe('decodeToken', function () {
    let jwtVerifyStub;

    beforeEach(() => {
        jwtVerifyStub = sinon.stub(jwt, 'verify').returns({ userName: 'user-name' });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should decode a valid token', async function () {
        const jwtPublicKey = 'mock-public-key';
        const token = 'mocked.jwt.token';

        const decoded = await decodeToken(token, jwtPublicKey);

        expect(jwtVerifyStub.calledOnce).to.be.true;
        expect(decoded).to.deep.equal({ userName: 'user-name' });
    });
});

describe('validateToken', () => {
    let jwtStub;
    const mockPublicKey = 'mockPublicKey';

    beforeEach(() => {
        process.env.JWT_PUBLIC_KEY = Buffer.from(mockPublicKey).toString('base64');

        jwtStub = sinon.stub(jwt, 'verify');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should validate the token successfully', async () => {
        // given
        const token = 'validToken';
        const expectedPayload = { id: 'user-id', userType: 'user-type' };

        jwtStub.returns(expectedPayload);

        // when
        const result = await validateToken(token);

        // then
        expect(result).to.deep.equal(expectedPayload);
        expect(jwtStub.calledOnce).to.be.true;
        expect(jwtStub.calledWith(token, mockPublicKey)).to.be.true;
    });

    it('should return null if token validation fails', async () => {
        // given
        const token = 'invalidToken';
        jwtStub.throws(new Error('Invalid token'));

        // when
        const result = await validateToken(token);

        // then
        expect(result).to.be.null;
        expect(jwtStub.calledOnce).to.be.true;
        expect(jwtStub.calledWith(token, mockPublicKey)).to.be.true;
    });
});
describe('generateNewTokenFromRefreshToken', function () {
    let res, payload, refreshToken;

    beforeEach(function () {
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        refreshToken = 'dummyRefreshToken';
        sinon.stub(generateTokenForTeacherFromRefreshToken).resolves('newTeacherToken');
        sinon.stub(generateTokenForStudentFromRefreshToken).resolves('newStudentToken');
        sinon.stub(buildErrorMessage);
    });

    afterEach(function () {
        sinon.restore();
    });

    it('should generate a new token for a TEACHER userType', async function () {
        payload = { userType: 'TEACHER' };

        await generateNewTokenFromRefreshToken(payload, res, refreshToken);

        expect(generateTokenForTeacherFromRefreshToken).to.have.been.calledOnce;
        expect(generateTokenForStudentFromRefreshToken).to.not.have.been.called;
        expect(buildErrorMessage).to.not.have.been.called;
    });

    it('should generate a new token for a STUDENT role', async function () {
        payload = { role: 'STUDENT' };

        await generateNewTokenFromRefreshToken(payload, res, refreshToken);

        expect(generateTokenForStudentFromRefreshToken).to.have.been.calledOnce;
        expect(generateTokenForTeacherFromRefreshToken).to.not.have.been.called;
        expect(buildErrorMessage).to.not.have.been.called;
    });

    it('should return an error for an invalid userType/role', async function () {
        payload = { userType: 'INVALID' };

        await generateNewTokenFromRefreshToken(payload, res, refreshToken);

        expect(buildErrorMessage).to.have.been.calledWith(res, 401, 'Invalid refreshToken, login again');
        expect(generateTokenForTeacherFromRefreshToken).to.not.have.been.called;
        expect(generateTokenForStudentFromRefreshToken).to.not.have.been.called;
    });
});

describe('generateTokenForTeacherFromRefreshToken', function () {
    let res, payload, refreshToken;

    beforeEach(function () {
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        payload = { id: 'teacher123' };
        refreshToken = 'nonRefreshToken';
        sinon.stub(teacherService, 'getTeacherById');
        sinon.stub(buildErrorMessage);
        sinon.stub(buildSuccessResponse);
        sinon.stub(loginService, 'generateAccessToken').resolves('newAccessToken');
        sinon.stub(loginService,'buildTeacherPayload').returns({ id: 'teacher-id', userName: 'username '});
    });

    afterEach(function () {
        sinon.restore();
    });
    it('should return new access token if teacher exists', async function () {
        teacherService.getTeacherById.resolves({id: 'teacher-id', userName: 'username'});
        await generateTokenForTeacherFromRefreshToken(payload, res, refreshToken);

        expect(buildSuccessResponse.calledWith(res, 200, {
            token: 'newAccessToken',
            refreshToken: refreshToken
        })).to.be.true;
    });

    it('should return error if teacher does not exist', async function () {
        getTeacherById.resolves(null);

        await generateTokenForTeacherFromRefreshToken(payload, res, refreshToken);

        expect(buildErrorMessage.calledWith(res, 401, 'Invalid refreshToken, teach does not exist', payload.id)).to.be.true;
    });
});
describe('generateTokenForStudentFromRefreshToken', function () {
    let res, payload, refreshToken;

    beforeEach(function () {
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        payload = { id: 'student123' };
        refreshToken = 'nonRefreshToken';
        sinon.stub(getStudentById);
        sinon.stub(buildErrorMessage);
        sinon.stub(buildSuccessResponse);
        sinon.stub(generateAccessToken).resolves('newAccessToken');
        sinon.stub(buildStudentPayload).returns({ id: 'student-id', userName: 'username' });
    });

    afterEach(function () {
        sinon.restore();
    });

    it('should return new access token if student exists', async function () {
        getStudentById.resolves({ id: 'student-id', userName: 'username' });
        
        await generateTokenForStudentFromRefreshToken(payload, res, refreshToken);
        
        expect(buildSuccessResponse.calledWith(res, 200, {
            token: 'newAccessToken',
            refreshToken: refreshToken
        })).to.be.true;
    });
    it('should return error if student does not exist', async function () {
        getStudentById.resolves(null);
        
        await generateTokenForStudentFromRefreshToken(payload, res, refreshToken);
        
        expect(buildErrorMessage.calledWith(res, 401, 'Invalid refreshToken, login again')).to.be.true;
    });

});
