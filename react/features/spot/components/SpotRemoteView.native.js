/* eslint-disable react/no-multi-comp */
// @flow

import { SpotSDK } from '@jitsi/spot-sdk';
import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { type Dispatch } from 'redux';

import { translate } from '../../base/i18n';
import { JitsiModal } from '../../base/modal';
import { LoadingIndicator } from '../../base/react';
import { connect } from '../../base/redux';
import { SPOT_REMOTE_VIEW_ID } from '../constants';

import styles, { INDICATOR_COLOR } from './styles';

type Props = {

    /**
     * The URL to display the summary for.
     */
    _joinCode: ?string,

    _goToMeeting: ?string,

    dispatch: Dispatch<any>
};

/**
    * Renders the loading indicator.
    *
    * @returns {React$Component<any>}
    */
function renderLoading() {
    return (
        <View style = { styles.indicatorWrapper }>
            <LoadingIndicator
                color = { INDICATOR_COLOR }
                size = 'large' />
        </View>
    );
}

/**
 * Implements a React native component that displays the dial in info page for a specific room.
 *
 * @param {Props} props - The props.
 * @returns {React$Component<any>}
 */
function SpotRemoteView(props: Props) {
    const { _joinCode, _goToMeeting } = props;
    const extra = _goToMeeting ? `?goToMeeting=${encodeURIComponent(_goToMeeting)}` : '';
    const uri = `${SpotSDK.config.baseURL}${_joinCode ? _joinCode : ''}${extra}`;

    console.log(`XXX URI: ${uri}`);

    return (
        <JitsiModal
            headerProps = {{
                headerLabelKey: 'spot.remote'
            }}
            modalId = { SPOT_REMOTE_VIEW_ID }
            style = { styles.backDrop } >
            <WebView
                renderLoading = { renderLoading }
                source = {{ uri }}
                startInLoadingState = { true }
                style = { styles.webView } />
        </JitsiModal>
    );
}

/**
 * Maps part of the Redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @returns {Props}
 */
function mapStateToProps(state) {
    const modalProps = state['features/base/modal'].modalProps || {};

    return {
        _joinCode: modalProps.joinCode,
        _goToMeeting: modalProps.goToMeeting
    };
}

export default translate(connect(mapStateToProps)(SpotRemoteView));
