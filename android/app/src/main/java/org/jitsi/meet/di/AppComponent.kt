package org.jitsi.meet.di

import dagger.Component
import org.jitsi.meet.JitsiMeetApp
import org.jitsi.spot.di.SpotComponent
import org.jitsi.spot.di.SpotModule
import javax.inject.Singleton

@Singleton
@Component(modules = [AppModule::class])
interface AppComponent {
    fun inject(jitsiMeetApp: JitsiMeetApp)

    fun spotComponent(spotModule: SpotModule): SpotComponent
}