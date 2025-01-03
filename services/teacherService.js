const {toTeacherEntity} = require('../db/mappers/teacherMapper');
const db = require('../db/dynamodb');

function createTeacher(teacher) {
    let teacherEntity = toTeacherEntity(teacher);
    console.log('converted to entity ', teacherEntity);
    db.put(teacherEntity, function (err, data) {
        if (err) {
            console.error('Unable to add teacher. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    });
    return teacherEntity.Item.id;
}

module.exports = {createTeacher}

