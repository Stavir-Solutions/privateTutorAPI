const NotificationType = {
    MESSAGE: 'MESSAGE',
    MESSAGE_REPLY: 'MESSAGE_REPLY',
    FEE_PAID: 'FEE_PAID',
    NEW_STUDENT: 'NEW_STUDENT',
    FEE_INVOICE_RELEASED: 'FEE_INVOICE_RELEASED',
    FEE_PAYMENT_CONFIRMED: 'FEE_PAYMENT_CONFIRMED',
    ASSIGNMENT: 'ASSIGNMENT'
};

const TokenType = {
    ACCESS: 'ACCESS', REFRESH: 'REFRESH'
};

const UserType = {
    TEACHER: 'TEACHER', STUDENT: 'STUDENT'
};


module.exports = {NotificationType, TokenType, UserType};
