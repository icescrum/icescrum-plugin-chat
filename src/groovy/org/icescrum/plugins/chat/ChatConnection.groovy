package org.icescrum.plugins.chat

import com.kenai.jbosh.BOSHClientRequestListener
import org.jivesoftware.smack.BOSHConfiguration
import org.jivesoftware.smack.BOSHConnection
import com.kenai.jbosh.BOSHMessageEvent
import com.kenai.jbosh.BodyQName
import org.apache.commons.logging.LogFactory
import org.icescrum.core.support.ApplicationSupport

class ChatConnection implements BOSHClientRequestListener{

  private static final log = LogFactory.getLog(this)

  String sid
  String rid
  String jid

  ChatConnection(){
  }

  boolean connect(def chatPreferences, def boshConfig, def resource, boolean video){
    def isConnected = false
    BOSHConfiguration config = new BOSHConfiguration(
            ApplicationSupport.booleanValue(boshConfig.secured),
            boshConfig.server,
            boshConfig.port,
            boshConfig.path,
            (String)chatPreferences.username.split('@')[1]
    )
    config.setRosterLoadedAtLogin(false)
    config.setSendPresence(false)
    BOSHConnection conn = new BOSHConnection(config)
    try {
      conn.connect()

      conn.client.addBOSHClientRequestListener(this)
      conn.login(chatPreferences.username,chatPreferences.password,video?'vid'+resource:'web'+resource)

      isConnected = conn.isConnected()

      if (isConnected){
        jid = conn.getUser()
      }
      conn.client.close()
      conn.disconnect()

    }catch(Exception e){
      if (log.debugEnabled) e.printStackTrace()
      conn.disconnect()
    }

    return isConnected
  }

  void requestSent(BOSHMessageEvent boshMessageEvent) {
    sid = boshMessageEvent.body.getAttribute(BodyQName.create(BodyQName.BOSH_NS_URI,"sid"))
    rid = boshMessageEvent.body.getAttribute(BodyQName.create(BodyQName.BOSH_NS_URI,"rid"))
  }
}
