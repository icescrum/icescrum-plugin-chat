class StatusListService {

  def addStatus(def user, String newStatus) {
    StatusList statusList = (StatusList.findByUser(user)) ? StatusList.findByUser(user) : new StatusList(user : user)
    if(statusList.status.size() == 3) {
      for(int i = 2; i > 0; i--) {
        statusList.status[i] = statusList.status[i-1]
      }
      statusList.status[0] = newStatus
    }
    else {
      println statusList.status
      println newStatus.getClass()
      statusList.status[statusList.status.size()] = newStatus
      // statusList.status.add(newStatus)
    }
    statusList.save()
  }

  String[] getStatus(def user) {
    return StatusList.findByUser(user).status
  }
}