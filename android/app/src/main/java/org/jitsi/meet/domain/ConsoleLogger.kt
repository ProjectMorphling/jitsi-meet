package org.jitsi.meet.domain

import android.util.Log
import org.jitsi.spot.domain.Logger

class ConsoleLogger : Logger {
    override fun log(tag: String, message: String) {
        Log.i(tag, message)
    }
}