const {UserType} = require('../common/types');

const getFileLocation = (userType, userId, uploadType, uploadId, fileName) => {
    let fileLocation = '';

    if (userType === UserType.TEACHER) {
        if (uploadType === 'notes') {
            fileLocation = `teachers/${userId}/notes/${uploadId}/${fileName}`;
        } else if (uploadType === 'assignments') {
            fileLocation = `teachers/${userId}/assignments/${uploadId}/${fileName}`;
        } else {
            throw new Error('Invalid upload type for teacher');
        }
    } else if (userType === UserType.STUDENT) {
        if (uploadType === 'notes') {
            fileLocation = `students/${userId}/notes/${uploadId}/${fileName}`;
        } else if (uploadType === 'assignments') {
            fileLocation = `students/${userId}/assignments/${uploadId}/${fileName}`;
        } else {
            throw new Error('Invalid upload type for student');
        }
    } else {
        throw new Error('Invalid user type');
    }

    return fileLocation;
};
module.exports = {getFileLocation};