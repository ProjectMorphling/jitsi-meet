package org.jitsi.meet.domain

import org.jitsi.spot.domain.AudioService
import org.jitsi.spot.domain.VolumeAdjustDirection

class TvAudioService : AudioService{
    override fun setMuteState(isMuted: Boolean?) {
    }

    override fun adjustVolume(direction: VolumeAdjustDirection) {
    }
}