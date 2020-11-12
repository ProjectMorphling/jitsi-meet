// @flow

import React, { Component } from 'react';

import { translate } from '../../base/i18n';
import { setActiveModalId } from '../../base/modal';
import { NavigateSectionList } from '../../base/react';
import { connect } from '../../base/redux';
import { SPOT_REMOTE_VIEW_ID } from '../constants';

import withDevices from './withDevices';


/**
 * The type of the React {@code Component} props of
 * {@link CalendarListContent}.
 */
type Props = {

    /**
     * The calendar event list.
     */
    devicesNearby: Array<Object>,

    /**
     * The Redux dispatch function.
     */
    dispatch: Function,

    /**
     *
     */
    listEmptyComponent: React$Node,

    /**
     * The translate function.
     */
    t: Function
};

/**
 * Component to display a list of events from a connected calendar.
 */
class SpotDevicesListContent extends Component<Props> {
    /**
     * Initializes a new {@code CalendarListContent} instance.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onPress = this._onPress.bind(this);
        this._toDisplayableList = this._toDisplayableList.bind(this);
    }

    /**
     * Implements React's {@link Component#render}.
     *
     * @inheritdoc
     */
    render() {
        const { listEmptyComponent } = this.props;

        return (
            <NavigateSectionList
                onPress = { this._onPress }
                renderListEmptyComponent = { listEmptyComponent }
                sections = { this._toDisplayableList() } />
        );
    }

    _onPress: (string, ?string) => void;

    /**
     * Handles the list's navigate action.
     *
     * @private
     * @param {string} joinCode - The url string to navigate to.
     * @returns {void}
     */
    _onPress(joinCode) {
        console.log(`XXXX PRESS: ${joinCode}`);
        this.props.dispatch(setActiveModalId(SPOT_REMOTE_VIEW_ID, { joinCode }));
    }

    _toDisplayableList: () => Array<Object>;

    /**
     * Transforms the event list to a displayable list with sections.
     *
     * @private
     * @returns {Array<Object>}
     */
    _toDisplayableList() {
        const { devicesNearby, t } = this.props;

        if (!devicesNearby || devicesNearby.length === 0) {
            return [];
        }

        const section = NavigateSectionList.createSection(t('spot.devicesSection'), 'spotDevices');

        for (const device of devicesNearby.sort((a, b) => a.joinCode > b.joinCode)) {
            const d = {
                id: device.joinCode,
                key: device.joinCode,
                lines: [
                    device.joinCode.toUpperCase(),
                    device.proximity
                ],
                title: device.name,
                url: device.joinCode
            };

            section.data.push(d);
        }

        return [ section ];
    }
}


export default withDevices(translate(connect()(SpotDevicesListContent)));
