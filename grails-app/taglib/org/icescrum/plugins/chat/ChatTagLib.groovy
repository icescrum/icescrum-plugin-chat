package org.icescrum.plugins.chat
import org.icescrum.core.domain.User
import org.icescrum.core.domain.Task

class ChatTagLib {

  static namespace = 'is'
    def springSecurityService


    def loadChatJSContext = { attrs,body ->

      def user = User.get(springSecurityService.principal.id)
      def jsCode = """\$.icescrum.chat.init({
                            server: '${ChatUtils.chatConfig.icescrum.chat.server}',
                            port: '${ChatUtils.chatConfig.icescrum.chat.port}',
                            teamList : '${attrs.teamList}',
                            emoticonsDir : '${resource(plugin: 'icescrum-chat', dir: '/images/emoticons')}',
                            i18n:{
                                alertNewMessages:'${message(code:'is.chat.ui.alertNewMessages').encodeAsJavaScript()}',
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
      assert attrs.id
      def user = User.get(attrs.id)
      def tasks =  Task.findAllByResponsibleAndState(user,Task.STATE_BUSY,[order:'desc',sort:'lastUpdated'])
      def content = render(template:'tooltipChat',plugin:'icescrum-chat',model:[m:user,tasks:tasks,nbtasks:tasks.size() > 1 ? 's' : 0])

      def params = [
          for:"#chat-user-${attrs.id}",
          positionAdjustX:"10",
          contentText:content,
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
