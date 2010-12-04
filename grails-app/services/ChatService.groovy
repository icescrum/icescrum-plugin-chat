class ChatService {

  def addStatus(def user, String newStatus) {
    ChatPreferences preferences = (ChatPreferences.findByUser(user)) ? ChatPreferences.findByUser(user) : new ChatPreferences(user : user)
    for(int i = 1; i > 0; i--) {
      preferences.statusList[i] = preferences.statusList[i-1]
    }
    preferences.statusList[0] = newStatus
    preferences.save()
  }

  def setCurrentStatus(def user, String show, String presence){
    ChatPreferences preferences = (ChatPreferences.findByUser(user)) ? ChatPreferences.findByUser(user) : new ChatPreferences(user : user)
    preferences.show = show
    preferences.presence = presence
    preferences.save();
  }

  def getChatPreferences(def user){
    return ChatPreferences.findByUser(user)? ChatPreferences.findByUser(user) : new ChatPreferences(user : user)
  }

}