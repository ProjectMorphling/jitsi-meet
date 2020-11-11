package org.jitsi.spot.di

import org.jitsi.spot.domain.AudioService
import org.jitsi.spot.domain.Logger
import org.jitsi.spot.domain.PairingService
import org.jitsi.spot.presentation.TVFragment
import org.jitsi.spot.presentation.TVNavigationService
import org.jitsi.spot.presentation.TVViewModel
import dagger.Module
import dagger.Provides

@Module
class SpotModule(private val tvFragment: TVFragment) {

    @Provides
    fun provideTVNavigationService(): TVNavigationService {
        return TVNavigationService(tvFragment)
    }

    @Provides
    fun provideTVViewModel(
        audioService: AudioService,
        tvNavigationService: TVNavigationService,
        pairingService: PairingService,
        logger: Logger
    ): TVViewModel {
        return TVViewModel(audioService, tvNavigationService, pairingService, logger)
    }
}