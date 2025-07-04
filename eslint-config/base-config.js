const bestPractices = require('./configs/best-practices');
const errors = require('./configs/errors');
const style = require('./configs/style');


module.exports = {
    ...bestPractices,
    ...errors,
    ...style,
};
