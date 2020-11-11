package org.jitsi.spot.domain

interface Preferences {
    fun saveJoinCode(code: String)

    fun getJoinCode(): String
}