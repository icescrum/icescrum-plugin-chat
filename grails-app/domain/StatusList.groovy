import org.icescrum.core.domain.User

class StatusList {
  String[] status = []
  static belongsTo = [user : User]
}