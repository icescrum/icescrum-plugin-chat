package org.icescrum.plugins.chat

import com.kenai.jbosh.BOSHClientRequestListener
import org.jivesoftware.smack.BOSHConfiguration
import org.jivesoftware.smack.BOSHConnection
import com.kenai.jbosh.BOSHMessageEvent
import com.kenai.jbosh.BodyQName
import org.jivesoftware.smack.packet.Presence
import org.jivesoftware.smack.RosterListener
import org.jivesoftware.smack.Roster

class ChatConnection implements BOSHClientRequestListener{

  String sid
  String rid
  String jid

  ChatConnection(){
  }

  boolean connect(def login, def password){

    def isConnected = false
    BOSHConfiguration config = new BOSHConfiguration(
            ChatUtils.chatConfig.icescrum.chat.secure.toBoolean(),
            ChatUtils.chatConfig.icescrum.chat.server,
            ChatUtils.chatConfig.icescrum.chat.port.toInteger(),
            ChatUtils.chatConfig.icescrum.chat.boshPath,
            ChatUtils.chatConfig.icescrum.chat.server
    )
    config.setRosterLoadedAtLogin(false)
    config.setSendPresence(false)
    BOSHConnection conn = new BOSHConnection(config)
    try {
      conn.connect()

      conn.client.addBOSHClientRequestListener(this)
      conn.login(login,password,ChatUtils.chatConfig.icescrum.chat.resource)

      isConnected = conn.isConnected()

      if (isConnected){
        jid = conn.getUser()
      }
      conn.client.close()
      conn.disconnect()

    }catch(Exception e){
      e.printStackTrace()
      conn.disconnect()
    }

    return isConnected
  }

  void requestSent(BOSHMessageEvent boshMessageEvent) {
    sid = boshMessageEvent.body.getAttribute(BodyQName.create(BodyQName.BOSH_NS_URI,"sid"))
    rid = boshMessageEvent.body.getAttribute(BodyQName.create(BodyQName.BOSH_NS_URI,"rid"))
  }
}
