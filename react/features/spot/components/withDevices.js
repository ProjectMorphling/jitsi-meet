import { SpotSDK } from '@jitsi/spot-sdk';
import React, { PureComponent } from 'react';

export const DEVICE_DETECTED_EVENT = 'deviceDetected';


/**
 * HOC to give device detection functionality to components.
 */
export default function withDevices(WrappedComponent) {
    // @ts-ignore: TS expects explicit overriding of properties
    return class DeviceAwareComponent extends PureComponent {
        /**
         * Instantiates a new component.
         *
         * @inheritdoc
         */
        constructor(props) {
            super(props);

            this.state = {
                // Setting the currently available devices as the start state.
                // This is useful for components that get mounted after a device
                // is detected.
                devicesNearby: SpotSDK.deviceEventEmitter.devicesNearby || []
            };

            this._updateDeviceList = this._updateDeviceList.bind(this);
        }

        /**
         * Implements {@code PureComponent#componentDidMount}.
         *
         * @inheritdoc
         */
        componentDidMount() {
            SpotSDK.addListener(DEVICE_DETECTED_EVENT, this._updateDeviceList);
        }

        /**
         * Implements {@code PureComponent#componentWillUnmount}.
         *
         * @inheritdoc
         */
        componentWillUnmount() {
            SpotSDK.removeListener(DEVICE_DETECTED_EVENT, this._updateDeviceList);
        }

        /**
         * Implements {@code PureComponent#render}.
         *
         * @inheritdoc
         */
        render() {
            return (
                <WrappedComponent
                    devicesNearby = { this.state.devicesNearby }
                    { ...this.props } />
            );
        }

        /**
         * Updates the device list that this component is aware of.
         *
         * @param {Beacon[]} devicesNearby - The list of devices recently detected.
         * @returns {void}
         */
        _updateDeviceList(devicesNearby) {
            this.setState({
                devicesNearby
            });
        }
    };
}
