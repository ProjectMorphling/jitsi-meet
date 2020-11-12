// @flow

import React, { PureComponent } from 'react';

import { ColorSchemeRegistry } from '../../base/color-scheme';
import { BottomSheet, hideDialog, isDialogOpen } from '../../base/dialog';
import { connect } from '../../base/redux';
import { StyleType } from '../../base/styles';

import JoinHereButton from './JoinHereButton.native';
import JoinOnDeviceButton from './JoinOnDeviceButton.native';
import withDevices from './withDevices';

type Props = {

    meeting: string,

    devicesNearby: Array<Object>,

    /**
     * The Redux dispatch function.
     */
    dispatch: Function,

    /**
     * The color-schemed stylesheet of the BottomSheet.
     */
    _bottomSheetStyles: StyleType,

    /**
     * True if the menu is currently open, false otherwise.
     */
    _isOpen: boolean
}

// eslint-disable-next-line prefer-const
let SpotDevicesMenu_;

/**
 * Class to implement a popup menu that opens upon long pressing a recent list item.
 */
class SpotDevicesMenu extends PureComponent<Props> {
    /**
     * Constructor of the component.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this._onCancel = this._onCancel.bind(this);
    }

    /**
     * Implements {@code Component#render}.
     *
     * @inheritdoc
     */
    render() {
        const { _bottomSheetStyles, devicesNearby, meeting } = this.props;
        const buttonProps = {
            afterClick: this._onCancel,
            showLabel: true,
            styles: _bottomSheetStyles.buttons
        };

        return (
            <BottomSheet
                onCancel = { this._onCancel }>
                <JoinHereButton
                    meeting = { meeting }
                    { ...buttonProps } />
                {
                    devicesNearby.sort((a, b) => a.joinCode > b.joinCode).map(d => (
                        <JoinOnDeviceButton
                            device = { d }
                            key = { d.joinCode }
                            meeting = { meeting }
                            { ...buttonProps } />))
                }
            </BottomSheet>
        );
    }

    _onCancel: () => boolean;

    /**
     * Callback to hide this menu.
     *
     * @private
     * @returns {boolean}
     */
    _onCancel() {
        if (this.props._isOpen) {
            this.props.dispatch(hideDialog(SpotDevicesMenu_));

            return true;
        }

        return false;
    }
}

/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    return {
        _bottomSheetStyles: ColorSchemeRegistry.get(state, 'BottomSheet'),
        _isOpen: isDialogOpen(state, SpotDevicesMenu_)
    };
}

SpotDevicesMenu_ = withDevices(connect(_mapStateToProps)(SpotDevicesMenu));

export default SpotDevicesMenu_;
