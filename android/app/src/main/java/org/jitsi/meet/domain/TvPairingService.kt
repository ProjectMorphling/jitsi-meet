package org.jitsi.meet.domain

import android.content.Context
import org.altbeacon.beacon.Beacon
import org.altbeacon.beacon.BeaconParser
import org.altbeacon.beacon.BeaconTransmitter
import org.jitsi.spot.domain.PairingService

class TvPairingService(private val context: Context) : PairingService {
    override fun onJoinCodeUpdated(code: String?) {
        val beacon: Beacon = Beacon.Builder()
            .setId1("2f234454-cf6d-4a0f-adf2-f4911ba9ffa6")
            .setId2("1")
            .setId3("2")
            .setManufacturer(0x0118)
            .setTxPower(-59)
            .setDataFields(listOf(0L, 1L))
            .build()
        val beaconParser: BeaconParser = BeaconParser()
            .setBeaconLayout("m:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25")
        val beaconTransmitter = BeaconTransmitter(context, beaconParser)
        beaconTransmitter.startAdvertising(beacon)
    }

    override fun onShortJoinCodeUpdated(code: String?) {
    }

    override fun onSpotPageLoaded() {
    }

    override fun onReset() {
    }
}