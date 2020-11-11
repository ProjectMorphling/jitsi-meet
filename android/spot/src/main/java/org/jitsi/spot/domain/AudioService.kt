package org.jitsi.spot.domain

import io.reactivex.disposables.Disposable

interface AudioService {
    fun registerForMicMuteStateChange(onMicMuteStateChanged: (Boolean) -> Unit): Disposable

    fun setMuteState(isMuted: Boolean?)

    fun adjustVolume(direction: VolumeAdjustDirection)
}