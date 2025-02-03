const JSON_TYPE = 'application/json';

function buildErrorMessage(res, status, errorMessage) {
    return res.status(status).contentType(JSON_TYPE).send('{"error":"' + errorMessage + '"}');
}

function buildSuccessResponse(res, status, body) {
    res.status(status).contentType(JSON_TYPE).send(body);
}

module.exports = {
    buildSuccessResponse,
    buildErrorMessage
};