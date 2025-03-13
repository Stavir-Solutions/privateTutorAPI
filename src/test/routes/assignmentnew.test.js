const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require("sinon");
const assignmentService = require("../../main/services/assignmentService");
const authMiddleware = require("../../main/middleware/authMiddleware");
const { expect } = chai;
chai.use(chaiHttp);


describe('Assignment Routes', function () {
    let getByBatchIdStub;
    let middlewareStub;

    // before(() => {
    //     app.listen(3000);
    // }, 20000); // Increase timeout to 20000ms

    beforeEach(() => {
        getByBatchIdStub = sinon.stub(assignmentService, 'getByBatchId');
        middlewareStub = sinon.stub(authMiddleware,'authMiddleware').callsFake(async (req, res, next) => next());


        sinon.stub(console, 'log');
    });

    afterEach(() => {
        sinon.restore();
    });

    after(() => {
        //stop express server
        app.close();
    });

    it('should get assignments by batchId', function (done) {
        this.timeout(20000); // Increase timeout to 20000ms
        const batchId = '550e8400-e29b-41d4-a716-446655440000';
        const mockAssignments = [{ id: 'assignment1', title: 'Math Assignment' }];
        getByBatchIdStub.resolves(mockAssignments);

        app = require('../../../app');

        console.log('Starting test for getting assignments by batchId');

        chai.request(app)
            .get(`/assignments/batch/${batchId}`)
            .end((err, res) => {
                if (err) {
                    console.error('Error during request:', err);
                    done(err);
                } else {
                    try {
                        console.log('Response received:', res.body);
                        expect(res.status).to.equal(200);
                        expect(res.body).to.deep.equal(mockAssignments);
                        expect(getByBatchIdStub.calledOnceWith(batchId)).to.be.true;
                        done();
                    } catch (error) {
                        done(error);
                    }
                }
            });
    });
});