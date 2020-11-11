package org.jitsi.meet

import android.os.Bundle
import androidx.fragment.app.FragmentActivity
import org.jitsi.spot.di.ComponentHolder
import org.jitsi.spot.presentation.TVFragment

class SpotActivity : FragmentActivity(), ComponentHolder {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_spot)

        val fragment = TVFragment()

        supportFragmentManager
            .beginTransaction()
            .replace(R.id.main_container, fragment)
            .commitAllowingStateLoss()
    }

    override fun <C> getComponent(clz: Class<C>, arg: Any?): C? {
        return clz.cast((application as JitsiMeetApp).getComponent(clz, arg))
    }

    override fun clearComponent(clz: Class<*>?) {
        (application as JitsiMeetApp).clearComponent(clz)
    }
}