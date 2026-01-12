const mongoose = require('mongoose');

async function withTransaction(operation, options = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const result = await operation(session);
        await session.commitTransaction();
        return result;
    } catch (error) {
        await session.abortTransaction();
        error.message = error.message ? `Transaction failed: ${error.message}` : 'Transaction failed';
        if (error.errorLabels && error.errorLabels.includes('TransientTransactionError')) {
            console.warn('Transient transaction error, consider implementing retry logic');
        }
        throw error;
    } finally {
        session.endSession();
    }
}

module.exports = { withTransaction };