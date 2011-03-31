entryPoints = {
    entry {
        action 'form'
        controller 'chat'
        ref 'user-openProfile'
        form action:'update', controller:'chat'
    }
}