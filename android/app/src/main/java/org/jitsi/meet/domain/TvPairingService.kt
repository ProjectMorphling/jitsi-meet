package org.jitsi.meet.domain

import android.bluetooth.le.AdvertiseCallback
import android.content.Context
import org.altbeacon.beacon.Beacon
import org.altbeacon.beacon.BeaconParser
import org.altbeacon.beacon.BeaconTransmitter
import org.jitsi.spot.domain.PairingService

class TvPairingService(private val context: Context) : PairingService {

    private var code: String? = null
    private val beaconParser: BeaconParser = BeaconParser()
        .setBeaconLayout("m:2-3=0215,i:4-19,i:20-21,i:22-23,p:24-24")
    private val beaconTransmitter = BeaconTransmitter(context, beaconParser)

    override fun onJoinCodeUpdated(code: String?) {
    }

    override fun onShortJoinCodeUpdated(code: String?) {
        if (code != this.code) {
            this.code = code

            beaconTransmitter.stopAdvertising()

            code?.let {
                var hexValue = code.toInt(36).toString(16)
                hexValue = hexValue.padStart(8, '0')
                val major = hexValue.substring(0, 4).toInt(16).toString().padStart(4, '0')
                val minor = hexValue.substring(4, 8).toInt(16).toString().padStart(4, '0')
                val beacon: Beacon = Beacon.Builder()
                    .setId1("bf23c311-24ae-414b-b153-cf097836947f")
                    .setId2(major)
                    .setId3(minor)
                    .setManufacturer(0x004c)
                    .setTxPower(-59)
                    .build()

                beaconTransmitter.startAdvertising(beacon)
            }
        }
    }

    override fun onSpotPageLoaded() {
    }

    override fun onReset() {
    }
}