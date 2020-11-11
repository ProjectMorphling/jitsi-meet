package org.jitsi.spot.domain

interface AudioService {

    fun setMuteState(isMuted: Boolean?)

    fun adjustVolume(direction: VolumeAdjustDirection)
}