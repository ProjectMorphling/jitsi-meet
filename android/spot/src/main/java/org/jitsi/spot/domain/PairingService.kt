package org.jitsi.spot.domain

interface PairingService {
    fun onJoinCodeUpdated(code: String?)

    fun onShortJoinCodeUpdated(code: String?)

    fun onSpotPageLoaded()

    fun onReset()
}