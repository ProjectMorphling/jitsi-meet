package org.jitsi.spot.di

interface ComponentHolder {
    fun <C : Any?> getComponent(clz: Class<C>, arg: Any? = null): C?

    fun clearComponent(clz: Class<*>?)
}