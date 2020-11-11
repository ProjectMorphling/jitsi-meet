package org.jitsi.meet.di

import android.content.Context
import org.jitsi.spot.di.SpotComponent
import org.jitsi.spot.di.SpotModule
import org.jitsi.spot.di.ComponentHolder
import org.jitsi.spot.presentation.TVFragment
import java.util.HashMap

class ComponentHolder(private val context: Context) : ComponentHolder {

    private val container: HashMap<String, Any> = HashMap()

    override fun <C : Any?> getComponent(clz: Class<C>, arg: Any?): C? {
        val classParamName = clz.canonicalName

        var component = container[classParamName!!]
        if (component == null) {
            component = when (clz) {
                AppComponent::class.java -> {
                    DaggerAppComponent.builder()
                        .appModule(AppModule(context))
                        .build() as C
                }
                SpotComponent::class.java -> {
                    val fragment = arg as TVFragment
                    getComponent(AppComponent::class.java)?.spotComponent(SpotModule(fragment)) as C
                }
                else -> null
            }
            component?.let {
                container[classParamName] = component
            }
        }

        return component!! as C
    }

    override fun clearComponent(clz: Class<*>?) {
        container.remove(clz?.canonicalName)
    }
}