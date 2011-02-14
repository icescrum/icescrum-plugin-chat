import org.icescrum.core.domain.User

class ChatPreferences {

  String[] statusList = new String[2]
  String show = "online"
  String presence

  User user

  static constraints = {
    statusList(nullable: false)
    show(nullable: false)
    presence(nullable: true)
  }

  static mapping={
    table 'icescrum_plugin_chat'
    show column:'show_col'
  }
}