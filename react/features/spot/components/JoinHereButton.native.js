// @flow

import { appNavigate } from '../../app/actions';
import { translate } from '../../base/i18n';
import { IconPhone } from '../../base/icons';
import { connect } from '../../base/redux';
import { AbstractButton, type AbstractButtonProps } from '../../base/toolbox/components';

export type Props = AbstractButtonProps & {

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function,

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
class JoinHereButton extends AbstractButton<Props, *> {
    accessibilityLabel = 'spot.joinHere';
    icon = IconPhone;
    label = 'spot.joinHere';

    /**
     * Handles clicking / pressing the button.
     *
     * @private
     * @returns {void}
     */
    _handleClick() {
        const { dispatch, meeting } = this.props;

        dispatch(appNavigate(meeting));
    }
}

export default translate(connect()(JoinHereButton));
