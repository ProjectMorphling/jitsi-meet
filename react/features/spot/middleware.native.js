// @flow

import { Config, SpotSDK } from '@jitsi/spot-sdk';

import { MiddlewareRegistry } from '../base/redux';

import { _SET_INITIALIZED, REFRESH_DEVICES } from './actionTypes';

/**
 * Middleware that catches actions related to transcript messages to be rendered
 * in {@link Captions}.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    switch (action.type) {
    case REFRESH_DEVICES: {
        const { dispatch, getState } = store;
        const { initialized } = getState()['features/spot'];

        if (!initialized) {
            const config = new Config({
                // TODO: get from config?
                baseURL: 'https://saghul-dev1.jitsi.net/spot/',
                defaultDeviceName: 'Spot TV'
            });

            SpotSDK.initialize(config);
            SpotSDK.startDeviceDetection();

            dispatch({
                initialized: true,
                type: _SET_INITIALIZED
            });
        }
        break;
    }
    }

    return next(action);
});
