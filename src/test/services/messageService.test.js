const {expect} = require('chai');
const sinon = require('sinon');
const {getByBatchId} = require('../../main/services/messageService');
const {addReplyToMessage} = require('../../main/services/messageService');
const {getById} = require('../../main/services/messageService');
const {create} = require('../../main/services/messageService');
const {deleteById} = require('../../main/services/messageService');
const {getByStudentId} = require('../../main/services/messageService');
const db = require('../../main/db/dynamodb');
const {UpdateItemCommand} = require('@aws-sdk/client-dynamodb');
const {PutItemCommand} = require('@aws-sdk/client-dynamodb');
const {DeleteItemCommand} = require('@aws-sdk/client-dynamodb');
const {ScanCommand} = require('@aws-sdk/client-dynamodb');
const {GetItemCommand} = require('@aws-sdk/client-dynamodb');
const messageService = require('../../main/services/messageService');


const {marshall, unmarshall} = require('@aws-sdk/util-dynamodb');

describe('getByBatchId', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the message when found', async () => {


        //given
        const batchId = 'batch-id';
        const messageItems = [{id: batchId, content: 'message content'}, {id: batchId, content: 'message content'}];
        const marshalledItems = messageItems.map(item => marshall(item));
        dbStub.resolves({Items: marshalledItems});
        //when
        const result = await getByBatchId(batchId);
        //then
        expect(result).to.deep.equal(messageItems);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const batchId = 'batch-id';

        dbStub.resolves({Items: []});

        const result = await getByBatchId(batchId);
        expect(result).to.deep.equal([]);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const batchId = 'batch-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getByBatchId(batchId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });
});



describe('addReplyToMessage', () => {
    let dbStub, getByIdStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send'); 
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should add a reply to an existing message when found', async () => {
        const messageId = 'message-id';
        const reply = { content: 'Updated message content' };
        const messageItem = { id: messageId, replies: [{ text: 'Existing reply' }] };

        dbStub.resolves({ Attributes: marshall({ ...messageItem, replies: [...messageItem.replies, reply] }) });

        const result = await messageService.addReplyToMessage(messageId, reply);

        expect(result).to.have.property('replies').with.length(2);
        expect(dbStub.called).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const messageId = 'test-id';
        const reply = { content: 'Updated content' };

        dbStub.resolves({ Attributes: null });

        const result = await messageService.addReplyToMessage(messageId, reply);

        expect(result).to.deep.equal({});
        expect(dbStub.called).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });

    it('should throw an error when the DB call fails', async () => {
        const messageId = 'message-id';
        const reply = { content: 'Updated message content' };
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await messageService.addReplyToMessage(messageId, reply);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }

        expect(dbStub.called).to.be.true;
        // TODO Keerthi - Fix this , this UpdateItemCommand is used on the second call. check that it is called second time
       // expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
});
describe('create', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the create message when found', async () => {
        // Given

        const messageId = 'message-id';
        let message = { 
            "subject": "Important Announcement",
            "content": "There will be a meeting tomorrow at 10 AM in the main hall.",
            "batchId": "batch123",
            "studentId": "student123",
            "sender": "admin123",
            "senderType": "admin",
            "senderName": "Admin User",
            "receiver": "student123",
            "receiverType": "student",
            "receiverName": "John Doe",
            "timestamp": new Date().toISOString(),
            "attachmentUrls": [
                "https://example.com/attachment1.pdf",
                "https://example.com/attachment2.jpg"
            ],
            
            "replies": [
                {
                    "content": "Thanks for submitting your homework. I'll review it soon.",
                   "sender": "student123",
                    "senderType": "student",
                    "senderName": "John Doe",
                    "timestamp": "2025-03-10T12:00:00.000Z",
                    "attachmentUrls": [
                        "https://example.com/graded-homework.pdf"
                    ]
                }
            ]}; //TODO fill proper object with all values
        const messageItem = {id: messageId, ...message};
        const marshalledItem = marshall(messageItem);

        dbStub.resolves({Item: marshalledItem});

        // When
        const result = await create(messageId);

        // Then
        expect(result).to.not.be.undefined;
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });


    it('should throw an error when the db call fails', async () => {
        // Given
        const messageId = 'message-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await create(messageId);
        } catch (err) {
            // Then
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });

});


describe('deleteById', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the deleted message when found', async () => {
        //given
        const messageId = 'message-id';
        const deletemessageItem = {};
        const marshalledItem = marshall(deletemessageItem);

        dbStub.resolves({Item: marshalledItem});

        //when
        const result = await deleteById(messageId);


        //then
        expect(result).to.deep.equal(deletemessageItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const messageId = 'message-id';

        dbStub.resolves({});

        const result = await deleteById(messageId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const messageId = 'message-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await deleteById(messageId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });
});

describe('getByStudentId', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the message when found', async () => {
        //given
        const studentId = 'student-id';
        const messageItems = [{id: studentId, content: 'message content'}, {id: studentId, content: 'message content'}];
        const marshalledItems = messageItems.map(item => marshall(item));
        dbStub.resolves({Items: marshalledItems});

        //when
        const result = await getByStudentId(studentId);


        //then
        expect(result).to.deep.equal(messageItems);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const studentId = 'student-id';

        dbStub.resolves({Items: []});

        const result = await getByStudentId(studentId);
        expect(result).to.deep.equal([]);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const studentId = 'student-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getByStudentId(studentId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });
});

describe('getById', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the message when found', async () => {
        //given
        const messageId = 'message-id';
        const messageItem = {id: messageId, content: 'message content'};
        const marshalledItem = marshall(messageItem);

        dbStub.resolves({Item: marshalledItem});

        //when
        const result = await getById(messageId);


        //then
        expect(result).to.deep.equal(messageItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const messageId = 'message-id';

        dbStub.resolves({});

        const result = await getById(messageId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const messageId = 'message-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getById(messageId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });
});