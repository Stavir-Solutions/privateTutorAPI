const dateValidator = (value, helpers) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return helpers.error('any.invalid');
    }
    return value;
};

module.exports = { dateValidator };
