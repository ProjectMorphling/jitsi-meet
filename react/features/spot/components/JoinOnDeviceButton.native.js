// @flow

import { translate } from '../../base/i18n';
import { IconShareDesktop } from '../../base/icons';
import { setActiveModalId } from '../../base/modal';
import { connect } from '../../base/redux';
import { AbstractButton, type AbstractButtonProps } from '../../base/toolbox/components';
import { SPOT_REMOTE_VIEW_ID } from '../constants';

export type Props = AbstractButtonProps & {

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function,

    device: Object,

    /**
     * The ID of the entry to be deleted.
     */
    meeting: string,

    /**
     * The function to be used to translate i18n labels.
     */
    t: Function
};

/**
 * A recent list menu button which deletes the selected entry.
 */
class JoinOnDeviceButton extends AbstractButton<Props, *> {
    accessibilityLabel = 'spot.joinHere';
    icon = IconShareDesktop;

    get label() {
        const { device } = this.props;
        const { joinCode, name } = device;

        return `${name} (${joinCode.toUpperCase()})`;
    }

    /**
     * Handles clicking / pressing the button.
     *
     * @private
     * @returns {void}
     */
    _handleClick() {
        const { device, dispatch, meeting } = this.props;

        dispatch(setActiveModalId(SPOT_REMOTE_VIEW_ID, {
            joinCode: device.joinCode,
            goToMeeting: meeting
        }));
    }
}

export default translate(connect()(JoinOnDeviceButton));
