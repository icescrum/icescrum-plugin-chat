entryPoints = {
    entry {
        action "form"
        controller "chat"
        ref "user-openProfile"
    }
    entry {
        action "updatePreferences"
        controller "chat"
        ref "user-update"
    }
}