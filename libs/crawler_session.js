/**
 * Created by nicholas on 17-2-17.
 */
const Promise = require('bluebird');
const request = require('request');
const _ = require('lodash');
const Executor = require('./executor');

class CrawlerSession {

    constructor() {
        this._middlewares = [];
        this._executor = new Executor();
    }

    addMiddleware(middleware) {
        this._middlewares.push(middleware);
    };

    async request(uri, options) {
        if (!options) {
            options = {};
        }
        _.mergeWith(options, {
            uri: uri
        });
        let that = this;
        let invokerFactory = function (cursor) {
            return async function () {
                if (cursor >= that._middlewares.length) {
                    for (let i in that._middlewares) {
                        _.mergeWith(options, await that._middlewares[i].buildRequestOptions(that));
                    }
                    return await that._executor.execute(that, options);
                } else {
                    let middleware = that._middlewares[cursor];
                    let retry = false;
                    let result;
                    do {
                        try {
                            result = await middleware.execute(that, invokerFactory(cursor + 1));
                        } catch (e) {
                            retry = await middleware.onError(that, e);
                            if (!retry) {
                                throw e;
                            }
                        }
                    } while (retry);
                    return result;
                }
            };
        };
        return await invokerFactory(0)();
    };
}

module.exports = CrawlerSession;