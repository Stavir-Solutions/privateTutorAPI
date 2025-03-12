const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const index = require('../../../index');
const assignmentService = require('../../main/services/assignmentService');
const { buildSuccessResponse, buildErrorMessage } = require('../../main/routes/responseUtils');

chai.use(chaiHttp);
const { expect } = chai;

describe('Assignment Routes', function () {
    let getByBatchIdStub, getByBatchIdAndStudentIdStub, getByIdStub, createStub, updateStub, deleteStub;

    beforeEach(() => {
        getByBatchIdStub = sinon.stub(assignmentService, 'getByBatchId');
        getByBatchIdAndStudentIdStub = sinon.stub(assignmentService, 'getByBatchIdAndStudentId');
        getByIdStub = sinon.stub(assignmentService, 'getById');
        createStub = sinon.stub(assignmentService, 'create');
        updateStub = sinon.stub(assignmentService, 'updateAssignment');
        deleteStub = sinon.stub(assignmentService, 'deleteById');

        sinon.stub(console, 'log');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should get assignments by batchId', async function () {
        const batchId = '550e8400-e29b-41d4-a716-446655440000';
        const mockAssignments = [{ id: 'assignment1', title: 'Math Assignment' }];
        getByBatchIdStub.resolves(mockAssignments);

        const res = await chai.request(index).get(`/assignments/batch/${batchId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(mockAssignments);
        expect(getByBatchIdStub.calledOnceWith(batchId)).to.be.true;
    });

    it('should get assignments by batchId and studentId', async function () {
        const batchId = '550e8400-e29b-41d4-a716-446655440000';
        const studentId = '550e8400-e29b-41d4-a716-446655440001';
        const mockAssignment = [{ id: 'assignment1', title: 'Math Assignment' }];
        getByBatchIdAndStudentIdStub.resolves(mockAssignment);

        const res = await chai.request(index).get(`/assignments/batch/${batchId}/student/${studentId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(mockAssignment);
        expect(getByBatchIdAndStudentIdStub.calledOnceWith(batchId, studentId)).to.be.true;
    });

    it('should get an assignment by id', async function () {
        const assignmentId = 'e7b8a9c2-4b1e-4d3a-8a1e-2b3b4c5d6e7f';
        const mockAssignment = { id: assignmentId, title: 'Science Assignment' };
        getByIdStub.resolves(mockAssignment);

        const res = await chai.request(index).get(`/assignments/${assignmentId}`);
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(mockAssignment);
        expect(getByIdStub.calledOnceWith(assignmentId)).to.be.true;
    });

    it('should create an assignment', async function () {
        const newAssignment = {
            publishDate: '2024-01-01T00:00:00.000Z',
            submissionDate: '2024-01-15T23:59:59.999Z',
            batchId: '550e8400-e29b-41d4-a716-446655440000',
            title: 'English Assignment',
        };
        createStub.resolves('new-assignment-id');

        const res = await chai.request(index).post('/assignments').send(newAssignment);

        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({ id: 'new-assignment-id' });
        expect(createStub.calledOnceWith(newAssignment)).to.be.true;
    });

    it('should return a 400 error for invalid assignment data', async function () {
        const invalidAssignment = { title: 'Invalid Assignment' }; // Missing required fields

        const res = await chai.request(index).post('/assignments').send(invalidAssignment);

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('message');
    });

    it('should update an assignment', async function () {
        const assignmentId = 'e7b8a9c2-4b1e-4d3a-8a1e-2b3b4c5d6e7f';
        const updateData = { title: 'Updated Assignment' };
        updateStub.resolves({ message: 'Updated successfully' });

        const res = await chai.request(index).put(`/assignments/${assignmentId}`).send(updateData);

        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({ message: 'Updated successfully' });
        expect(updateStub.calledOnceWith(assignmentId, updateData)).to.be.true;
    });

    it('should delete an assignment', async function () {
        const assignmentId = 'e7b8a9c2-4b1e-4d3a-8a1e-2b3b4c5d6e7f';
        deleteStub.resolves({ message: 'Deleted successfully' });

        const res = await chai.request(index).delete(`/assignments/${assignmentId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({ message: 'Deleted successfully' });
        expect(deleteStub.calledOnceWith(assignmentId)).to.be.true;
    });
});
