package org.jitsi.spot.di

import org.jitsi.spot.presentation.TVFragment
import dagger.Subcomponent

@Subcomponent(modules = [SpotModule::class])
interface SpotComponent {
    fun inject(tvFragment: TVFragment)
}