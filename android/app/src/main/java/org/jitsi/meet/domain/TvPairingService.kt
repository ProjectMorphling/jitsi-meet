package org.jitsi.meet.domain

import android.bluetooth.le.AdvertiseCallback
import android.content.Context
import org.altbeacon.beacon.Beacon
import org.altbeacon.beacon.BeaconParser
import org.altbeacon.beacon.BeaconTransmitter
import org.jitsi.spot.domain.PairingService

class TvPairingService(private val context: Context) : PairingService {
    private var isAdvertising = false
    override fun onJoinCodeUpdated(code: String?) {
    }

    override fun onShortJoinCodeUpdated(code: String?) {
        if(!isAdvertising) {
            isAdvertising = true

            code?.let {
                val hexValue = code.toInt(36).toString(16)
                val major = hexValue.substring(0, 4).toInt(16).toString()
                val minor = hexValue.substring(4, 8).toInt(16).toString()
                val beacon: Beacon = Beacon.Builder()
                    .setId1("bf23c311-24ae-414b-b153-cf097836947f")
                    .setId2(major)
                    .setId3(minor)
                    .setDataFields(listOf(0L, 1L))
                    .setManufacturer(0x0118)
                    .setTxPower(-59)
                    .build()
                val beaconParser: BeaconParser = BeaconParser()
                    .setBeaconLayout("m:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25")
                val beaconTransmitter = BeaconTransmitter(context, beaconParser)
                beaconTransmitter.startAdvertising(beacon, object : AdvertiseCallback() {
                    override fun onStartFailure(errorCode: Int) {
                        super.onStartFailure(errorCode)
                        isAdvertising = false
                    }
                })
            }
        }
    }

    override fun onSpotPageLoaded() {
    }

    override fun onReset() {
    }
}