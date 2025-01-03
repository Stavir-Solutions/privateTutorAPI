const {toTeacherEntity} = require('../db/mappers/teacherMapper');
const db = require('../db/dynamodb');

const tableName = "Teachers";

async function createTeacher(teacher) {
    let teacherEntity = toTeacherEntity(teacher);
    console.log('converted to entity ', teacherEntity);
    await db.put(teacherEntity, function (err, data) {
        if (err) {
            console.error('Unable to add teacher. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    });
    return teacherEntity.Item.id;
}

async function getTeacherById(teacherId) {
    const params = {
        TableName: tableName, Key: {
            id: teacherId,
        },
    };

    try {
        const data = await db.get(params).promise();
        return data.Item;
    } catch (err) {
        console.error('Unable to get teacher. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getAllTeachers() {
    const params = {
        TableName: tableName,
    };

    try {
        const data = await db.scan(params).promise();
        console.log('scan result', data);
        return data.Items;
    } catch (err) {
        console.error('Unable to get teacher. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

module.exports = {createTeacher, getTeacherById, getAllTeachers}

