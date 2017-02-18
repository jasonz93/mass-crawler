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

    getName() {
        throw new Error('Method not implemented.');
    }

    getAlias() {
        if (this._alias) {
            return this._alias;
        } else {
            return this.getName();
        }
    }

    setAlias(alias) {
        this._alias = alias;
    }
}

module.exports = BaseMiddleware;