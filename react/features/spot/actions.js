// @flow

import { REFRESH_DEVICES } from './actionTypes';

/**
 * Sends an action to refresh the entry list (fetches new data).
 *
 * @returns {{
 *     type: REFRESH_DEVICES,
 * }}
 */
export function refreshDevices() {
    return {
        type: REFRESH_DEVICES
    };
}
