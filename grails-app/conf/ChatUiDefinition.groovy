pluginName = 'icescrumPluginChat'

modulesResources = { application ->
    return application.config.icescrum.chat.enabled ? ['chat'] : null
}

uiDefinitions = {

    'chat' {
        widget {
            title 'is.chat.ui.title'
            init 'index'
            toolbar false
            closeable false
            sortable false
        }

        menuBar {
            show {
                false
            }
        }
    }
}