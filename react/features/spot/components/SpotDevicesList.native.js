// @flow

import React from 'react';
import { Text, View } from 'react-native';

import { translate } from '../../base/i18n';
import { AbstractPage } from '../../base/react';
import { connect } from '../../base/redux';
import { refreshDevices } from '../actions';

import SpotDevicesListContent from './SpotDevicesListContent';
import styles from './styles';

/**
 * The tyoe of the React {@code Component} props of {@link CalendarList}.
 */
type Props = {

    /**
     * The translate function.
     */
    t: Function
};

/**
 * Component to display a list of events from the (mobile) user's calendar.
 */
class SpotDevicesList extends AbstractPage<Props> {
    /**
     * Initializes a new {@code SpotDevicesList} instance.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._getRenderListEmptyComponent = this._getRenderListEmptyComponent.bind(this);
    }

    /**
     * Public API method for {@code Component}s rendered in
     * {@link AbstractPagedList}. When invoked, refreshes the calendar entries
     * in the app.
     *
     * @param {Function} dispatch - The Redux dispatch function.
     * @public
     * @returns {void}
     */
    static refresh(dispatch) {
        dispatch(refreshDevices());
    }

    /**
     * Implements React's {@link Component#render}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <SpotDevicesListContent
                listEmptyComponent = { this._getRenderListEmptyComponent() } />
        );
    }

    _getRenderListEmptyComponent: () => Object;

    /**
     * Returns a list empty component if a custom one has to be rendered instead
     * of the default one in the {@link NavigateSectionList}.
     *
     * @private
     * @returns {?React$Component}
     */
    _getRenderListEmptyComponent() {
        const { t } = this.props;

        return (
            <View style = { styles.emptyListView }>
                <Text style = { styles.emptyListText }>
                    { t('spot.noDevices') }
                </Text>
            </View>
        );
    }
}


export default translate(connect()(SpotDevicesList));
