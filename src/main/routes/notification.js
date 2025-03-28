const express = require('express');
const {buildSuccessResponse} = require("./responseUtils");
const {getByTeacherId, markNotificationSeen, getByStudentId} = require('../services/notificationService');
const authMiddleware = require("../middleware/authMiddleware");


const router = express.Router();
router.use(express.json());
router.use(authMiddleware);

router.get('/teachers/:teacherId', async (req, res) => {
    const teacherNotifications = await getByTeacherId(req.params.teacherId)
    buildSuccessResponse(res, 200, teacherNotifications);
    console.log('Retrieved {} notifications for teacher {}', teacherNotifications.length, req.params.teacherId);
});


router.patch('/:notificationId/seen', async (req, res) => {
    const Notifications = await markNotificationSeen(req.params.notificationId);
    buildSuccessResponse(res, 200, Notifications);
    console.log('notification {} is marked as seen', req.params.notificationId);

});

router.get('/students/:studentId', async (req, res) => {
    const studentNotifications = await getByStudentId(req.params.studentId)
    buildSuccessResponse(res, 200, studentNotifications);
    console.log('Retrieved {} notifications for student {}', studentNotifications.length, req.params.studentId);
});

module.exports = router;