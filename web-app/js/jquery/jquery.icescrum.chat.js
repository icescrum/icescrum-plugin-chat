/*
 * Copyright (c) 2011 BE ISI iSPlugins Université Paul Sabatier.
 *
 * This file is part of iceScrum.
 *
 * Chat plugin is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.
 *
 * Chat plugin is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Chat plugin.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Authors:	Claude AUBRY (claude.aubry@gmail.com)
 *		Vincent Barrier (vbarrier@kagilum.com)
 *		Marc-Antoine BEAUVAIS (marcantoine.beauvais@gmail.com)
 *		Jihane KHALIL (khaliljihane@gmail.com)
 *		Paul LABONNE (paul.labonne@gmail.com)
 *		Nicolas NOULLET (nicolas.noullet@gmail.com)
 *		Bertrand PAGES (pages.bertrand@gmail.com)
 *
 *
 */

var flensed={base_path:''};
var icescrumChat;

(function($) {

    $.icescrum.chat = {

        // Valeurs par défaut de la config du chat
        // Ces valeurs peuvent être mise à jour à l'execution
        // par l'appel du Tag loadChatJSContext à partir du fichier DefaultChatConfig
        defaults:{
            server : null,
            port : 7070,
            boshPath:null,
            connection : null,
            connected : false,
            width : 210,
            gap : 20,
            hideOffline:true,
            maxChats : 5,
            disabled: true,
            chatList : new Array(),
            showList : new Array(),
            teamList : null,
            emoticonsDir : null,
            ownjid : null,
            currentStatus : {
                show:'online',
                presence:null
            },
            i18n:{
                me:'me',
                alertNewMessages:'New message from',
                customStatusError:'Error while trying to save your status',
                connectionError:'Error chat server is offline.',
                connecting:'Connecting...',
                loginError:'Connection to chat server failed, please check your login / password.',
                disconnected:'You are disconnected from chat server.',
                connected:'Connected!',
                authenticating:'Authenticating...',
                teamNonIcescrum:'External contacts',
                yes:'Yes',
                no:'No',
                accept:'Accept:',
                requestSent:'Request sent to ',
                requestError:'Error invalid email address',
                authorization:'authorization',
                remove:'remove'
            },
            video:{
                enabled:navigator.webkitGetUserMedia?true:false,
                pc:null,
                initiator:false,
                started:false,
                to:null,
                stream:null
            },
            facebook:false,
            gtalk:false,
            live:false
        },

        o:{},

        // Initialisation de la connexion
        init:function(options) {
            var chat = this;

            var chatWidget = $("#widget-id-chat");
            chatWidget.prependTo($('#widget-list'));

            console.log('[icescrum-chat] init');
            if (typeof icescrumChat === undefined) {
                chat.o = $.extend({}, chat.defaults, options);
            }else{
                chat.o = $.extend({}, chat.defaults, icescrumChat);
            }
            if(chat.o.disabled){
                chatWidget.data('id','chat');
                $.icescrum.closeWidget(chatWidget,true);
                return;
            }
            chat._nbMaxChat();
            $(window).unbind('resize.chat').bind('resize.chat', function (){
                chat._nbMaxChat();
            }).trigger('resize');
            $.icescrum.emoticons.initialize(chat.o.emoticonsDir);
            if (chat.o.currentStatus.show != 'disc'){
                console.log('[icescrum-chat] connecting');
                chat._connect();
            }else{
                console.log('[icescrum-chat] disconnecting');
                chat._disconnected();
            }
        },

        reloadChat:function(){
            var chat = this;
            var chatWidget = $("#widget-id-chat");
            if (chatWidget.size() > 0){
                chatWidget.data('id','chat');
                var close = function(){
                    $.icescrum.closeWidget(chatWidget,true);
                    $('.ui-chat').remove();
                    setTimeout(function(){
                        $.icescrum.addToWidgetBar('chat');
                    }, 500);
                };
                if (chat.o.connected){
                    chat.presenceChanged('','disc', close);
                }else{
                    close();
                }
            }else{
                $.icescrum.addToWidgetBar('chat');
            }
        },

        _connect:function(){
            var chat = this;
            $("#chatstatus-button").removeClass('ui-chat-status-away ui-chat-status-chat ui-chat-status-online ui-chat-status-xa ui-chat-status-dnd').addClass('ui-chat-select ui-chat-status-offline');
            console.log("[icescrum-chat] Connecting to server...");
            //Strophe.log = function (lvl, msg) { console.log(msg); };
            chat.o.connection = new Strophe.Connection("http://"+chat.o.server+":"+chat.o.port+chat.o.boshPath);
            //chat.o.connection.rawInput = function (data) { console.log(data); };
            //chat.o.connection.rawOutput = function (data) { console.log(data); };
            if (chat.o.connection == null){
                console.log("[icescrum-chat] Error not connected to server");
                $.icescrum.renderNotice(chat.o.i18n.connectionError,'error');
            }
            if (chat.o.facebook){
                console.log("[icescrum-chat] OAuth from facebook server");
                chat.o.connection.oauth_facebook_login(chat.o.facebook.apiKey, chat.o.facebook.redirecturi, (chat.o.video.enabled ? 'vid'+chat.o.resource : 'web'+chat.o.resource), chat._connectionCallback.bind(chat), $.cookie('token-oauth-' + $.icescrum.user.id + '-facebook'));
            }else if (chat.o.gtalk){
                console.log("[icescrum-chat] OAuth from gtalk server");
                chat.o.connection.oauth_gtalk_login(chat.o.gtalk.apiKey, chat.o.gtalk.redirecturi, (chat.o.video.enabled ? 'vid'+chat.o.resource : 'web'+chat.o.resource), chat._connectionCallback.bind(chat), $.cookie('token-oauth-' + $.icescrum.user.id + '-gtalk'));
            }else if (chat.o.live){
                console.log("[icescrum-chat] OAuth from live server");
                chat.o.connection.oauth_live_login(chat.o.live.apiKey, chat.o.live.redirecturi, (chat.o.video.enabled ? 'vid'+chat.o.resource : 'web'+chat.o.resource), chat._connectionCallback.bind(chat), $.cookie('token-oauth-' + $.icescrum.user.id + '-live'));
            }
            else{
                console.log("[icescrum-chat] attach connection from iceScrum server & bosh server");
                $.ajax({type:'POST',
                    global:false,
                    data:{video:chat.o.video.enabled},
                    url: $.icescrum.o.grailsServer + '/chat/connection',
                    success:function(data) {
                        console.log("[icescrum-chat] Attaching connection");
                        chat.o.connection.attach(data.jid, data.sid,parseInt(data.rid) + 1, chat._connectionCallback.bind(chat));
                    },
                    error:function() {
                        $.icescrum.renderNotice(chat.o.i18n.loginError,'error');
                        chat._disconnected();
                        console.log("[icescrum-chat] Error connection not attached");
                    }
                });
            }
        },

        // Traitement du retour de la connexion
        _connectionCallback:function(status){
            var chat = this;
            if (status == Strophe.Status.CONNECTING) {
                $("#chatstatus-button .ui-selectmenu-status").text(chat.o.i18n.connecting);
                console.log('connecting');
            } else if (status == Strophe.Status.CONNFAIL || status == Strophe.Status.DISCONNECTED  || status == Strophe.Status.AUTHFAIL) {
                console.log('disconnected');
                chat._disconnected();
            } else if (status == Strophe.Status.AUTHENTICATING) {
                $("#chatstatus-button .ui-selectmenu-status").text(chat.o.i18n.authenticating);
                console.log('authenticating');
            } else if (status == Strophe.Status.CONNECTED || status == Strophe.Status.ATTACHED) {
                $("#chatstatus-button .ui-selectmenu-status").text(chat.o.i18n.connected);
                console.log('connected');
                chat.o.ownjid = chat.o.connection.jid;
                chat._connected();
            }
        },


        _connected:function(){
            var chat = this;
            if (chat.o.facebook || chat.o.gtalk || chat.o.live){
                $.cookie('token-oauth-' + $.icescrum.user.id + '-' + chat.o.connection.oauth_provider, chat.o.connection.oauth_accessToken, {expires : 1});
                $.ajax({
                    type: "POST",
                    url: $.icescrum.o.grailsServer + '/chat/jid',
                    data: 'jid=' + Strophe.getBareJidFromJid(chat.o.ownjid)
                });

            }

            chat.o.connection.addHandler($.icescrum.chat.confirmRequestContact, null, 'presence', 'subscribe', null,  null);
            chat.o.connection.addHandler($.icescrum.chat._onReceiveServiceDiscoveryGet.bind(chat), null, 'iq', 'get', null, null);
            chat.o.connection.addHandler(chat._onReceiveMessage.bind(chat), null, 'message', null, null,  null);
            chat.o.connection.addTimedHandler(4000,chat._onPeriodicPauseStateCheck.bind(chat));
            chat.o.connected = true;

            console.log("[icescrum-chat] retrieve roster");
            chat.o.connection.roster.registerCallback(chat._onRosterChanged.bind(chat));
            chat.o.connection.roster.get(chat._onRosterReceived.bind(chat));

            console.log("[icescrum-chat] send presence");
            var found = false;
            if (chat.o.currentStatus.show != null &&  chat.o.currentStatus.presence != null){
                $('#chatstatus .ui-chat-status-'+chat.o.currentStatus.show).each(function(){
                    if($(this).text() == chat.o.currentStatus.presence){
                        $("#chatstatus").selectmenu('value',$(this).index());
                        console.log("[icescrum-chat] changing presence");
                        found = true;
                    }
                });
            }
            if (found){
                console.log("[icescrum-chat] changing presence bis");
                chat.updateResource(chat.o.currentStatus.presence,chat.o.currentStatus.show,false);
            }else{
                console.log("[icescrum-chat] default presence");
                $("#chatstatus").selectmenu("value",$("#chatstatus option:first").index());
                chat.o.connection.send($pres().tree());
            }
            $("#chatstatus-button").removeClass('ui-chat-status-offline');

            console.log("[icescrum-chat] Connected ready to chat");
            chat._editableSelectList();
            $(window).trigger("connected.chat");
            $(window).unload(function(){
                if (chat.o.video.enabled){
                    if (chat.o.video.started){
                        chat.hangupVideoCall(true);
                    }
                }
                if (chat.o.connected){
                    //chat.o.connection.pause();
                    chat.presenceChanged('','disc');
                }
            });
        },

        _disconnected:function(){
            $("#chatstatus").selectmenu("value",$("#chatstatus option:last").index());
            $('.ui-chat-status')
                    .removeClass('ui-chat-status-away ui-chat-status-xa ui-chat-status-dnd ui-chat-status-chat')
                    .addClass('ui-chat-status-offline');
            this.o.connected = false;
            this.toggleRoster();
            $('.subscription').remove();
            $(window).trigger("disconnected.chat");
            $('#chat-roster-list').html('');
            $('.nb-contacts').html('');
        },

        // Traitement de la reception d'un message :
        // - ouverture de la fenêtre de chat
        // - ajout du message à la fenêtre
        // - prend en compte le changement d'état
        _onReceiveMessage:function(msg){
            var escapedJid = this.escapeJid(Strophe.getBareJidFromJid(msg.getAttribute('from')));
            var to = msg.getAttribute('to');
            var type = msg.getAttribute('type');
            var body = msg.getElementsByTagName('body');
            var chatId = 'chat-'+escapedJid;
            if (type == "chat") {
                if(body.length > 0) {
                    this.createOrOpenChat(chatId,escapedJid,false);
                    this._onChatMessage(escapedJid,body);
                }
            }
            return true;
        },

        _onRosterReceived:function(roster) {
            var chat = this;
            console.log("[icescrum-chat] Receiving roster ");
            var teamList = $.parseJSON(chat.o.teamList);
            chat.addTeamContacts(teamList,roster);
            chat.addExternalContacts(teamList,roster);

            $('.ui-chat-status,.tooltip-chat-user-link').die('click.chat').live('click.chat',function(event){
                $.icescrum.chat.createOrOpenChat('chat-'+$(this).attr('jid'),$(this).attr('jid'),true);
                event.preventDefault();
            });

            var showDelete;
            $('.chat-group li').hover(
                function(){
                    var del = $(this);
                    showDelete = setTimeout(function(){del.find('.chat-delete-contact').show();},500);
                },
                function(){
                    clearTimeout(showDelete);
                    $(this).find('.chat-delete-contact').hide();
                }
            );

            $('.chat-delete-contact').die('click.delete').on('click.delete',function(event){
                $.icescrum.chat.removeContact($(this).parent().attr('jid'));
                event.stopPropagation();
                event.preventDefault();
            });
            chat.displayCounterContacts();
        },

        _onRosterChanged:function(roster, contact){
            if (contact){
                var chat = this;
                console.log("[icescrum-chat] updating contact ");
                $.icescrum.chat.updateContact(contact);
                var resource = contact.highestResource();
                if (resource){
                    console.log("[icescrum-chat] Presence received from "+ contact.jid + " show: " + (resource ? resource.show : '') + " status:" + (resource ? resource.status : '') + "  video feature: "+(resource ? resource.video : 'false'));
                }else{
                    console.log("[icescrum-chat] "+ contact.jid + " is disconnected");
                }
                chat.displayCounterContacts();
            }
        },

        updateContact:function(contact){
            var chat = $.icescrum.chat;
            var escapedJid = chat.escapeJid(contact.jid);
            var resource = contact.highestResource();
            var user = $('.ui-chat-user-status-'+escapedJid);
            var userInList = $('#chat-user-status-'+escapedJid);
            var group = userInList.parent();

            if(!resource){
                $.icescrum.chat.o.hideOffline ? userInList.hide() : userInList.show();
                user.removeClass();
                userInList.data('status','offline');
                user.addClass("grey-status ui-chat-user-status-"+escapedJid+" ui-chat-status ui-chat-status-offline");
                userInList.data('title', '');
            } else {
                if (user.length == 0){
                    var teamList = $.parseJSON(chat.o.teamList);
                    chat.addTeamContacts(teamList,[contact]);
                    chat.addExternalContacts(teamList,[contact]);
                }
                if(resource.show){
                    user.removeClass();
                    if (resource.show == 'xa' || resource.show == 'away'){
                        user.addClass("orange-status");
                    }else if(resource.show == 'dnd'){
                        user.addClass("red-status");
                    }
                    userInList.data('status',resource.show);
                    user.addClass("ui-chat-user-status-"+escapedJid+" ui-chat-status ui-chat-status-"+resource.show+(resource.video?'-video':''));
                }
                if(!resource.show){
                    user.removeClass();
                    userInList.data('status','chat');
                    userInList.data('video',resource.video);
                    user.addClass("green-status ui-chat-user-status-"+escapedJid+" ui-chat-status ui-chat-status-online"+(resource.video?'-video':''));
                }
                user.show();
                if(resource.show){
                    $('.chat-tooltip-right .ui-chat-user-status-text-'+escapedJid).text(resource.status);
                    user.data('title', status);
                } else {
                    user.data('title', '');
                }

                if (resource.video){
                    userInList.data('video',true);
                   if ($("#chat-" + escapedJid).size() > 0)
                        $("#chat-" + escapedJid).chat("option", "chatManager").showVideoButton();
                }else{
                   userInList.data('video',false);
                   if ($("#chat-" + escapedJid).size() > 0)
                        $("#chat-" + escapedJid).chat("option", "chatManager").hideVideoButton();
                }
            }
            //On sort le global
            var sort = $.icescrum.chat.o.hideOffline ? group.find('li').not('ui-chat-status-offline') : group.find('li');
            sort.sortElements(function(a,b){
                var statusA = $(a);
                var statusB = $(b);
                var valA = statusA.hasClass('green-status') ? 2 : statusA.hasClass('red-status') ? 1 : statusA.hasClass('orange-status') ? 0 : -1;
                var valB = statusB.hasClass('green-status') ? 2 : statusB.hasClass('red-status') ? 1 : statusB.hasClass('orange-status') ? 0 : -1;
                return valA < valB ? 1 : -1;
            });
            group.find('li.green-status').sortElements(function(a,b){return $(a).text().toUpperCase() > $(b).text().toUpperCase() ? 1 : -1;});
            group.find('li.red-status').sortElements(function(a,b){return $(a).text().toUpperCase() > $(b).text().toUpperCase() ? 1 : -1;});
            group.find('li.orange-status').sortElements(function(a,b){return $(a).text().toUpperCase() > $(b).text().toUpperCase() ? 1 : -1;});
            if (!$.icescrum.chat.o.hideOffline){
                group.find('li.grey-status').sortElements(function(a,b){ return $(a).text().toUpperCase() > $(b).text().toUpperCase() ? 1 : -1;});
            }
            if (group.length > 0){
                var titleGroup = group.children('span').text();
                titleGroup = titleGroup.replace(/([0-9]*\/[0-9]*)/g,group.find('li').not('.grey-status').length+'/'+group.find('li').length);
                group.children('span').text(titleGroup);
            }
        },

        addTeamContacts:function(teamList, roster){
           var chat = this;
           $(teamList).each(function () {
                this.users = this.users.sort(function(a, b){return a.firstname > b.firstname ? 1 : -1;});
                var teamid = this.teamid;
                $('#chat-roster-list').append('<ul class="chat-group" id="team-'+teamid+'"><span class="chat-group-title">'+this.teamname+' (0/0)</span>');
                $(this.users).each(function(){
                    var user = this;
                    $(roster).each(function () {
                        if(this.jid == user.jid) {
                            $.icescrum.chat.addTeamContact(this.jid,user, teamid);
                        }else if(Strophe.getDomainFromJid(this.jid) ==chat.o.server){

                        }
                    });
                });
                $('#chat-roster-list').append('</ul>');
            });
        },

        addExternalContacts:function(teamList, roster) {
            var chat = this;
            roster = roster.sort(function(a, b){return a.name > b.name ? 1 : -1;});
            $('#chat-roster-list').append('<ul class="chat-group" id="team-non-icescrum"><span class="chat-group-title">'+chat.o.i18n.teamNonIcescrum+' (0/0)</span>');
            $(roster).each(function(){
                var user = this;
                if(Strophe.getDomainFromJid(user.jid) != chat.o.server) {
                    chat.addExternalContact(user);
                }
                else {
                    var found = false;
                    $(teamList).each(function(){
                        $(this.users).each(function(){
                            if(this.username == Strophe.getNodeFromJid(user.jid)) {
                                found = true;
                                return false;
                            }
                        });
                        if (found){
                            return false;
                        }
                    });
                    if(!found) {
                        chat.addExternalContact(user);
                    }
                }
            });
        },

        addTeamContact:function(jid,user,teamid) {
            var chat = this;
            chat.addContact(teamid,jid,user.firstname +' '+user.lastname,user.firstname);
            $.ajax({
                type: "POST",
                url: $.icescrum.o.grailsServer + '/chat/tooltip',
                data: 'id=' + user.id + '&escapedJid=' + chat.escapeJid(jid),
                success:function(data) {
                    $('.chat-group').append(data);
                }
            });
        },

        addExternalContact:function(user){
            var chat = this;
            var teamid = "non-icescrum";
            var displayedName = user.name;
            if(displayedName == null || displayedName == 'null') {
                displayedName = Strophe.getNodeFromJid(user.jid);
            }
            chat.addContact(teamid,user.jid,displayedName,displayedName)
        },

        addContact:function(teamid,jid,name,firstname) {
            var chat = this;
            var escapedJid = chat.escapeJid(jid);
            if ($('#chat-user-status-' + escapedJid).length == 0){
                $('#team-'+teamid).append('<li id="chat-user-status-' + escapedJid + '" jid="'+escapedJid+'" name="'+$.icescrum.truncate(name, 35)+'" class="ui-chat-user-status-'+escapedJid+' grey-status ui-chat-status ui-chat-status-offline" status="offline" title="">' +
                                            '<a class="chat-user-link">'+$.icescrum.truncate(name, 35)+'</a>' +
                                            '<div class="chat-delete-contact"></div>' +
                                            '</li>');
                $('#chat-user-status-' + escapedJid).data('firstname',firstname);
            }
        },

        displayCounterContacts:function() {
            var chat = this;
            var nbContacts = 0;
            var nbContactsNotOffline = 0;
            $('.chat-group').each(function(){
               var group = $(this);
               var nbTeamContacts =  group.find('li').length;
               if(nbTeamContacts == 0) {
                   group.remove();
               }
               else{
                   nbContacts += nbTeamContacts;
               }
               var nbTeamContactNotOffline = group.find('li').not('.ui-chat-status-offline').length;
               nbContactsNotOffline += nbTeamContactNotOffline;
               var titleGroup = group.children('span').text();
               titleGroup = titleGroup.replace(/([0-9]*\/[0-9]*)/g,nbTeamContactNotOffline+'/'+nbTeamContacts);
               group.children('span').text(titleGroup);
            });
            $('.nb-contacts').html('('+nbContactsNotOffline+'/'+nbContacts+')');
            chat.o.hideOffline ? $('#chat-roster-list .ui-chat-status-offline').hide() : $('#chat-roster-list .ui-chat-status-offline').show();
        },

        // Traite la reception d'un stanza de demande de découverte de services
        // en indiquant le support du service chat states
        _onReceiveServiceDiscoveryGet:function(iq){
            var chat = this;
            var to = iq.getAttribute('from');
            if (iq.getElementsByTagName('query').length){
                var query = iq.getElementsByTagName('query')[0].namespaceURI;
                if(query == 'http://jabber.org/protocol/disco#info') {
                    var serviceDiscoveryResult = $iq({type:'result', to: to})
                                                .c('query', {xmlns:'http://jabber.org/protocol/disco#info'})
                                                .c('feature', {'var':'http://jabber.org/protocol/chatstates'});
                    console.log("[icescrum-chat] Receiving service discovery get, result: \n" + serviceDiscoveryResult.toString());
                    chat.o.connection.send(serviceDiscoveryResult.tree());
                    return true;
                }
            }
        },

        _onPeriodicPauseStateCheck:function(){
            var chatKey;
            var chat = this;
            for(chatKey in chat.o.chatList){
                var chatId = chat.o.chatList[chatKey];
                var isComposing = $("#"+chatId).chat("option","isComposing");
                if(isComposing){
                    var hasChanged = $("#"+chatId).chat("option","hasChanged");
                    if(hasChanged){
                        $("#"+chatId).chat("option","hasChanged", false);
                    }
                    else{
                        var escapedJid = chatId.split("-")[1];
                        chat.o.connection.chatstates.sendPaused(chat.unescapeJid(escapedJid));
                        $("#"+chatId).chat("option","isComposing", false);
                    }
                }
            }
            return true;
        },

        answerRequestContact:function(escapedJid, answer){
            var chat = $.icescrum.chat;
            //Send response
            var responseMessage = $pres({type: answer, to: $.icescrum.chat.unescapeJid(escapedJid)});
            chat.o.connection.send(responseMessage.tree());
            console.log("[icescrum-chat] Subscription confirm answer : "+answer+" to "+escapedJid);

            //request subscription back
            if (answer == 'subscribed'){
                chat.o.connection.roster.subscribe(chat.unescapeJid(escapedJid));
                console.log("[icescrum-chat] Subscription sent back to "+escapedJid);
            }
            $('#subscription-' + escapedJid).remove();
        },

        requestNewContact:function() {
            var chat = $.icescrum.chat;
            var rawJid = $('#chat-add-contact').val();
            if (rawJid.indexOf('@') == -1){
                rawJid = rawJid+'@'+ Strophe.getDomainFromJid(chat.o.ownjid);
                $('#chat-add-contact').val(rawJid);
            }
            var escapedJid = chat.escapeJid(rawJid);
            if(Strophe.getBareJidFromJid(chat.o.ownjid) == escapedJid){
                $('#chat-add-contact').val("");
            }
            else if ($.icescrum.isValidEmail(rawJid) && $('#chat-user-status-' + escapedJid).length == 0){
                chat.o.connection.roster.add(rawJid, rawJid, [], function(data){
                    if (data.getAttribute('type') == 'result'){
                        $('#chat-add-contact').val("");
                        $.icescrum.renderNotice(chat.o.i18n.requestSent+rawJid);
                        chat.o.connection.roster.subscribe(rawJid);
                    }else{
                        $.icescrum.renderNotice(chat.o.i18n.requestError,'error');
                    }
                });
            }else if($('#chat-user-status-' + escapedJid).length > 0){
                $('#chat-add-contact').val("");
            }else{
                $.icescrum.renderNotice(chat.o.i18n.requestError,'error');
            }
        },

        confirmRequestContact:function(presence) {
            var chat = $.icescrum.chat;
            var jid = presence.getAttribute('from');
            var from = Strophe.getBareJidFromJid(jid);
            var escapedJid = chat.escapeJid(from);
            if ($('#subscription-'+escapedJid).length > 0){
                return;
            }
            $('#chat-manage').before('<div class="subscription" id="subscription-'+escapedJid+'" title="'+from+'">' +
                    chat.o.i18n.accept+' '+$.icescrum.truncate(from, 20)+' ?' +
                    '<button onclick="$.icescrum.chat.answerRequestContact(\''+escapedJid+'\',\'subscribed\');" ' +
                    'class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">'+chat.o.i18n.yes+'</button> ' +
                    '<button onclick="$.icescrum.chat.answerRequestContact(\''+escapedJid+'\',\'unsubscribed\');" ' +
                    'class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">'+chat.o.i18n.no+'</button>' +
                    '</div>');
        },

        removeContact:function(escapedJid){
            var chat = $.icescrum.chat;
            if(confirm('Are you sure ?')){
                chat.o.connection.roster.remove(chat.unescapeJid(escapedJid), function(){
                    $('#chat-user-status-' + escapedJid).remove();
                    chat.displayCounterContacts();
                });
            }
        },

        _editableSelectList:function(){
            $('#chatstatus-button .ui-selectmenu-status')
                .unbind('mousedown click keydown').bind('mousedown click keydown', function(event){
                event.stopPropagation();
                return false;
            })
            .editable(this.customPresence,{
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
            var start = $("#ui-chat-input-box-"+escapedJid).getCaretPosition();
            var content = $("#ui-chat-input-box-"+escapedJid).val();
            var lastChar = content.substring(start-1,start);
            if (start == 0 || lastChar == " "){
                $("#ui-chat-input-box-"+escapedJid).insertAtCaret(pemot+" ");
            }else{
                $("#ui-chat-input-box-"+escapedJid).insertAtCaret(" "+pemot+" ");
            }
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
                var rawJid = $.icescrum.chat.unescapeJid(escapedJid);
                var userInList = $('#chat-user-status-'+escapedJid);
                var title = userInList.attr('name') ? userInList.attr('name') : rawJid;
                title = $.icescrum.truncate(title,25);
                $(el).chat({id : id,
                            alert : this.o.i18n.alertNewMessages,
                            escapedJid : escapedJid,
                            status : userInList.data('status') ? userInList.data('status') : 'offline',
                            hidden : false,
                            video : userInList.data('video'),
                            width : this.o.width,
                            title : title,
                            offset : this._getNextOffset(),
                            messageSent : this.sendMessage,
                            chatClosed : this.closeChat,
                            stateSent : this.sendState,
                            createVideoChat: this.createVideoChat
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
            var rawJid = $.icescrum.chat.unescapeJid(escapedJid);
            msg = $('<pre>').text(msg).html();
            msg = $.icescrum.chat.displayBacklogElementUrl(msg,'story');
            var message = $msg({type: 'chat', to: rawJid})
                                                .c('body').t(msg[0])
                                                .up().c('active', {xmlns:'http://jabber.org/protocol/chatstates'});
            $.icescrum.chat.o.connection.send(message.tree());
            $("#chat-" + escapedJid).chat("option", "chatManager").addMsg($.icescrum.chat.o.i18n.me, msg[1]);
            console.log("[icescrum-chat] Message sent to "+rawJid);
        },

        // Ferme le chat id s'il est ouvert
        // En le retirant de la showList
        // Puis décale les fenêtres qui étaient à sa gauche
        closeChat:function(id) {
            var idx = $.icescrum.chat.o.showList.indexOf(id);
            $("#" + $.icescrum.chat.o.showList[idx]).chat("option", "hidden", true);
            if ($.icescrum.chat.o.video.started && $.icescrum.chat.o.showList[idx] == 'chat-'+$.icescrum.chat.escapeJid($.icescrum.chat.o.video.to)){
                $.icescrum.chat.hangupVideoCall(false);
            }
            if(idx != -1) {
                $.icescrum.chat.o.showList.splice(idx, 1);
                var diff = $.icescrum.chat.o.width + $.icescrum.chat.o.gap;
                for(var i = idx; i < $.icescrum.chat.o.showList.length; i++) {
                    var offset = $("#" + $.icescrum.chat.o.showList[i]).chat("option", "offset");
                    $("#" + $.icescrum.chat.o.showList[i]).chat("option", "offset", offset - diff);


                }
            }
        },

        // Ajoute le message à la fenêtre de chat
        _onChatMessage:function(escapedJid,text){
            var rawJid = $.icescrum.chat.unescapeJid(escapedJid);
            console.log("[icescrum-chat] Message received from "+rawJid);
            var extractedText = (text[0].text) ? text[0].text : (text[0].textContent) ? text[0].textContent : "";
            var name = $('#chat-user-status-'+escapedJid).data('firstname');
            name = $.icescrum.truncate(name,15);
            extractedText = $('<pre>').text(extractedText).html();
            extractedText = $.icescrum.chat.displayBacklogElementUrl(extractedText,'story');
            $("#chat-" + escapedJid).chat("option", "chatManager").addMsg(name, extractedText[1]);
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

        presenceChanged:function(presence, show, callback){
            var chat = $.icescrum.chat;
            if(show == 'disc'){
                chat.o.connection.sync = true;
                chat.o.connection.flush();
                chat.o.connection.disconnect();
                chat._disconnected();
            }else{
                if(!chat.o.connected){
                    chat._connect();
                }
                else{
                    chat.updateResource(presence, show, false);
                }
            }
            if (callback){
                callback();
            }
        },

        toggleRoster:function(){
            if (this.o.connected){
                if ($('#chat-roster-list').is(':hidden')){
                    $('#chat-roster-list').show();
                    $('#chat-manage').show();
                    $('#chat-list-hide').css('display','block');
                    $('#chat-list-show').hide();
                }else{
                    $('#chat-roster-list').hide();
                    $('#chat-list-hide').hide();
                    $('#chat-manage').hide();
                    $('#chat-list-show').css('display','block');
                }
            }else{
                $('#chat-roster-list').hide();
                $('#chat-list-hide').hide();
                $('#chat-manage').hide();
                $('#chat-list-show').css('display','block');
            }
        },

        // Permet de modifier le statut
        // presence : message du status
        // show : chat, away, dnd, xp
        updateResource:function(presence, show, saveCustom, callback){
            var chat = $.icescrum.chat;
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
            callback = callback ? callback : function(){};
            chat.o.currentStatus.show = show;
            chat.o.currentStatus.presence = presence;
            chat.o.connection.send(pres.tree());
            $.ajax({type:'POST',
                global:false,
                data:'custom='+saveCustom+'&show='+show+'&presence='+presence,
                url: $.icescrum.o.grailsServer + '/chat/status',
                error:function() {
                    $.icescrum.renderNotice(chat.o.i18n.customStatusError,'error');
                },
                success:callback
            });
        },

        // Envoie le stanza qui indique un changement d'état
        sendState:function(escapedJid, state) {
            var chat = $.icescrum.chat;
            var jid = chat.unescapeJid(escapedJid);
            switch(state){
                case 'active':
                    chat.o.connection.chatstates.sendActive(jid);
                    break;
                case 'composing':
                    chat.o.connection.chatstates.sendComposing(jid);
                    break;
                case 'paused':
                    chat.o.connection.chatstates.sendPaused(jid);
                    break;
            }
            console.log("[icescrum-chat] " + state +  " state sent to " + jid);
        },

        customPresence:function(val,settings){
            var chat = $.icescrum.chat;
            var presList = ['online','dnd','away'];
            if($("#chatstatus .status-custom").length < 6){
                var selected;
                var pres;
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
            chat.updateResource(val, $("#chatstatus").find('option:selected').val(),true);
            chat._editableSelectList();
            return val;
        },

        escapeJid:function(rawJid) {
            return rawJid.replace(/\./g,'_point_').replace(/@/g,'_at_');
        },

        unescapeJid:function(escapedJid) {
            return escapedJid.replace(/_point_/g,'.').replace(/_at_/g,'@');
        },

        displaySavedOauth:function(){
            $(['gtalk','facebook','live']).each(function(){
                if ($.cookie('token-oauth-' + $.icescrum.user.id + '-' + this)){
                    var oauth = $('<span data-provider="'+this+'">'+$.icescrum.chat.o.i18n.remove+' '+ this +' '+$.icescrum.chat.o.i18n.authorization+'</span>');
                    $('.oauth_saved').append(oauth);
                    oauth.on('click',function(){
                        $.cookie('token-oauth-' + $.icescrum.user.id + '-' + $(this).data('provider'), null);
                        $(this).remove();
                        if ($.icescrum.chat.o.connected && $.icescrum.chat.o.connection.oauth_provider == $(this).data('provider')){
                            $.icescrum.chat.presenceChanged('','disc');
                        }
                    });
                    $('.oauth_saved').show();
                }
            });
        },

        displayBacklogElementUrl:function(msg,type){
            var val = [msg,msg];
            var re = new RegExp(type+'-[0-9]*',"g");
            var stories = msg.match(re);
            if (stories){
                var uids = ['type='+type];
                $(stories).each(function(){
                    uids.push('uid=' + this.replace(/story-/g,''));
                });
                $.ajax({type:'POST',
                    global:false,
                    data:uids.join('&'),
                    dataType:'json',
                    async:false,
                    url: $.icescrum.o.baseUrlProduct + 'chat/message',
                    success:function(data) {
                        $(data).each(function(){
                            var reg = new RegExp(this.uid,"g");
                            val[0] = val[0].replace(reg,this.name+' ('+this.external+')');
                            val[1] = val[1].replace(reg,
                                '<a class="scrum-link" title="' + this.uid + ' (' + this.estimation + ',' + this.state +')" href="' + this.internal + '">' +
                                    this.name +
                                '</a>'
                            );
                        });
                    }
                });

            }
            return val;
        }
    };


    $(document).bind('init.icescrum',function(event){
            if ($.icescrum.user.id && $.inArray('chat',  $.icescrum.getWidgetsList()) == -1){
                $.icescrum.chat.reloadChat();
            }
        }
    );

    $('#application').unbind('updateProfile_user.stream').bind('updateProfile_user.stream',function(){
        $.icescrum.chat.reloadChat();
    });


    $(document).bind('composing.chatstates paused.chatstates active.chatstates', function(event,jid){
        jid = Strophe.getBareJidFromJid(jid);
        if (jid == $.icescrum.chat.o.ownjid){
            return;
        }
        console.log("[icescrum-chat] " + jid + " is "+event.type);
        var chatWindow = $("#chat-" + $.icescrum.chat.escapeJid(jid));
        if (chatWindow.size() > 0){
            var manager = chatWindow.chat("option", "chatManager");
            switch(event.type){
                case 'composing':
                    manager.hidePaused();
                    manager.showComposing();
                    break;
                case 'paused':
                    manager.hideComposing();
                    manager.showPaused();
                    break;
                case 'active':
                    manager.hideComposing();
                    manager.hidePaused();
                    break;
            }
        }
    });

})($);

$.editable.addInputType('statut-editable', {
    element : function(settings) {
            var input = $('<input />');
            input.width(settings.width);
            input.height(settings.height);
            input.bind('mousedown',function(event){event.stopPropagation()}).bind('click',function(event){event.stopPropagation()}).keydown(function(event){event.stopPropagation()});
            $(this).append(input);
            input.focus();
            return(input);
        }
});

$.fn.sortElements = (function(){
    var sort = [].sort;
    return function(comparator, getSortable) {
        getSortable = getSortable || function(){return this;};
        var placements = this.map(function(){
            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,
                nextSibling = parentNode.insertBefore(
                    document.createTextNode(''),
                    sortElement.nextSibling
                );
            return function() {
                if (parentNode === this) {
                    throw new Error(
                        "You can't sort elements if any one is a descendant of another."
                    );
                }
                parentNode.insertBefore(this, nextSibling);
                parentNode.removeChild(nextSibling);
            };
        });
        return sort.call(this, comparator).each(function(i){
            placements[i].call(getSortable.call(this));
        });
    };
})();