import org.icescrum.core.domain.User

class StatusList {
  String[] status = new String[3]
  User user

  static constraints = {
    status(nullable: false)
  }

  static mapping={
    table 'icescrum_plugin_chat'
  }
}