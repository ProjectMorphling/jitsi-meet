package org.jitsi.spot.domain

import io.reactivex.disposables.Disposable

interface PairingService {
    fun onJoinCodeUpdated(code: String?)

    fun onShortJoinCodeUpdated(code: String?)

    fun onSpotPageLoaded()

    fun registerForPairingCode(onPairingCodeReceived: (String) -> Unit): Disposable

    fun onReset()
}