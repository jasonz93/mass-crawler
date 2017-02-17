/**
 * Created by nicholas on 17-2-17.
 */
class BaseMiddleware {
    constructor() {

    }

    async execute(session, next) {
        return next();
    }

    /**
     *
     * @param err Error
     * @returns {Promise<boolean>} shouldRetry
     */
    async onError(session, err) {

    }

    async buildRequestOptions(session) {
        return {};
    }
}

module.exports = BaseMiddleware;