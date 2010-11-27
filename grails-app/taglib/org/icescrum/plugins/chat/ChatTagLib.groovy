package org.icescrum.plugins.chat

import org.icescrum.core.domain.User

class ChatTagLib {

  static namespace = 'is'
    def springSecurityService


    def loadChatJSContext = { attrs,body ->

      def user = User.get(springSecurityService.principal.id)
      def jsCode = """\$.icescrum.chat.init({
                            server: '${ChatUtils.chatConfig.icescrum.chat.server}',
                            port: '${ChatUtils.chatConfig.icescrum.chat.port}',
                            teamList : '${attrs.teamList}',
                            i18n:{
                                me:'${message(code:'is.chat.me').encodeAsJavaScript()}',
                                connectionError:'${message(code:'is.chat.error.server').encodeAsJavaScript()}',
                                connecting:'${message(code:'is.chat.connecting').encodeAsJavaScript()}',
                                loginError:'${message(code:'is.chat.error.login').encodeAsJavaScript()}',
                                disconnected:'${message(code:'is.chat.disconnected').encodeAsJavaScript()}',
                                connected:'${message(code:'is.chat.connected').encodeAsJavaScript()}'
                            }
                        });
                   """
      out << jq.jquery(null, jsCode)
    }

    def tooltipChat = { attrs,body ->
      def params = [
          for:"#chat-user-${attrs.id}",
          positionAdjustX:"10",
          contentText:"${g.include(controllerName,action:'tooltipChat',params:[id:attrs.id])}",
          hideFixed:"true",
          showDelay:"1000",
          styleWidthMin:"250",
          styleWidthMax:"250",
          styleClassesTooltip:"chat-tooltip",
          positionTarget:"\'mouse\'",
          positionAdjustMouse:"false",
          hideWhenEvent:"mouseout",
          hideDelay:"500"
      ]
      out << is.tooltip(params)
    }
}
