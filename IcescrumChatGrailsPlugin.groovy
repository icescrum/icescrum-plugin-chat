class IcescrumChatGrailsPlugin {
    // the plugin version
    def version = "0.1"
    // the version or versions of Grails the plugin is designed for
    def grailsVersion = "1.3.5 > *"
    // the other plugins this plugin depends on
    def dependsOn = [:]
    // resources that are excluded from plugin packaging
    def pluginExcludes = [
            "grails-app/views/error.gsp"
    ]

    def loadAfter = ['icescrum-plugin-management']

    // TODO Fill in these fields
    def author = "Your name"
    def authorEmail = ""
    def title = "Plugin summary/headline"
    def description = '''\\
Brief description of the plugin.
'''

    // URL to the plugin's documentation
    def documentation = "https://www.kagilum.com/documentation/icescrum-pro/#icescrum-pro-features"

    def doWithWebDescriptor = { xml ->
        // TODO Implement additions to web.xml (optional), this event occurs before
    }

    def doWithSpring = {

        println '\nConfiguring iceScrum plugin chat ...'

        if (!application.config.icescrum.chat){
            application.config.icescrum.chat.resource="icescrum"
            application.config.icescrum.chat.enabled=true
            application.config.icescrum.chat.facebook.apiKey = ''
            application.config.icescrum.chat.gtalk.apiKey = '278165454749.apps.googleusercontent.com'
            application.config.icescrum.chat.live.apiKey = ''
            application.config.icescrum.chat.bosh.server = "www.icescrum.org"
            application.config.icescrum.chat.bosh.port = 80
            application.config.icescrum.chat.bosh.path = "/bosh"
            application.config.icescrum.chat.bosh.secured = false
        }

        application.config.publicSettings = application.config.publicSettings ?: [:]
        application.config.publicSettings.chat = [[key:'icescrum.chat.enabled',type:'checkbox'],
                                [key:'icescrum.chat.bosh.server',type:'string',required:true],
                                [key:'icescrum.chat.bosh.port',type:'integer',required:true],
                                [key:'icescrum.chat.bosh.path',type:'string',required:true],
                                [key:'icescrum.chat.bosh.secured',type:'checkbox',required:true],
                                [key:'icescrum.chat.resource',type:'string',required:true],
                                [key:'icescrum.chat.facebook.apiKey',type:'string'],
                                [key:'icescrum.chat.live.apiKey',type:'string'],
                                [key:'icescrum.chat.gtalk.apiKey',type:'string']]

        println '... finished configuring iceScrum plugin chat'
    }

    def doWithDynamicMethods = { ctx ->
        // TODO Implement registering dynamic methods to classes (optional)
    }

    def doWithApplicationContext = { applicationContext ->
        // TODO Implement post initialization spring config (optional)
    }

    def onChange = { event ->
        // TODO Implement code that is executed when any artefact that this plugin is
        // watching is modified and reloaded. The event contains: event.source,
        // event.application, event.manager, event.ctx, and event.plugin.
    }

    def onConfigChange = { event ->
        // TODO Implement code that is executed when the project configuration changes.
        // The event is the same as for 'onChange'.
    }
}
