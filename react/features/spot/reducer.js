// @flow

import { ReducerRegistry } from '../base/redux';

import { _SET_SPOT_CLIENT } from './actionTypes';

/**
 * Listen for actions for the transcription feature to be used by the actions
 * to update the rendered transcription subtitles.
 */
ReducerRegistry.register('features/spot', (state = {}, action) => {
    switch (action.type) {
    case _SET_SPOT_CLIENT:
        return {
            ...state,
            client: action.client
        };
    }

    return state;
});
