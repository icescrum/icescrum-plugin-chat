pluginName = 'icescrumPluginChat'

modulesResources = ['chat']

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