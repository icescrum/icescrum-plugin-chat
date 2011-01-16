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
            emoticonsDir : null,
            currentStatus : {
                show:'online',
                presence:null
            },
            i18n:{
                me:'me',
                alertNewMessages:'new messages',
                customStatusError:'Error while trying to save your status',
                connectionError:'Error chat server is offline.',
                connecting:'Connecting...',
                loginError:'Connection to chat server failed, please check your login / password.',
                disconnected:'You are disconnected from chat server.',
                connected:'Your are connected on chat server.',
                teamNonIcescrum:'External contacts'
            }
        },

        o:{},

        // Initialisation de la connexion
        init:function(options) {
            $.icescrum.debug(true);
            //Initialise l'object o avec les attributs/valeurs de default
            this.o = jQuery.extend({}, this.defaults, options);
            this._nbMaxChat();
            $(window).bind('resize.chat', function (){
                $.icescrum.chat._nbMaxChat();
            }).trigger('resize');
            this.o.sendPresence = true;
            $.icescrum.emoticons.initialize(this.o.emoticonsDir);
            if ($.icescrum.chat.o.currentStatus.show != 'disc'){
                this._initConnect();
            }else{
                this._disconnected();
            }
        },

        _initConnect:function(){
            this.o.connection = new Strophe.Connection("http://"+this.o.server+":"+this.o.port+"/http-bind/");

            $("#chatstatus-button .ui-selectmenu-status").text(this.o.i18n.connecting);
            $("#chatstatus-button").removeClass('ui-chat-status-away ui-chat-status-chat ui-chat-status-online ui-chat-status-xa ui-chat-status-dnd').addClass('ui-chat-select ui-chat-status-offline');
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

        _nbMaxChat : function(){
            $.icescrum.chat.o.maxChats= Math.floor($(window).width()/($.icescrum.chat.o.width+$.icescrum.chat.o.gap ));
            if($.icescrum.chat.o.showList.length >= $.icescrum.chat.o.maxChats){
                for(var i = 0; i < ($.icescrum.chat.o.showList.length - $.icescrum.chat.o.maxChats); i ++){
                     var id = $.icescrum.chat.o.showList[0];
                     $.icescrum.chat.closeChat(id);
                }
            }
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
            }
        },

        _disconnected:function(){
            $("#chatstatus").selectmenu("value",$("#chatstatus option:last").index());
            $('.ui-chat-status')
                    .removeClass('ui-chat-status-away ui-chat-status-xa ui-chat-status-dnd ui-chat-status-chat')
                    .addClass('ui-chat-status-offline');
            $.icescrum.chat.o.connected = false;
            $.icescrum.chat.displayRoster();
            $(window).trigger("disconnected");
            $('#chat-roster-list').html('');
            $('.nb-contacts').html('');
        },

        _connected:function(){
            this._retrieveRoster();
            $.icescrum.chat.o.connection.addHandler($.icescrum.chat._onPresenceChange, null, 'presence', null, null,  null);
            $.icescrum.chat.o.connection.addHandler($.icescrum.chat._onReceiveMessage, null, 'message', null, null,  null);
            $.icescrum.chat.o.connection.addHandler($.icescrum.chat._onReceiveServiceDiscoveryGet, null, 'iq', 'get', null, null);
            $.icescrum.chat.o.connection.addTimedHandler(4000,$.icescrum.chat._onPeriodicPauseStateCheck);
            $.icescrum.chat.o.connected = true;

            if($.icescrum.chat.o.sendPresence){
                var found = false;
                if ($.icescrum.chat.o.currentStatus.show != null &&  $.icescrum.chat.o.currentStatus.presence != null){
                    $('#chatstatus .ui-chat-status-'+$.icescrum.chat.o.currentStatus.show).each(function(){
                        if($(this).text() == $.icescrum.chat.o.currentStatus.presence){
                            $("#chatstatus").selectmenu('value',$(this).index());
                            found = true;
                        }
                    });
                }
                if (found){
                    $.icescrum.chat.changeStatus($.icescrum.chat.o.currentStatus.presence,$.icescrum.chat.o.currentStatus.show,false);
                }else{
                    $("#chatstatus").selectmenu("value",$("#chatstatus option:first").index());
                    $.icescrum.chat.o.connection.send($pres().tree());
                }
                $("#chatstatus-button").removeClass('ui-chat-status-offline');
            }

            console.log("[icescrum-chat] Connected ready to chat");
            $.icescrum.chat._editableSelectList();
            $(window).trigger("connected");
        },

        // Traitement de la reception d'un message :
        // - ouverture de la fenêtre de chat
        // - ajout du message à la fenêtre
        // - prend en compte le changement d'état
        _onReceiveMessage:function(msg){
            var escapedJid = $.icescrum.chat.escapeJid(Strophe.getBareJidFromJid(msg.getAttribute('from')));
            var to = msg.getAttribute('to');
            var type = msg.getAttribute('type');
            var body = msg.getElementsByTagName('body');
            var chatId = 'chat-'+escapedJid;
            if (type == "chat") {
                if(body.length > 0) {
                    $.icescrum.chat.createOrOpenChat(chatId,escapedJid,false);
                    $.icescrum.chat._onChatMessage(escapedJid,body);
                }
                if($.icescrum.chat.o.chatList.indexOf(chatId) != -1) {
                    $.icescrum.chat.manageStateReception(msg, escapedJid);
                }
            }
            return true;
        },

        // Ajoute le message à la fenêtre de chat
        _onChatMessage:function(escapedJid,text){
            console.log("[icescrum-chat] Message received from "+$.icescrum.chat.unescapeJid(escapedJid));
            var extractedText = (text[0].text) ? text[0].text : (text[0].textContent) ? text[0].textContent : "";
            var name = $('#chat-user-status-'+escapedJid+' a').attr('firstname') ? $('#chat-user-status-'+escapedJid+' a').attr('firstname') : escapedJid;
            $("#chat-" + escapedJid).chat("option", "chatManager").addMsg(name, extractedText);
        },

        // Permet de d'être informé lors d'un changement de statut
        _onPresenceChange:function(presence){
            var show = $(presence).find('show').text();
            var status = $(presence).find('status').text();
            var escapedJid = $.icescrum.chat.escapeJid(Strophe.getBareJidFromJid($(presence).attr('from')));
            var type = $(presence).attr('type');
            $.icescrum.chat.changeImageStatus(escapedJid, status, show, type);
            return true;
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

        _onPeriodicPauseStateCheck:function(){
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
                        var escapedJid = chatId.split("-")[1];
                        $.icescrum.chat.sendState(escapedJid,"paused");
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
                jabberList.push({rawJid:$(this).attr('jid'), name:$(this).attr('name')});
            });
            $.icescrum.chat.mergeContactLists(jabberList,true);
        },

        _editableSelectList:function(){
            $('#chatstatus-button .ui-selectmenu-status')
            .bind('mousedown click keydown', function(event){
                event.stopPropagation();
                return false;
            })
            .editable($.icescrum.chat.customPresence,{
              type : 'statut-editable',
              onsubmit:function(settings,original){
                if($(this).find('input').val() == '' || $(this).find('input').val() == original.revert){
                  original.reset();
                  return false;
                }
              },
              width:'75px',
              select:true,
              height:'10px',
              onblur:'submit'
            });
        },

        insertEmoticon:function(escapedJid, pemot){
            var content = $("#ui-chat-input-box-"+escapedJid).val();
            var posCur = $("#ui-chat-input-box-"+escapedJid).caret().start;
            if(posCur != 0 && content.charAt(posCur-1) != " "){
                $("#ui-chat-input-box-"+escapedJid).val(content.substr(0, posCur) + " ");
            }else{
                $("#ui-chat-input-box-"+escapedJid).val(content.substr(0, posCur));
            }
            $("#ui-chat-input-box-"+escapedJid).val($("#ui-chat-input-box-"+escapedJid).val() + pemot);
            if(content.charAt(posCur) != " "){
                $("#ui-chat-input-box-"+escapedJid).val($("#ui-chat-input-box-"+escapedJid).val() + " ");
            }
            $("#ui-chat-input-box-"+escapedJid).val($("#ui-chat-input-box-"+escapedJid).val() + content.substr(posCur, content.length));
            $("#ui-chat-input-box-"+escapedJid).focus();

        },

        // Création ou ouverture du chat
        createOrOpenChat:function(id,escapedJid,toggle) {
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
                            alert : this.o.i18n.alertNewMessages,
                            escapedJid : escapedJid,
                            status : $('#chat-user-status-'+escapedJid).attr('status') ? $('#chat-user-status-'+escapedJid).attr('status') : 'offline',
                            hidden : false,
                            width : this.o.width,
                            title : $('#chat-user-status-'+escapedJid+' a').attr('name') ? $('#chat-user-status-'+escapedJid+' a').attr('name') : escapedJid,
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

        // Envoie msg au jid
        // et ajoute msg à la fenêtre de chat correspondant
        // Pourquoi id en parametre ? -> c'est l'ui qui envoie l'id de la fenetre ca peut être utile..
        sendMessage:function(id, escapedJid, msg){
            var rawJid = $.icescrum.chat.unescapeJid(escapedJid)
            var message = $msg({type: 'chat', to: rawJid})
                                                .c('body').t(msg)
                                                .up().c('active', {xmlns:'http://jabber.org/protocol/chatstates'});
            $.icescrum.chat.o.connection.send(message.tree());
            $("#chat-" + escapedJid).chat("option", "chatManager").addMsg($.icescrum.chat.o.i18n.me, msg);
            console.log("[icescrum-chat] Message sent to "+rawJid);
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

        presenceChanged:function(presence, show){
            if(show == 'disc'){
                $.icescrum.chat.changeStatus(presence, show, false);
                $.icescrum.chat.o.connection.flush();
                $.icescrum.chat.o.connection.disconnect();
                $.icescrum.chat._disconnected();
            }else{
                if(!$.icescrum.chat.o.connected){
                     $.icescrum.chat._initConnect();
                }
                else{
                    $.icescrum.chat.changeStatus(presence, show, false);
                }
            }
        },

        truncate:function(string, size){
            if(string.length>(size-1))
                return string.substring(0,size)+"...";
            else
                return string;
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

        // Permet de modifier le statut
        // presence : message du status
        // show : chat, away, dnd, xp
        changeStatus:function(presence, show, saveCustom){
            var pres;
            if (show == 'disc'){
                pres = $pres({type: "unavailable"});
            }
            else if(show!= "online"){
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
            $.icescrum.chat.o.currentStatus.show = show;
            $.icescrum.chat.o.currentStatus.presence = presence;
            $.icescrum.chat.o.connection.send(pres.tree());
            $.ajax({type:'POST',
                global:false,
                data:'custom='+saveCustom+'&show='+show+'&presence='+presence,
                url: $.icescrum.o.grailsServer + '/chat/saveStatus',
                error:function() {
                    $.icescrum.renderNotice($.icescrum.chat.o.i18n.customStatusError,'error');
                }
            });
        },

        // Change l'image et le tooltip du statut
        changeImageStatus:function(escapedJid, status, show, type){
            var image = $('.ui-chat-user-status-'+escapedJid);
            if(type == 'unavailable'){
                image.removeClass();
                $('#chat-user-status-'+escapedJid).attr('status','offline');
                image.addClass("ui-chat-user-status-"+escapedJid+" ui-chat-status ui-chat-status-offline");
                image.attr('title', '');
            } else {
                if(show.length > 0){
                    image.removeClass();
                    $('#chat-user-status-'+escapedJid).attr('status',show);
                    image.addClass("ui-chat-user-status-"+escapedJid+" ui-chat-status ui-chat-status-"+show);
                }
                if(show.length == 0){
                    $('#chat-user-status-'+escapedJid).attr('status','chat');
                    image.addClass("ui-chat-user-status-"+escapedJid+" ui-chat-status ui-chat-status-online");
                }
            }
            if(status.length > 0){
                image.attr('title', status);
            } else {
                image.attr('title', '');
            }
        },

        // Envoie le stanza qui indique un changement d'état
        sendState:function(escapedJid, state) {
            var rawJid = $.icescrum.chat.unescapeJid(escapedJid);
            var composingStateMessage = $msg({type: 'chat', to: rawJid})
                                        .c(state, {xmlns:'http://jabber.org/protocol/chatstates'});
            $.icescrum.chat.o.connection.send(composingStateMessage.tree());
            console.log("[icescrum-chat] " + state +  " state sent to " + rawJid);
        },

        // Gère la reception de chat states
        manageStateReception:function(msg, escapedJid){
            var state = '';
            var manager= $("#chat-" + escapedJid).chat("option", "chatManager");
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
                console.log("[icescrum-chat] " + $.icescrum.chat.unescapeJid(escapedJid) + " is " + state);
        },

        mergeContactLists:function(jabberList,displayExternalContacts) {
            var teamList = $.parseJSON($.icescrum.chat.o.teamList);
            console.log("[icescrum-chat] Merging team members and jabber roster");
            $.icescrum.chat.addTeamContacts(teamList,jabberList);
            if(displayExternalContacts) {
                $.icescrum.chat.addJabberContacts(teamList,jabberList);
            }
            $.icescrum.chat.putContactLinks();
            $.icescrum.chat.finalizeContactList();
        },

        addTeamContacts:function(teamList, jabberList){
           $(teamList).each(function () {
                var teamid = this.teamid;
                $('#chat-roster-list').append('<ul class="chat-group" id="team-'+teamid+'"><span class="chat-group-title">'+this.teamname+'</span>');
                $(this.users).each(function(){
                    var user = this;
                    $(jabberList).each(function () {
                        if(Strophe.getNodeFromJid(this.rawJid) == user.username && Strophe.getDomainFromJid(this.rawJid) == $.icescrum.chat.o.server) {
                            $.icescrum.chat.addTeamContact(this.rawJid,user, teamid);
                        }
                    });
                });
                $('#chat-roster-list').append('</ul>');
            });
        },

        addJabberContacts:function(teamList, jabberList) {
            $('#chat-roster-list').append('<ul class="chat-group" id="team-non-icescrum"><span class="chat-group-title">'+$.icescrum.chat.o.i18n.teamNonIcescrum+'</span>');
            $(jabberList).each(function(){
                var jabberUser = this;
                if(Strophe.getDomainFromJid(jabberUser.rawJid) != $.icescrum.chat.o.server) {
                   $.icescrum.chat.addJabberContact(jabberUser);
                }
                else {
                    var found = false;
                    $(teamList).each(function(){
                        $(this.users).each(function(){
                            if(this.username == Strophe.getNodeFromJid(jabberUser.rawJid)) {
                                found = true;
                            }
                        });
                    });
                    if(!found) {
                        $.icescrum.chat.addJabberContact(jabberUser);
                    }
                }
            });
        },

        addContact:function(teamid,rawJid,name,firstname) {
            var escapedJid = $.icescrum.chat.escapeJid(rawJid);
            $('#team-'+teamid).append('<li><div id="chat-user-status-' + escapedJid + '" class="ui-chat-user-status-'+escapedJid+' ui-chat-status ui-chat-status-offline" status="offline" title="">' +
								        '<a id="chat-user-'+escapedJid+'" disabled="true" href="javascript:;" class="chat-user-link" jid="'+escapedJid+'" name="'+$.icescrum.chat.truncate(name, 35)+'" firstname="'+firstname+'">' +
                                            $.icescrum.chat.truncate(name, 35) +
                                        '</a>' +
							          '</div></li>');
        },

        addTeamContact:function(rawJid,user,teamid) {
            $.icescrum.chat.addContact(teamid,rawJid,user.firstname +' '+user.lastname,user.firstname)
            $.ajax({
                type: "POST",
                url: $.icescrum.o.grailsServer + '/chat/showToolTip',
                data: 'id=' + user.id + '&escapedJid=' + $.icescrum.chat.escapeJid(rawJid),
                success:function(data) {
                    $('.chat-group').append(data);
                }
            });
        },

        addJabberContact:function(jabberUser){
            var teamid = "non-icescrum";
            var displayedName = jabberUser.name;
            if(displayedName == null || displayedName == 'null') {
                displayedName = Strophe.getNodeFromJid(jabberUser.rawJid);
            }
            displayedName += ' (' + Strophe.getDomainFromJid(jabberUser.rawJid) + ')';
            $.icescrum.chat.addContact(teamid,jabberUser.rawJid,displayedName,displayedName)
        },

        putContactLinks:function() {
            $('.chat-user-link').die('click.chat').live('click.chat',function(event){
                $.icescrum.chat.createOrOpenChat('chat-'+$(this).attr('jid'),$(this).attr('jid'),true);
                event.preventDefault();
            });
        },

        finalizeContactList:function() {
            var nbContacts = 0;
            $('.chat-group').each(function(){
               var nbTeamContacts = $(this).find('li').length;
               if(nbTeamContacts == 0) {
                   $(this).remove();
               }
               else{
                   nbContacts += nbTeamContacts;
               }
            });
            $('.nb-contacts').html('('+nbContacts+')');
        },

        customPresence:function(val,settings){
            var presList = ['online','dnd','away'];
            if($("#chatstatus .status-custom").length < 6){
                var selected;
                for(pres in presList){
                    var newpres = $('<option></option>')
                        .attr("value", presList[pres])
                        .text(val)
                        .addClass("ui-chat-select ui-chat-status-"+presList[pres]+" status-custom");
                    if ($('#chatstatus-button').hasClass("ui-chat-status-"+presList[pres])){
                        selected = newpres;
                    }
                    $('#chatstatus .ui-chat-select.ui-chat-status-'+presList[pres]).not('.status-custom').last().after(newpres);
                }
                var opts = $("#chatstatus").selectmenu('settings');
                $("#chatstatus").selectmenu('destroy');
                $("#chatstatus").selectmenu(opts);
                $("#chatstatus").selectmenu('value',selected.index());
            }else{
                for(pres in presList){
                    $('#chatstatus .status-custom.ui-chat-select.ui-chat-status-'+presList[pres]+':last').text(
                        $('#chatstatus .status-custom.ui-chat-select.ui-chat-status-'+presList[pres]+':first').text()
                    );
                    $('#chatstatus .status-custom.ui-chat-select.ui-chat-status-'+presList[pres]+':first').text(val);
                    $('#chatstatus-menu .status-custom.ui-chat-select.ui-chat-status-'+presList[pres]+' a:last').text(
                        $('#chatstatus-menu .status-custom.ui-chat-select.ui-chat-status-'+presList[pres]+' a:first').text()
                    );
                    $('#chatstatus-menu .status-custom.ui-chat-select.ui-chat-status-'+presList[pres]+' a:first').text(val);
                }
            }
            $.icescrum.chat.changeStatus(val, $("#chatstatus").find('option:selected').val(),true);
            $.icescrum.chat._editableSelectList();
            return val;
        },

        escapeJid:function(rawJid) {
            return rawJid.replace(/\./g,'_point_').replace(/@/g,'_at_');
        },

        unescapeJid:function(escapedJid) {
            return escapedJid.replace(/_point_/g,'.').replace(/_at_/g,'@');
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