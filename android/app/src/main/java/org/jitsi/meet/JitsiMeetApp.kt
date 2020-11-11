package org.jitsi.meet

import android.app.Application
import org.jitsi.meet.di.AppComponent
import org.jitsi.spot.di.ComponentHolder

class JitsiMeetApp : Application(), ComponentHolder {

    private val componentHolder: ComponentHolder by lazy { org.jitsi.meet.di.ComponentHolder(this) }

    override fun <C> getComponent(clz: Class<C>, arg: Any?): C? {
        return componentHolder.getComponent(clz, arg)
    }

    override fun clearComponent(clz: Class<*>?) {
        componentHolder.clearComponent(clz)
    }

    private fun inject() {
        getComponent(AppComponent::class.java, this)?.inject(this)
    }
}
