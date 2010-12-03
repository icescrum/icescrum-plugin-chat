class StatusListService {

  def addStatus(def user, String newStatus) {
    StatusList statusList = (StatusList.findByUser(user)) ? StatusList.findByUser(user) : new StatusList(user : user)
    for(int i = 2; i > 0; i--) {
      statusList.status[i] = statusList.status[i-1]
    }
    statusList.status[0] = newStatus
    statusList.save()
  }

  String[] getStatus(def user) {
    return StatusList.findByUser(user).status.findAll{it != null}.toArray()
  }
}