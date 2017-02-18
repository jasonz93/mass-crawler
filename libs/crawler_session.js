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
        this._attributes = {};
        this._executor = new Executor();
    }

    addMiddleware(middleware) {
        this._middlewares.push(middleware);
    };

    setAttribute(name, value) {
        this._attributes[name] = value;
    }

    getAttribute(name) {
        return this._attributes[name];
    }

    toObject() {
        let obj = {
            middlewares: [],
            attributes: this._attributes
        };
        for (let i in this._middlewares) {
            obj.middlewares.push({
                name: this._middlewares[i].getName()
            });
        }
        return obj;
    }

    toJSON() {
        return JSON.stringify(this.toObject());
    }

    static fromObject(object, middlewareStore) {
        let session = new CrawlerSession();
        if (object.middlewares instanceof Array) {
            object.middlewares.forEach((middleware) => {
                session.addMiddleware(middlewareStore[middleware.name]);
            })
        }
        if (typeof object.attributes === 'object') {
            for (let name in object.attributes) {
                session.setAttribute(name, object.attributes[name]);
            }
        }
        return session;
    }

    static fromJSON(json, middlewareStore) {
        return CrawlerSession.fromObject(JSON.parse(json), middlewareStore);
    }

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