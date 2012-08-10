import org.icescrum.plugins.chat.ChatUtils
import org.icescrum.core.support.ApplicationSupport

pluginName = 'iceScrumPluginManagement'

uiDefinitions = {

    'chat' {
        widget {
            show{
                if(!request.authenticated || !ApplicationSupport.booleanValue(ChatUtils.chatConfig.icescrum.chat.enabled))
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