package org.jitsi.meet.di

import android.content.Context
import dagger.Module
import dagger.Provides
import org.jitsi.meet.domain.ConsoleLogger
import org.jitsi.meet.domain.TvAudioService
import org.jitsi.meet.domain.TvPairingService
import org.jitsi.spot.domain.AudioService
import org.jitsi.spot.domain.Logger
import org.jitsi.spot.domain.PairingService
import javax.inject.Singleton

@Module
class AppModule(private val context: Context) {
    @Singleton
    @Provides
    fun provideAudioService(): AudioService {
        return TvAudioService()
    }

    @Singleton
    @Provides
    fun providePairingService(): PairingService {
        return TvPairingService(context)
    }

    @Singleton
    @Provides
    fun providesLogger(): Logger {
        return ConsoleLogger()
    }
}