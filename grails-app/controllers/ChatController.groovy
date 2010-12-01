import org.icescrum.components.UtilsWebComponents
import org.icescrum.core.domain.User
import org.icescrum.core.domain.Task
import grails.converters.JSON
import org.icescrum.core.domain.Team
import org.icescrum.plugins.chat.ChatConnection

class ChatController {
  static ui = true
  static final id = 'chat'

  static menuBar = [show:false]
  static widget =  [
          show:{UtilsWebComponents.rendered(renderedOnAccess:"isAuthenticated()")},
          title:'is.chat.ui.title',
          init:'index',
          toolbar:false,
          closeable:false,
          sortable:[enable:false,position:1]
  ]

  def teamService
  def springSecurityService

  def index = {

    def user = User.get(springSecurityService.principal.id)

    def statusKeys = ['online','dnd','away','disc']

    def statusLabels =[
            g.message(code:'is.chat.status.online'),
            g.message(code:'is.chat.status.busy'),
            g.message(code:'is.chat.status.abs'),
            g.message(code:'is.chat.status.disconnected')
    ]

    def statusIcons = [
            'ui-chat-select ui-chat-status-online',
            'ui-chat-select ui-chat-status-dnd',
            'ui-chat-select ui-chat-status-away',
            'ui-chat-select ui-chat-status-offline'
    ]

    def teamList = []
    user.teams.each{t->
      def jsonTeam = []
      t.members.each{u->
        if(u.id != user.id)
          jsonTeam.add([id:u.id, username:u.username, name:(u.firstName + ' ' + u.lastName)])
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


  def tooltipChat = {
    if(!params.id) {
      render(status: 400, contentType:'application/json', text: [notice: [text: message(code:'is.user.error.not.exist')]] as JSON)
      return
    }
    def user = User.get(params.long('id'))
    if(!user) {
      render(status: 400, contentType:'application/json', text: [notice: [text: message(code:"is.user.error.not.exist")]] as JSON)
      return
    }
    def tasks =  Task.findAllByResponsibleAndState(user,Task.STATE_BUSY,[order:'desc',sort:'lastUpdated'])
    render(template:'tooltipUser',plugin:'icescrum-chat',model:[m:user,tasks:tasks,nbtasks:tasks.size() > 1 ? 's' : 0])
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

  def showToolTipChat = {
    if(params.id)
      render(status:200, text:is.tooltipChat(params,null))
    else
      render(status:400)
  }
}
