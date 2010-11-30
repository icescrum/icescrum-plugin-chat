(function($) {
    $.icescrum.chat = {

        // Valeurs par défaut de la config du chat
        // Ces valeurs peuvent être mise à jour à l'execution
        // par l'appel du Tag loadChatJSContext à partir du fichier DefaultChatConfig
        defaults:{
            server : null,
            port : 7070,
            connection : null,
            connected : false,
            width : 210,
            gap : 20,
            sendPresence:true,
            maxChats : 5,
            status : "#chat-status",
            chatList : new Array(),
            showList : new Array(),
            teamList : null,
            i18n:{
                me:'me',
                connectionError:'Error chat server is offline.',
                connecting:'Connection to chat server in progress.',
                loginError:'Connection to chat server failed, please check your login / password.',
                disconnected:'You are disconnected from chat server.',
                connected:'Your are connected on chat server.'
            }
        },

        o:{},

        // Initialisation de la connexion
        init:function(options) {
            // Initialise l'object o avec les attributs/valeurs de default
            this.o = jQuery.extend({}, this.defaults, options);
            this._nbMaxChat();
            $(window).bind('resize.chat', function (){
                $.icescrum.chat._nbMaxChat();
            }).trigger('resize');
            this.o.sendPresence = true;
            this.initConnect();
        },

        initConnect:function(){

            this.o.connection = new Strophe.Connection("http://"+this.o.server+":"+this.o.port+"/http-bind/");
            console.log("[icescrum-chat] Connecting to server...");
            if (this.o.connection == null){
                console.log("[icescrum-chat] Error not connected to server");
                $.icescrum.renderNotice(this.o.i18n.connectionError,'error');
            }
            console.log("[icescrum-chat] Login from iceScrum server");
            $.ajax({type:'POST',
                global:false,
                url: $.icescrum.o.grailsServer + '/chat/attachConnection',
                success:function(data) {
                    data = $.parseJSON(data);
                    console.log("[icescrum-chat] Attaching connection");
                    $.icescrum.chat.o.connection.attach(data.jid, data.sid,parseInt(data.rid) + 1, $.icescrum.chat._connectionHandler);
                },
                error:function() {
                    $.icescrum.renderNotice($.icescrum.chat.o.i18n.loginError,'error');
                    $.icescrum.chat._disconnected();
                    console.log("[icescrum-chat] Error connection not attached");
                }
            });
        },

        // Création ou ouverture du chat
        createOrOpenChat:function(id,user,toggle) {
            var idx1 = this.o.showList.indexOf(id);
            var idx2 = this.o.chatList.indexOf(id);
            // Si le chat est dans la showList
            // et que le toggle est à true
            // => minimise le chat
            if(idx1 != -1){
                if (toggle != undefined && toggle){
                    var managerd = $("#"+id).chat("option", "chatManager");
                    managerd.minimize();
                }
            }
            // Si le chat n'est pas dans la showList
            // et qu'il est dans la chatList
            // lance la fenêtre à l'offset courant
            // l'affiche et l'ajoute à la showList
            else if(idx2 != -1) {
                $("#"+id).chat("option", "offset", this._getNextOffset());
                var manager = $("#"+id).chat("option", "chatManager");
                manager.toggleChat();
                this.o.showList.push(id);
            }
            // Si le chat n'a jamais été ouvert
            // créé le chat avec ses paramètres
            // et l'ajoute à la showList et chatList
            else{
                var el = document.createElement('div');
                el.setAttribute('id', id);
                $(el).chat({id : id,
                            username : user,
                            status : $('#chat-user-status-'+user).attr('status'),
                            hidden : false,
                            width : this.o.width,
                            title : user,
                            offset : this._getNextOffset(),
                            messageSent : this.sendMessage,
                            chatClosed : this.closeChat,
                            stateSent : this.sendState
                      });
                this.o.chatList.push(id);
                this.o.showList.push(id);
            }
            if(this.o.showList.length>this.o.maxChats)  {
                     var idd = $.icescrum.chat.o.showList[0];
                     $.icescrum.chat.closeChat(idd);
            }
        },

        // Envoie msg à username
        // et ajoute msg à la fenêtre de chat correspondant
        // Pourquoi id en parametre ? -> c'est l'ui qui envoie l'id de la fenetre ca peut être utile..
        sendMessage:function(id, username, msg){
            var message = $msg({type: 'chat', to: username+'@'+$.icescrum.chat.o.server})
                                                .c('body').t(msg)
                                                .up().c('active', {xmlns:'http://jabber.org/protocol/chatstates'});
            $.icescrum.chat.o.connection.send(message.tree());
            $("#chat-" + username).chat("option", "chatManager").addMsg($.icescrum.chat.o.i18n.me, msg);
            console.log("[icescrum-chat] Message sent to "+username+'@'+$.icescrum.chat.o.server);
        },

        // Ferme le chat id s'il est ouvert
        // En le retirant de la showList
        // Puis décale les fenêtres qui étaient à sa gauche
        closeChat:function(id) {
            var idx = $.icescrum.chat.o.showList.indexOf(id);
            $("#" + $.icescrum.chat.o.showList[idx]).chat("option", "hidden", true);
            if(idx != -1) {
                $.icescrum.chat.o.showList.splice(idx, 1);
                var diff = $.icescrum.chat.o.width + $.icescrum.chat.o.gap;
                for(var i = idx; i < $.icescrum.chat.o.showList.length; i++) {
                    var offset = $("#" + $.icescrum.chat.o.showList[i]).chat("option", "offset");
                    $("#" + $.icescrum.chat.o.showList[i]).chat("option", "offset", offset - diff);


                }
            }
        },

        _nbMaxChat : function(){
            $.icescrum.chat.o.maxChats= Math.floor($(window).width()/($.icescrum.chat.o.width+$.icescrum.chat.o.gap ));
            if($.icescrum.chat.o.showList.length >= $.icescrum.chat.o.maxChats){
                for(var i = 0; i < ($.icescrum.chat.o.showList.length - $.icescrum.chat.o.maxChats); i ++){
                     var id = $.icescrum.chat.o.showList[0];
                     $.icescrum.chat.closeChat(id);
                }
            }
        },

        presenceChanged:function(presence, show){
            if(show == 'disc'){
                $.icescrum.chat.o.connection.send($pres({type: "unavailable"}));
                 $.icescrum.chat.o.connection.flush();
                 $.icescrum.chat.o.connection.disconnect();
            }else
            {
                if(!$.icescrum.chat.o.connection.connected){
                     $(window).bind("connected", function(){
                                    $.icescrum.chat.changeStatus(presence, show);
                                    $(window).unbind("connected");
                     });
                     $.icescrum.chat.o.sendPresence = false;
                     $.icescrum.chat.initConnect();
                }
                else{
                    $.icescrum.chat.changeStatus(presence, show);
                }
            }
        },

        truncate:function(string, size){
            if(string.length>(size-1))
                return string.substring(0,size)+"...";
            else
                return string;
        },

        // Extrait le userName du JID
        // existe peut être-déjà ?
        // http://code.stanziq.com/strophe/strophejs/doc/1.0.1/files/core-js.html#Strophe.getNodeFromJid
        _retrieveUsername:function(jid){
            return jid.split('@')[0];
        },

        // Retourne le décalage absolu par rapport au bord droit
        // pour positionner la prochaine fenêtre
        _getNextOffset:function() {
            return (this.o.width + this.o.gap) * this.o.showList.length;
        },

        // Traitement du retour de la connexion
        _connectionHandler:function(status){
            if (status == Strophe.Status.CONNECTING) {
                $.icescrum.renderNotice($.icescrum.chat.o.i18n.connecting,'notice');
            } else if (status == Strophe.Status.CONNFAIL) {
                $.icescrum.chat._disconnected();
            } else if (status == Strophe.Status.DISCONNECTED) {
                $.icescrum.chat._disconnected();
            } else if (status == Strophe.Status.CONNECTED || status == Strophe.Status.ATTACHED) {
                $.icescrum.chat._connected();
                var pres = $.cookie("presence");
                var show = $.cookie("show");
                if(show != null || pres != null){
                    $.icescrum.chat.changeStatus(pres, show);
                    if(show == "dnd"){
                         $("#chatstatus").selectmenu("value", 1);
                    } else if(show == "away" || show == "xa"){
                         $("#chatstatus").selectmenu("value", 2);
                    }
                }
            }
        },

        _disconnected:function(){
            $("#chatstatus").selectmenu("value", 3);
            $('.ui-chat-status')
                    .removeClass('ui-chat-status-away ui-chat-status-xa ui-chat-status-dnd ui-chat-status-chat')
                    .addClass('ui-chat-status-offline');
            $.icescrum.chat.o.connected = false;
            $.icescrum.chat.displayRoster();
            $(window).trigger("disconnected");
        },

        _connected:function(){
            this._retrieveRoster();
            $.icescrum.chat.o.connection.addHandler($.icescrum.chat._onPresenceChange, null, 'presence', null, null,  null);
            $.icescrum.chat.o.connection.addHandler($.icescrum.chat._onReceiveMessage, null, 'message', null, null,  null);
            $.icescrum.chat.o.connection.addHandler($.icescrum.chat._onReceiveServiceDiscoveryGet, null, 'iq', 'get', null, null);
            $.icescrum.chat.o.connection.addTimedHandler(4000,$.icescrum.chat._onPeriodicPauseStateCheck);
            $.icescrum.chat.o.connected = true;
            if($.icescrum.chat.o.sendPresence){
                $.icescrum.chat.o.connection.send($pres().tree());
            }
            console.log("[icescrum-chat] Connected ready to chat");
            $(window).trigger("connected");
        },

        displayRoster:function(){
            if ($.icescrum.chat.o.connected){
                if ($('#chat-roster-list').is(':hidden')){
                    $('#chat-roster-list').show();
                    $('#chat-list-hide').css('display','block');
                    $('#chat-list-show').hide();
                }else{
                    $('#chat-roster-list').hide();
                    $('#chat-list-hide').hide();
                    $('#chat-list-show').css('display','block');
                }
            }else{
                $('#chat-roster-list').hide();
                $('#chat-list-hide').hide();
                $('#chat-list-show').css('display','block');
            }
        },

        // Traitement de la reception d'un message :
        // - ouverture de la fenêtre de chat
        // - ajout du message à la fenêtre
        // - prend en compte le changement d'état
        _onReceiveMessage:function(msg){
            var from = msg.getAttribute('from');
            var to = msg.getAttribute('to');
            var type = msg.getAttribute('type');
            var body = msg.getElementsByTagName('body');
            var username = $.icescrum.chat._retrieveUsername(from);
            var chatId = 'chat-'+username;
            if (type == "chat") {
                if(body.length > 0) {
                    $.icescrum.chat.createOrOpenChat(chatId,username,false);
                    $.icescrum.chat._onChatMessage(username,body);
                }
                if($.icescrum.chat.o.chatList.indexOf(chatId) != -1) {
                    $.icescrum.chat.manageStateReception(msg, username);
                }
            }
            return true;
        },

        // Ajoute le message à la fenêtre de chat
        _onChatMessage:function(from,text){
            console.log("[icescrum-chat] Message received from "+from);
            var extractedText = (text[0].text) ? text[0].text : (text[0].textContent) ? text[0].textContent : "";
            $("#chat-" + from).chat("option", "chatManager").addMsg(from, extractedText);
        },

        // Permet de modifier le statut
        // presence : message du status
        // show : chat, away, dnd, xp
        changeStatus:function(presence, show){
            var pres;
            if(show!= "online"){
            pres = $pres()
                    .c('status')
                        .t(presence).up()
                    .c('show')
                        .t(show);
            } else {
                pres = $pres()
                    .c('status')
                        .t(presence).up();
            }
            $.icescrum.chat.o.connection.send(pres.tree());
            $.cookie("show", show);
            $.cookie("presence", presence);
            console.log(pres);
        },

        // Permet de d'être informé lors d'un changement de statut
        _onPresenceChange:function(presence){
            var show = $(presence).find('show').text();
            var status = $(presence).find('status').text();
            var from = $(presence).attr('from');
            var type = $(presence).attr('type');
            var username = from.split('@')[0];
            console.log(presence);
            $.icescrum.chat.changeImageStatus(username, status, show, type);

            return true;
        },

        // Change l'image et le tool tip du statut
        changeImageStatus:function(username, status, show, type){
            var image = $('.ui-chat-user-status-'+username);
            if(type == 'unavailable'){
                image.removeClass();
                $('#chat-user-status-'+username).attr('status','offline');
                image.addClass("ui-chat-user-status-"+username+" ui-chat-status ui-chat-status-offline");
                image.attr('title', '');
            } else {
                if(show.length > 0){
                    image.removeClass();
                    $('#chat-user-status-'+username).attr('status',show);
                    image.addClass("ui-chat-user-status-"+username+" ui-chat-status ui-chat-status-"+show);
                }
                if(show.length == 0){
                    $('#chat-user-status-'+username).attr('status','chat');
                    image.addClass("ui-chat-user-status-"+username+" ui-chat-status ui-chat-status-online");
                }
            }
            if(status.length > 0){
                image.attr('title', status);
            } else {
                image.attr('title', '');
            }
        },

        // Envoie le stanza qui indique un changement d'état
        sendState:function(username, state) {
            var composingStateMessage = $msg({type: 'chat', to: username+'@'+$.icescrum.chat.o.server})
                                        .c(state, {xmlns:'http://jabber.org/protocol/chatstates'});
            $.icescrum.chat.o.connection.send(composingStateMessage.tree());
            console.log("[icescrum-chat] " + state +  " state sent to " + username);
        },

        // Traite la reception d'un stanza de demande de découverte de services
        // en indiquant le support du service chat states
        _onReceiveServiceDiscoveryGet:function(iq){
            var to = iq.getAttribute('from');
            var query = iq.getElementsByTagName('query')[0].namespaceURI;
            if(query == 'http://jabber.org/protocol/disco#info') {
                var serviceDiscoveryResult = $iq({type:'result', to: to})
                                            .c('query', {xmlns:'http://jabber.org/protocol/disco#info'})
                                            .c('feature', {'var':'http://jabber.org/protocol/chatstates'});
                console.log("[icescrum-chat] Receiving service discovery get, result: \n" + serviceDiscoveryResult.toString());
                $.icescrum.chat.o.connection.send(serviceDiscoveryResult.tree());
                return true;
            }
        },

        // Gère la reception de chat states
        manageStateReception:function(msg, username){
            var state = '';
            var manager= $("#chat-" + username).chat("option", "chatManager");
            if(msg.getElementsByTagName('active').length > 0) {
                 state = 'active';
                 manager.hideComposing();
                 manager.hidePaused();
            }
            else if(msg.getElementsByTagName('composing').length > 0) {
                 state = 'composing';
                 manager.hidePaused();
                 manager.showComposing();

            }
            else if(msg.getElementsByTagName('paused').length > 0) {
                 state = 'paused';
                 manager.hideComposing();
                 manager.showPaused();

            }
            else if(msg.getElementsByTagName('gone').length > 0 || msg.getElementsByTagName('inactive').length > 0) {
                 state = 'gone/inactive';
                 manager.hideComposing();
                 manager.hidePaused();
            }
            if(state != '')
                console.log("[icescrum-chat] " + username + " is " + state);
        },

        _onPeriodicPauseStateCheck:function(){
            console.log("[icescrum-chat] check the paused chat windows");
            var chatKey;
            for(chatKey in $.icescrum.chat.o.chatList){
                var chatId = $.icescrum.chat.o.chatList[chatKey];
                var isComposing = $("#"+chatId).chat("option","isComposing");
                if(isComposing){
                    var hasChanged = $("#"+chatId).chat("option","hasChanged");
                    if(hasChanged){
                        $("#"+chatId).chat("option","hasChanged", false);
                    }
                    else{
                        var username = chatId.split("-")[1];
                        $.icescrum.chat.sendState(username,"paused");
                        $("#"+chatId).chat("option","isComposing", false);
                    }
                }
            }
            return true;
        },


        _retrieveRoster:function() {
            var iq = $iq({type: 'get'}).c('query', {'xmlns':Strophe.NS.ROSTER});
	        console.log("[icescrum-chat] Requesting roster");
	        $.icescrum.chat.o.connection.sendIQ(iq, this._onRosterReceived);
        },

        _onRosterReceived:function(iq) {
            console.log("[icescrum-chat] Receiving roster");
            var jabberList = [];
            $(iq).find("item").each(function() {
                if ($(this).attr('ask')) {
                        return true;
                }
                jabberList.push($.icescrum.chat._retrieveUsername($(this).attr('jid')));
            });
            $.icescrum.chat.mergeContactLists(jabberList);
        },

        mergeContactLists:function(jabberList) {
            var teamListObject = $.parseJSON($.icescrum.chat.o.teamList);
            console.log("[icescrum-chat] Merging team members and jabber roster");
            $(teamListObject).each(function () {
                $('.chat-group').append('<span class="chat-group-title">' + this.teamname+'</span>');
                $(this.users).each(function(){
                    if($.inArray(this.username, jabberList) > -1) {
                        $('.chat-group').append('<li><div id="chat-user-status-' + this.username + '" class="ui-chat-user-status-'+this.username+' ui-chat-status ui-chat-status-offline" status="offline" title="">' +
								'<a id="chat-user-'+this.id+'" disabled="true" href="javascript:;" class="chat-user-link" username="'+this.username+'" name="'+this.name+'">' + this.username +" ("+$.icescrum.chat.truncate(this.name, 20)+")" + '</a>' +
							'</div></li>');
                    }
                    else {
                        console.log("[icescrum-chat] Team member not found in jabber roster : " + this.username + " (" + this.name + ")");
                    }
                });
            });
            $.icescrum.chat.putContactLinks();
        },

        putContactLinks:function() {
            $('.chat-user-link').die('click.chat').live('click.chat',function(event){
                $.icescrum.chat.createOrOpenChat('chat-'+$(this).attr('username'),$(this).attr('username'),true);
                event.preventDefault();
            });
        },

        customPresence:function(val,settings){
            alert(val);
            //Appliquer le statut perso + show + pres
            //Envoyer le statut perso a Jihane ...
            //Ajouter le status a la liste
            return val;
        }
    }
})(jQuery);

jQuery.editable.addInputType('statut-editable', {
    element : function(settings, original) {
            var input = $('<input />');
            input.width(settings.width);
            input.height(settings.height);
            input.bind('mousedown',function(event){event.stopPropagation()}).bind('click',function(event){event.stopPropagation()}).keydown(function(event){event.stopPropagation()});
            $(this).append(input);
            return(input);
        }
});