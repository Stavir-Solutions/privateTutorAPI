const express = require('express');
const {buildSuccessResponse} = require("./responseUtils");
const {getByTeacherId ,MarkTeacherNotificationSeen,MarkStudentNotificationSeen, getByStudentId} = require('../services/notificationService');


const router = express.Router();
router.use(express.json());

let teacherNotifications = [{
    'id': 'ae77d382-0712-41d9-80ef-e849d8660d9a',
    'type': 'MESSAGE',
    'title': "Riyas's parent has sent a new message",
    'objectId': 'cbe91c6e-bcf8-4f5d-ab5f-e6a01cc2614c',
    'deeplink': 'smart-teacher.com/messages/cbe91c6e-bcf8-4f5d-ab5f-e6a01cc2614c',
    'teacherId': '123e4567-e89b-12d3-a456-426614174000',
    'seen':'true'


}, {
    'id': 'c3277bf1-7e6f-4a56-87f2-647f6656c6fd',
    'type': 'FEE_PAID',
    'title': "Maniyarasu paid the fee for the month of January",
    'objectId': 'f99a40e6-3258-417b-841e-c56dc2618eeb',
    'deeplink': 'smart-teacher.com/fee-tracker/f99a40e6-3258-417b-841e-c56dc2618eeb',
    'teacherId': '123e4567-e89b-12d3-a456-426614474000',
    'seen':'false'

}, {
    'id': 'c00383e9-8fd4-4576-98fd-63b036b5e730',
    'type': 'NEW_STUDENT',
    'title': "Sangeetha joined class - weekend music class",
    'objectId': 'ad47f6f2-613e-4685-a89b-61d3da2cc503',
    'deeplink': 'smart-teacher.com/student/ad47f6f2-613e-4685-a89b-61d3da2cc503,',
    'teacherId': '123e4567-e89b-12d3-a456-426614144000',
    'seen':'true'

}]


let studentNotifications = [{
    'id': '166be7a0-78b2-4f92-8c80-36f79446fa70',
    'type': 'MESSAGE',
    'studentId': '8a1b2c3d-4e5f-6789-0abc-def123456789',
    'title': "Anoop sir has sent a message",
    'objectId': '33958845-257a-4baa-b57f-3a740d048186',
    'deeplink': 'smart-teacher.com/messages/33958845-257a-4baa-b57f-3a740d048186',
    'seen':'true'
}, {
    'id': '9dd34058-4a77-435b-888d-b0dbb487d475',
    'type': 'FEE_INVOICE_RELEASED',
    'studentId': '8a1b2c3d-4e5f-6789-0abc-def123456749',
    'title': "Santhosh sir released the invoice for the month of January",
    'objectId': '1252a1f2-62fa-4695-89a1-f4cbdecc3f6c',
    'deeplink': 'smart-teacher.com/fee-tracker/1252a1f2-62fa-4695-89a1-f4cbdecc3f6c',
    'seen':'true'

}, {
    'id': 'c7fc2322-1193-4db5-83ea-937d211d7f93',
    'type': 'FEE_PAYMENT_CONFIRMED',
    'studentId': '8a1b2c3d-4e5f-6789-0abc-def153456789',
    'title': "Santhosh sir confirmed feee payment for the month of January",
    'objectId': 'f04571eb-cfa2-4889-a73b-9510fec719c5',
    'deeplink': 'smart-teacher.com/fee-tracker/f04571eb-cfa2-4889-a73b-9510fec719c5',
    'seen':'true'

}, {
    'id': '09a2253a-04a4-44bf-afc6-4e5e3f78ad9d',
    'type': 'ASSIGNMENT',
    'studentId': '8a1b2c3d-4e5f-6789-0abc-def198456789',
    'title': "There is new assignment in dance class",
    'objectId': '09a2253a-04a4-44bf-afc6-4e5e3f78ad9d',
    'deeplink': 'smart-teacher.com/assignments/09a2253a-04a4-44bf-afc6-4e5e3f78ad9d',
    'seen':'false'

}]


router.get('/teachers/:teacherId', async(req, res) => {
    const teacherNotifications = await getByTeacherId(req.params.teacherId)
    buildSuccessResponse(res, 200, teacherNotifications);
    console.log('Retrieved {} notifications for teacher {}', teacherNotifications.length, req.params.teacherId);
}); 

router.patch('/teachers/:notificationId/seen', async (req, res) => {
    const teacherNotifications = await MarkTeacherNotificationSeen(req.params.notificationId)
    buildSuccessResponse(res, 200, teacherNotifications);
    console.log('teacher notification {} is marked as seen', req.params.notificationId);
});

router.get('/students/:studentId', async (req, res) => {
    const studentNotifications = await getByStudentId(req.params.studentId)
    buildSuccessResponse(res, 200, studentNotifications);
    console.log('Retrieved {} notifications for student {}', studentNotifications.length, req.params.studentId);
});

router.patch('/students/:notificationId/seen',async (req, res) => {
    const studentNotifications = await MarkStudentNotificationSeen(req.params.notificationId)
    buildSuccessResponse(res, 200, studentNotifications);
    console.log('student notification {} is marked as seen', req.params.notificationId);
});

module.exports = router;