/**
 * Created by nicholas on 17-2-17.
 */
'use strict';
const BaseMiddleware = require('./base_middleware');

class BaseProxySelector extends BaseMiddleware {
    constructor() {
        super();
    };

    /**
     *
     * @returns {Promise<string>} Proxy to use
     */
    async select(session) {
        throw new Error('Method not implemented.');
    }

    async onError(session, err) {

    }

    async execute(session, next) {
        return next();
    }

    async buildRequestOptions(session) {
        return {
            proxy: await this.select(session)
        }
    }
}

module.exports = BaseProxySelector;