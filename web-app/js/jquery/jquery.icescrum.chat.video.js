(function($) {
        $.extend($.icescrum.chat, {
        createVideoChat:function(escapedJid, ui){
            var chat = $.icescrum.chat;
            if (!chat.o.video.enabled){
                alert($.icescrum.chat.o.i18n.video.notSupported);
                return false;
            }
            if (!chat.o.video.started){
                chat.o.video.initiator = true;
                chat.initiateVideoCall(escapedJid);
            }else{
                if (ui.hasClass('ui-icon-stop')){
                    if(confirm($.icescrum.chat.o.i18n.video.confirmHangup)){
                        chat.hangupVideoCall();
                    }
                }else{
                    alert($.icescrum.chat.o.i18n.video.inCall);
                }
            }
        },

        createPeerConnection:function() {
            var chat = $.icescrum.chat;
            console.log("Creating PeerConnection.");
            try {
                chat.o.video.pc = new webkitPeerConnection00("STUN stun.l.google.com:19302", chat.onIceCandidate);
              console.log("Created webkitPeerConnnection00 with config \"STUN stun.l.google.com:19302\".");
            } catch (e) {
              console.log("Failed to create PeerConnection, exception: " + e.message);
              alert($.icescrum.chat.o.i18n.video.peerError);
              return;
            }
            chat.o.video.pc.onaddstream = function(){
                console.log("Remote stream added. from "+chat.escapeJid(chat.o.video.to));
                var feed = $('.remoteFeed',$('#chat-'+chat.escapeJid(chat.o.video.to)).parent());
                $(feed).attr('src', webkitURL.createObjectURL(event.stream));
             };
            chat.o.video.pc.onconnecting = function () { console.log("Session connecting."); };
            chat.o.video.pc.onopen = function () { console.log("Session opened."); };
            chat.o.video.pc.onremovestream = function () { console.log("Remote stream removed."); };
        },

        initiateVideoCall:function(escapedJid,msg) {
            var chat = $.icescrum.chat;
            chat.o.video.to = chat.unescapeJid(escapedJid);
            var chatWindow = $("#chat-" + escapedJid);
            navigator.webkitGetUserMedia({video:true,audio:true},
                    function(stream){
                        chatWindow.addClass('ui-chat-with-video');
                        chatWindow.parent().prepend('<div class="chatVideo"><video class="localFeed" autoplay></video><video class="remoteFeed" autoplay></video></div>');
                        var localFeed = chatWindow.parent().find('.localFeed');
                        localFeed.attr('src', webkitURL.createObjectURL(stream));
                        chat.o.video.stream = stream;
                        if (!chat.o.video.started) {
                            chat.createPeerConnection();
                          console.log("Adding local stream.");
                          chat.o.video.pc.addStream(chat.o.video.stream);
                            chat.o.video.started = true;
                          if (chat.o.video.initiator){
                              chat.makeVideoCall();
                          }else{
                              var pc = chat.o.video.pc;
                              pc.setRemoteDescription(pc.SDP_OFFER, new SessionDescription(msg.sdp));
                              chat.answerVideoCall();
                          }
                        }
                        chatWindow.parent().parent().find('.ui-icon-play').removeClass('ui-icon-play').addClass('ui-icon-stop');
                        localFeed.draggable({snap: ".chatVideo", containment: "parent"});
                    },
                    function(){
                        alert($.icescrum.chat.o.i18n.video.streamError);
                    }
            );
        },

        makeVideoCall:function(jid) {
            var chat = $.icescrum.chat;
            var pc = chat.o.video.pc;
            console.log("Send offer to peer "+chat.o.video.to);
            var offer = pc.createOffer({audio:true, video:true});
            pc.setLocalDescription(pc.SDP_OFFER, offer);
            chat.sendPeerMessage({type: 'offer', sdp: offer.toSdp(), to:chat.o.video.to});
        },

        hangupVideoCall:function(sync){
            var chat = $.icescrum.chat;
            console.log('Hanging up.');
            chat.sendPeerMessage({type: 'bye', to:chat.o.video.to}, sync);
            chat.stopVideoCall();
        },


        onRemoteHangupVideoCall:function() {
            console.log('Session terminated.');
            this.stopVideoCall();
        },

        stopVideoCall:function() {
            var chat = $.icescrum.chat;
            var chatWindow = $("#chat-" + chat.escapeJid(chat.o.video.to));
            chatWindow.removeClass('ui-chat-with-video');
            chatWindow.parent().parent().find('.ui-icon-stop').removeClass('ui-icon-stop').addClass('ui-icon-play');
            $('.chatVideo',chatWindow.parent()).remove();
            chat.o.video.started = false;
            chat.o.video.pc.close();
            chat.o.video.pc = null;
            chat.o.video.initiator = false;
            chat.o.video.stream.stop();
            chat.o.video.stream = null;
            chat.o.video.to = null;
        },

        answerVideoCall:function (jid) {
            var chat = $.icescrum.chat;
            console.log("Send answer to peer "+chat.o.video.to);
            var pc = chat.o.video.pc;
            var offer = pc.remoteDescription;
            var answer = pc.createAnswer(offer.toSdp(), {audio:true,video:true});
            pc.setLocalDescription(pc.SDP_ANSWER, answer);
            chat.sendPeerMessage({type: 'answer', sdp: answer.toSdp(), to:chat.o.video.to});
            pc.startIce();
        },

        _processPeerMessage:function(msg) {
            var chat = $.icescrum.chat;
            var pc;
            var from = chat.escapeJid(msg.from);
            console.log('S->C '+JSON.stringify(msg));
            if (msg.type === 'offer') {
                // Callee creates PeerConnection
                if (!chat.o.video.initiator && !chat.o.video.started){
                    chat.createOrOpenChat('chat-'+from, from, false);
                    var chatWindow = $('#chat-'+from);
                    $.icescrum.displayNotification('video call', 'From '+ $('#chat-user-status-' + from).data('firstname'));
                    chat.initiateVideoCall(from, msg);
                }
            } else if (msg.type === 'answer' && chat.o.video.started) {
                pc = chat.o.video.pc;
                console.log('received answer message');
                pc.setRemoteDescription(pc.SDP_ANSWER, new SessionDescription(msg.sdp));
                pc.startIce();
            } else if (msg.type === 'candidate' && chat.o.video.started) {
                pc = chat.o.video.pc;
                var candidate = new IceCandidate(msg.label, msg.candidate);
                pc.processIceMessage(candidate);
            } else if (msg.type === 'bye' && chat.o.video.started) {
                chat.onRemoteHangupVideoCall();
            }
        },

        onIceCandidate:function(candidate, moreToFollow) {
            var chat = $.icescrum.chat;
            if (candidate) {
                chat.sendPeerMessage({type: 'candidate', label: candidate.label, candidate: candidate.toSdp(), to:chat.o.video.to});
            }
            if (!moreToFollow) {
                console.log("End of candidates.");
            }
        },

        sendPeerMessage:function(message, sync) {
            var chat = $.icescrum.chat;
            message.from = Strophe.getBareJidFromJid(chat.o.ownjid);
            sync = sync ? sync : false;
            console.log('C->S: ' + JSON.stringify(message));
            $.ajax({url:$.icescrum.o.grailsServer + '/chat/peerMessage',
                    data:message,
                    async:!sync,
                    success:function(){ console.log("[icescrum-chat] Peer message sent"); },
                    error:function(){ console.log("[icescrum-chat] Error while sending Peer message") }
                  });
        }
    });
})($);

$(document).ready(function($) {
    $(window).unbind("connected.chat").bind("connected.chat", function(){
        var chat = $.icescrum.chat;
        if (chat.o.video.enabled){
            $(document.body).unbind('peerMessageReceived_chat.stream').bind('peerMessageReceived_chat.stream', function(event,data){
                chat._processPeerMessage(data.message);
            });
        }
    });
});