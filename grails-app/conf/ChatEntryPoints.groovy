pluginName = 'icescrumPluginChat'

entryPoints = {
    entry {
        template "/chat/dialogs/profileTabTitle"
        ref "user-openProfile-title"
    }
    entry {
        action "form"
        controller "chat"
        ref "user-openProfile-content"
    }
    entry {
        action "updatePreferences"
        controller "chat"
        ref "user-update"
    }
}