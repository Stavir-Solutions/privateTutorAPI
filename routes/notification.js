const express = require('express');
const {buildSuccessResponse} = require("./responseUtils");
const {getByTeacherId ,markNotificationSeen,getByStudentId} = require('../services/notificationService');


const router = express.Router();
router.use(express.json());

const  NotificationType = {
        MESSAGE: 'MESSAGE',
        FEE_PAID: 'FEE_PAID',
        NEW_STUDENT: 'NEW_STUDENT',
        FEE_INVOICE_RELEASED: 'FEE_INVOICE_RELEASED',
        FEE_PAYMENT_CONFIRMED: 'FEE_PAYMENT_CONFIRMED',
        ASSIGNMENT: 'ASSIGNMENT'
};


let teacherNotifications = [{
    'id': 'ae77d382-0712-41d9-80ef-e849d8660d9a',
    'type': NotificationType.MESSAGE,
    'title': "Riyas's parent has sent a new message",
    'objectId': 'cbe91c6e-bcf8-4f5d-ab5f-e6a01cc2614c',
    'deeplink': 'smart-teacher.com/messages/cbe91c6e-bcf8-4f5d-ab5f-e6a01cc2614c',
    'teacherId': '123e4567-e89b-12d3-a456-426614174000',
    'seen':'true'
}]



let studentNotifications = [{
    'id': '166be7a0-78b2-4f92-8c80-36f79446fa70',
    'type': NotificationType.FEE_PAID,
    'studentId': '8a1b2c3d-4e5f-6789-0abc-def123456789',
    'title': "Anoop sir has sent a message",
    'objectId': '33958845-257a-4baa-b57f-3a740d048186',
    'deeplink': 'smart-teacher.com/messages/33958845-257a-4baa-b57f-3a740d048186',
    'seen':'true'
}]


router.get('/teachers/:teacherId', async(req, res) => {
    const teacherNotifications = await getByTeacherId(req.params.teacherId)
    buildSuccessResponse(res, 200, teacherNotifications);
    console.log('Retrieved {} notifications for teacher {}', teacherNotifications.length, req.params.teacherId);
}); 

router.patch('/:notificationId/seen', async (req, res) => {
    const teacherNotifications = await markNotificationSeen(req.params.notificationId)
    buildSuccessResponse(res, 200, teacherNotifications);
    console.log('teacher notification {} is marked as seen', req.params.notificationId);
});

router.get('/students/:studentId', async (req, res) => {
    const studentNotifications = await getByStudentId(req.params.studentId)
    buildSuccessResponse(res, 200, studentNotifications);
    console.log('Retrieved {} notifications for student {}', studentNotifications.length, req.params.studentId);
});

module.exports = router;