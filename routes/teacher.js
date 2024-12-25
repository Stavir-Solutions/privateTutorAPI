const express = require('express');
const router = express.Router();
const Joi = require('joi');
router.use(express.json());

router.get('/teachers', (req, res) => {
    res.send('{"name":"Santhosh"}');
});

const teacherSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    userName: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(20).pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')).required(),
    age: Joi.number().integer().min(18).optional(),
    gender: Joi.string().valid('male', 'female', 'do not reveal').required(),
    addressLine1: Joi.string().required(),
    addressCity: Joi.string().optional(),
    addressState: Joi.string().optional(),
    pinCode: Joi.number().required(),
    profilePicUrl: Joi.string().uri().optional(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
    upiId: Joi.string().required(),
    accountNumber: Joi.string().required(),
    accountName: Joi.string().required(),
    ifscCode: Joi.string().required()

});


router.post('/teachers', (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = teacherSchema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    console.log('creating teacher {}', req.body);
    res.status(200).send('{"id":"550e8400-e29b-41d4-a716-446655440000"}');
});

/* API to update the teacher */
router.put('/teachers/:id', (req, res) => {
    const {error} = teacherSchema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    console.log('updating teacher {}', req.body);
    res.status(200).send('{"message":"Teacher is updated successfully"}');
});

router.delete('/teachers/:id', (req, res) => {
    console.log('Deleting teacher with id {}', req.params.id);
    res.status(200).send('{"message":"Teacher is deleted successfully"}');
});


module.exports = router;