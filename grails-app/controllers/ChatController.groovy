import grails.converters.JSON
import org.icescrum.components.UtilsWebComponents
import org.icescrum.core.domain.User
import org.icescrum.core.support.ApplicationSupport
import org.icescrum.plugins.chat.ChatConnection
import org.icescrum.plugins.chat.ChatUtils

class ChatController {
  static ui = true
  static final id = 'chat'

  static menuBar = [show:false]
  static widget =  [
          show:{UtilsWebComponents.rendered(renderedOnAccess:"isAuthenticated()") && ApplicationSupport.booleanValue(ChatUtils.chatConfig.icescrum.chat.enabled)},
          title:'is.chat.ui.title',
          init:'index',
          toolbar:false,
          closeable:false,
          sortable:[enable:false,position:1]
  ]

  def teamService
  def springSecurityService
  def chatService

  def index = {

    def user = User.get(springSecurityService.principal.id)
    def statusKeys = []
    def statusLabels =[]
    def statusIcons = []

    def statusType = ['online','dnd','away']
    for(status in statusType){
      statusKeys.add(status)
      statusLabels.add(g.message(code:'is.chat.status.'+status))
      statusIcons.add('ui-chat-select ui-chat-status-'+status)
      chatService.getChatPreferences(user)?.statusList?.findAll{it != null}?.toArray()?.each{
        statusKeys.add(status)
        statusLabels.add(it.encodeAsJavaScript())
        statusIcons.add('status-custom ui-chat-select ui-chat-status-'+status)
      }
    }

    statusKeys.add('disc')
    statusLabels.add(g.message(code:'is.chat.status.disconnected'))
    statusIcons.add('ui-chat-select ui-chat-status-offline')

    def teamList = []
    def userList = []
    user.teams?.each{t->
      def jsonTeam = []
      t.members?.each{u->
        if(u.id != user.id && !userList.contains(u.id)) {
          jsonTeam.add([id:u.id, username:u.username.toLowerCase(), lastname:u.lastName, firstname:u.firstName])
          userList.add(u.id)
        }
      }
      teamList.add(teamname:t.name, teamid:t.id, users:jsonTeam)
    }
    teamList = teamList as JSON

    render(template:'widget/widgetView',plugin:'icescrum-chat', model:[
            teamList:teamList,
            user:user,
            statusKeys:statusKeys,
            statusLabels:statusLabels,
            statusIcons:statusIcons,
            id:id])
  }


  def attachConnection = {
    def user = User.get(springSecurityService.principal.id)
    def chatConnection = new ChatConnection()
    if(chatConnection.connect(user.username,session['j_password'])){
      render(status:200,text:[sid:chatConnection.sid,rid:chatConnection.rid,jid:chatConnection.jid] as JSON)
    }else{
      render(status:400)
    }
  }

  def showToolTip = {
    if(params.id)
      render(status:200, text:is.tooltipChat(params,null))
    else
      render(status:400)
  }

  def saveStatus = {
    def user = User.get(springSecurityService.principal.id)
    try {
      if(user){
        if (params.boolean('custom')){
          chatService.addStatus(user,params.presence)
        }
        chatService.setCurrentStatus(user,params.show,params.presence)
        render(status:200)
      }else{
        render(status:400)
      }
    }catch(Exception e){
      render(status:400)
    }
  }
}
