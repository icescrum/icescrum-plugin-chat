(function($) {
        navigator.GetUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
        var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
        var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
        var isMoz = !!navigator.mozGetUserMedia;
        var attachMediaStream = null;

        $.extend($.icescrum.chat, {

        defaultsVideo:{
            enabled: false,
            pc:null,
            pc_config:{"iceServers":
                [
                {
                    "url":"stun:stun.l.google.com:19302"
                },
                {
                    "url":"turn:8.34.221.6:3478?transport=udp",
                    "credential":"KhtDrtxosrcSW3weHIe/8Uv1SQA=",
                    "username":"24381258:1386082451"
                },
                {
                    "url":"turn:8.34.221.6:3478?transport=tcp",
                    "credential":"KhtDrtxosrcSW3weHIe/8Uv1SQA=",
                    "username":"24381258:1386082451"
                },
                {
                    "url":"turn:8.34.221.6:3479?transport=udp",
                    "credential":"KhtDrtxosrcSW3weHIe/8Uv1SQA=",
                    "username":"24381258:1386082451"
                },
                {
                    "url":"turn:8.34.221.6:3479?transport=tcp",
                    "credential":"KhtDrtxosrcSW3weHIe/8Uv1SQA=",
                    "username":"24381258:1386082451"
                }
            ]
            },
            mediaConstraints:{'mandatory':{'OfferToReceiveAudio':true,'OfferToReceiveVideo':true}},
            initiator:false,
            started:false,
            to:null,
            stream:null
        },
        initVideo:function(){
            var chat = $.icescrum.chat;
            chat.o.video = {};
            chat.o.video = $.extend({}, this.defaultsVideo, chat.o.video);
            chat.o.video.enabled = (PeerConnection != undefined);
            if(chat.o.video.enabled){
                if (isMoz) {
                    console.log("This appears to be Firefox");
                    attachMediaStream = function(element, stream) {
                        console.log("Attaching media stream");
                        element.mozSrcObject = stream;
                    };
                } else{
                    console.log("This appears to be Chrome");
                    attachMediaStream = function(element, stream) {
                        var url = webkitURL.createObjectURL(stream);
                        console.log('Attaching media stream url :'+ url);
                        element.attr('src',webkitURL.createObjectURL(stream));
                    };
                }
            } else {
              console.log("Browser does not appear to be WebRTC-capable");
            }
        },

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
            console.log("Creating PeerConnection");
            try {
                chat.o.video.pc = new PeerConnection(chat.o.video.pc_config);
                chat.o.video.pc.onicecandidate = chat.onIceCandidate;
              console.log("Created PeerConnnection with config: "+JSON.stringify(chat.o.video.pc_config));
            } catch (e) {
              console.log("Failed to create chat.o.video.pc, exception: " + e.message);
              alert($.icescrum.chat.o.i18n.video.peerError);
              return;
            }
            //  A commenter pour FF
            chat.o.video.pc.onaddstream = chat.onaddstream;
            chat.o.video.pc.onconnecting = chat.onconnecting;
            chat.o.video.pc.onopen = chat.onopen;
            chat.o.video.pc.onremovestream = chat.onremovestream;
        },

        onaddstream:function(event) {
            var chat = $.icescrum.chat;
            console.log("Remote stream added. from "+chat.escapeJid(chat.o.video.to));
            var feed = $('.remoteFeed',$('#chat-'+chat.escapeJid(chat.o.video.to)).parent());
            attachMediaStream(feed, event.stream);
        },

        onconnecting:function(event) {
            console.log("Session connecting.");
        },

        onopen:function(event) {
            console.log("Session opened.");
        },

        onremovestream:function (event) {
            console.log("Remote stream removed.");
        },

        initiateVideoCall:function(escapedJid,msg) {
            var chat = $.icescrum.chat;
            chat.o.video.to = chat.unescapeJid(escapedJid);
            var chatWindow = $("#chat-" + escapedJid);
            try {
                navigator.GetUserMedia({audio:true, video:true}, function(stream){

                        chatWindow.addClass('ui-chat-with-video');
                        chatWindow.parent().prepend('<div class="chatVideo"><video class="localFeed"></video><video class="remoteFeed"></video></div>');

                        var localFeed = chatWindow.parent().find('.localFeed');
                        attachMediaStream(localFeed, stream);

                        chat.o.video.stream = stream;
                        if (!chat.o.video.started) {
                          chat.createPeerConnection();
                          console.log("Adding local stream.");
                          chat.o.video.pc.addStream(stream);
                            chat.o.video.started = true;
                          if (chat.o.video.initiator){
                              chat.makeVideoCall();
                          }else{
                              var pc = chat.o.video.pc;
                              pc.setRemoteDescription(new SessionDescription(msg));
                              chat.answerVideoCall();
                          }
                        }
                        chatWindow.parent().parent().find('.ui-icon-play').removeClass('ui-icon-play').addClass('ui-icon-stop');
                        localFeed.draggable({snap: ".chatVideo", containment: "parent"});
                    },function(){
                        alert($.icescrum.chat.o.i18n.video.streamError);
                    }
                );
                console.log("Requested access to local media with");
            } catch (e) {
                console.log("getUserMedia failed with exception: " + e.message);
            }
        },

        makeVideoCall:function() {
            var chat = $.icescrum.chat;
            var pc = chat.o.video.pc;
            console.log("Send offer to peer "+chat.o.video.to+"with : "+JSON.stringify(chat.o.video.mediaConstraints));
            pc.createOffer(chat.setLocalAndSendMessage, null, chat.o.video.mediaConstraints);
        },

        answerVideoCall:function () {
            var chat = $.icescrum.chat;
            var pc = chat.o.video.pc;
            console.log("Send answer to peer "+chat.o.video.to+"with : "+JSON.stringify(chat.o.video.mediaConstraints));
            pc.createAnswer(chat.setLocalAndSendMessage, null, chat.o.video.mediaConstraints);
        },

        hangupVideoCall:function(sync){
            var chat = $.icescrum.chat;
            console.log('Hanging up.');
            chat.sendPeerMessage({type: 'bye'}, sync);
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

        _processPeerMessage:function(msg) {
            var chat = $.icescrum.chat;
            var pc;
            var from = chat.escapeJid(msg.from);
            console.log('S->C '+JSON.stringify(msg));
            if (msg.type === 'offer') {
                // Callee creates chat.o.video.pc
                if (!chat.o.video.initiator && !chat.o.video.started){
                    chat.createOrOpenChat('chat-'+from, from, false);
                    $.icescrum.displayNotification('video call', 'From '+ $('#chat-user-status-' + from).data('firstname'));
                    chat.initiateVideoCall(from, msg);
                }
            } else if (msg.type === 'answer' && chat.o.video.started) {
                pc = chat.o.video.pc;
                console.log('received answer message');
                pc.setRemoteDescription(new SessionDescription(msg));
            } else if (msg.type === 'candidate' && chat.o.video.started) {
                pc = chat.o.video.pc;
                var candidate = new IceCandidate({sdpMLineIndex:msg.label, candidate:msg.candidate});
                pc.addIceCandidate(candidate);
            } else if (msg.type === 'bye' && chat.o.video.started) {
                chat.onRemoteHangupVideoCall();
            }
        },

        onIceCandidate:function(event) {
            var chat = $.icescrum.chat;
            if (event.candidate) {
                chat.sendPeerMessage({type: 'candidate',
                                               label: event.candidate.sdpMLineIndex,
                                               id: event.candidate.sdpMid,
                                               candidate: event.candidate.candidate});
            } else {
              console.log("End of candidates.");
            }
        },

        sendPeerMessage:function(message, sync) {
            console.log('sending message to peer');
            var chat = $.icescrum.chat;
            message.from = Strophe.getBareJidFromJid(chat.o.ownjid);
            message.to = chat.o.video.to;
            sync = sync ? sync : false;
            console.log('C->S:'+ JSON.stringify(message));
            $.ajax({url:$.icescrum.o.grailsServer + '/chat/peerMessage',
                    data:message,
                    async:!sync,
                    success:function(){ console.log("[icescrum-plugin-chat] Peer message sent"); },
                    error:function(){ console.log("[icescrum-plugin-chat] Error while sending Peer message") }
                  });
        },

        setLocalAndSendMessage:function(sessionDescription) {
            var chat = $.icescrum.chat;
            sessionDescription.sdp = chat.preferOpus(sessionDescription.sdp);
            chat.o.video.pc.setLocalDescription(sessionDescription);
            chat.sendPeerMessage(sessionDescription);
        },

        // Set Opus as the default audio codec if it's present.
        preferOpus:function(sdp) {
        var chat = $.icescrum.chat;
        var sdpLines = sdp.split('\r\n');

        // Search for m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
              var mLineIndex = i;
              break;
            }
        }
        if (mLineIndex === null)
          return sdp;

        // If Opus is available, set it as the default in m line.
        for (var i = 0; i < sdpLines.length; i++) {
          if (sdpLines[i].search('opus/48000') !== -1) {
            var opusPayload = chat.extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
            if (opusPayload)
              sdpLines[mLineIndex] = chat.setDefaultCodec(sdpLines[mLineIndex], opusPayload);
            break;
          }
        }

        // Remove CN in m line and sdp.
        sdpLines = this.removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');
        return sdp;
      },

      extractSdp:function(sdpLine, pattern) {
        var result = sdpLine.match(pattern);
        return (result && result.length == 2)? result[1]: null;
      },

      // Set the selected codec to the first in m line.
      setDefaultCodec:function(mLine, payload) {
        var elements = mLine.split(' ');
        var newLine = new Array();
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
          if (index === 3) // Format of media starts from the fourth.
            newLine[index++] = payload; // Put target payload to the first.
          if (elements[i] !== payload)
            newLine[index++] = elements[i];
        }
        return newLine.join(' ');
      },

      // Strip CN from sdp before CN constraints is ready.
      removeCN:function(sdpLines, mLineIndex) {
        var mLineElements = sdpLines[mLineIndex].split(' ');
        // Scan from end for the convenience of removing an item.
        for (var i = sdpLines.length-1; i >= 0; i--) {
          var payload = $.icescrum.chat.extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
          if (payload) {
            var cnPos = mLineElements.indexOf(payload);
            if (cnPos !== -1) {
              // Remove CN payload from m line.
              mLineElements.splice(cnPos, 1);
            }
            // Remove CN line in sdp
            sdpLines.splice(i, 1);
          }
        }

        sdpLines[mLineIndex] = mLineElements.join(' ');
        return sdpLines;
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