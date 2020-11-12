package org.jitsi.spot.presentation

import androidx.databinding.Observable
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleObserver
import androidx.lifecycle.OnLifecycleEvent
import androidx.databinding.ObservableField
import org.jitsi.spot.domain.*

class TVViewModel(
    private val audioService: AudioService,
    private val tvNavigationService: TVNavigationService,
    private val pairingService: PairingService,
    private val logger: Logger
) : LifecycleObserver {

    val tvUrl = ObservableField<String>()
    val pairingCode = ObservableField<String>()

    init {
        tvUrl.set(SPOT_TV_URL)

        pairingCode.addOnPropertyChangedCallback(object :
            Observable.OnPropertyChangedCallback() {
            override fun onPropertyChanged(sender: Observable?, propertyId: Int) {
                logger.log(tag, "on pairing code changed: $pairingCode.get()")
                tvUrl.set(String.format(SPOT_TV_URL, pairingCode.get()))
            }
        })
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    fun onCreateEvent() {
        logger.log(tag, "created")
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun onStartEvent() {
        logger.log(tag, "started")
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun onStopEvent() {
        logger.log(tag, "stopped")
    }

    fun onPageLoaded() {
        logger.log(tag, "page loaded")
        pairingService.onSpotPageLoaded()
    }

    fun onMuteEvent(isMuted: Boolean?) {
        logger.log(tag, "mute event: $isMuted")
        audioService.setMuteState(isMuted)
    }

    fun onUpdateJoinCode(code: String?) {
        logger.log(tag, "update join code: $code")
        pairingService.onJoinCodeUpdated(code)
    }

    fun onUpdateShortJoinCode(code: String?){
        logger.log(tag, "update short join code: $code")
        pairingService.onShortJoinCodeUpdated(code)
    }

    fun onAdjustVolume(direction: VolumeAdjustDirection) {
        logger.log(tag, "adjust volume: $direction")
        audioService.adjustVolume(direction)
    }

    fun onReset() {
        logger.log(tag, "reset")
        pairingService.onReset()
        tvNavigationService.navigateBack()
    }

    fun onMeetingStatusUpdated(status: MeetingStatus) {
        logger.log(tag, "meeting status updated: $status")
    }

    private fun onMicMuteStateChanged(isMuted: Boolean) {
        logger.log(tag, "mic mute state changed: $isMuted")
        tvNavigationService.setMuteState(isMuted)
    }

    private fun onPairingCodeChanged(pairingCode: String?) {
        logger.log(tag, "on pairing code changed: $pairingCode")
        this.pairingCode.set(pairingCode)
    }

    companion object {
        private const val SPOT_TV_URL = "http://192.168.100.69:8000/tv?llpc=%s&skipPairRemote=true&skipSelectMedia=true&volumeControlSupported=true"
         //   "https://spot.8x8.vc/tv?llpc=%s&skipPairRemote=true&skipSelectMedia=true&volumeControlSupported=true"
        private val tag = TVViewModel::class.java.simpleName
    }
}