import org.icescrum.core.support.ApplicationSupport

pluginName = 'iceScrumPluginManagement'

uiDefinitions = {

    'chat' {
        widget {
            show{
                if(!request.authenticated || !ApplicationSupport.booleanValue(grailsApplication.config.icescrum.chat.enabled))
                    return false
                return true
            }
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