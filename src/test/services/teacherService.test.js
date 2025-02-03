const { expect } = require('chai');
const sinon = require('sinon');
const { getById } = require('../../main/services/testService');
const db = require('../../main/db/dynamodb');
const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

describe('getById', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the test item when found', async () => {
        const testId = 'test-id';
        const testItem = { id: testId, name: 'Test Name' };
        const marshalledItem = marshall(testItem);

        dbStub.resolves({ Item: marshalledItem });

        const result = await getById(testId);
        expect(result).to.deep.equal(testItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const testId = 'test-id';

        dbStub.resolves({});

        const result = await getById(testId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const testId = 'test-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getById(testId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });
});