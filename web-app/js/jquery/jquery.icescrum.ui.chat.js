(function($){

    $.widget("ui.chat", {
	    options: {
            id: null,
            title: "No Title",
            status: null,
            username: null,
            hidden:false,
            offset:0,
            width: 230,
            isComposing:false,
            hasChanged:false,
            messageSent: function(id, username, msg){},
            chatClosed: function(id){},
            stateSent: function(username, state){},

            chatManager: {

                init: function(elem) {
                    this.elem = elem;
                    this.elem.uiChatComposing.hide();
                    this.elem.uiChatPaused.hide();
                    this.elem.uiChatSmiley.show();
                    var cpt = 0;
                    var emoticontable = "<table>";
                    for(var emote in jQuery.icescrum.emoticons.emotes){
                        if(cpt == 0){
                            emoticontable += "<tr>";
                        }
                        emoticontable += "<td><img onclick='jQuery.icescrum.chat.insertEmoticon(\""+this.elem.options.username+"\", \""+jQuery.icescrum.emoticons.emotes[emote][0]+"\")' src='"+jQuery.icescrum.emoticons.icon_folder+"/face-"+emote+".png'/></td>";
                        cpt++;
                        if(cpt == 5){
                            emoticontable += "</tr>";
                            cpt = 0;
                        }
                    }
                    if(cpt != 0){
                        emoticontable += "</tr>";
                    }
                    emoticontable += "</table>";
                    $('.ui-chat-emoticons').qtip(
                    {
                        content: emoticontable,
                        hide: { when: { event:'click mouseout' }, fixed: true, delay: 100 },
                        position: {
                           target: 'mouse',
                           adjust: { mouse: false }
                        },
                        style: {
                            width: {
                                min: 100
                            }
                        }
                    });
                },

                addMsg: function(name, msg) {
                    msg = $.icescrum.emoticons.replace(msg);
                    var self = this;
                    var chat = self.elem.uiChatLog;
                    var e = document.createElement('div');
                    $(e).html("<span>" + name +":</span> " + msg)
                    .addClass("ui-chat-msg");
                    chat.append(e);
                    self._scrollToBottom();
                    if(!self.elem.uiChatTitleBar.hasClass("ui-state-focus") && !self.highlightLock) {
                        self.highlightLock = true;
                        self.highlight();
                        if (self.elem.uiChatContent.is(':hidden')){
                            self.elem.uiChat.effect("bounce", {times:3}, 300);
                        }
                    }
                },

                highlight: function() {
                    var self = this;
                    self.elem.uiChatTitleBar.effect("highlight", {}, 300);
                    self.highlightLock = false;
                },

                toggleChat: function() {
                    this.elem.uiChat.toggle();
                },

                minimize: function() {
                   this.elem.toggleContent();
                },

                _scrollToBottom: function() {
                    var chat = this.elem.uiChatLog;
                    chat.scrollTop(chat.get(0).scrollHeight);
                },

                showComposing: function()  {
                    var self = this;
                    self.elem.uiChatComposing.show();

                },

                hideComposing: function()  {
                    var self = this;
                    self.elem.uiChatComposing.hide();
                },

                showPaused: function()  {
                    var self = this;
                    self.elem.uiChatPaused.show();

                },

                hidePaused: function()  {
                    var self = this;
                    self.elem.uiChatPaused.hide();
                }
            }
	    },

        toggleContent: function() {
            this.uiChatContent.toggle();
            if(this.uiChatContent.is(":visible")) {
                this.uiChatInput.focus();
            }
        },

        widget: function() {
            return this.uiChat
        },

        _create: function(){
            var self = this;
            var options = self.options;
            var title = options.title;

            var uiChat = self.uiChat = $('<div></div>')
                     .addClass('ui-widget ui-corner-top ui-chat')
                     .attr('outline', 0)
                     .focusin(function(){ self.uiChatTitleBar.addClass('ui-state-focus');})
                     .focusout(function(){ self.uiChatTitleBar.removeClass('ui-state-focus');})
                     .appendTo(document.body);

            self.uiChatTitleBar = $('<div></div>');
            var uiChatTitleBar = self.uiChatTitleBar
                     .addClass('ui-widget-header ui-corner-top ui-chat-titlebar ui-dialog-header')
                     .click(function(event) { self.toggleContent(event); })
                     .appendTo(uiChat);

            self.uiChatStatus = $('<div></div>');
            var uiChatStatus = self.uiChatStatus
                    .addClass("ui-chat-user-status-"+options.username+" ui-chat-status ui-chat-status-"+options.status)
                    .appendTo(uiChatTitleBar);

            self.uiChatTitle = $('<div></div>');
            var uiChatTitle = self.uiChatTitle
                    .html(title)
                    .addClass("ui-chat-title")
                    .appendTo(uiChatTitleBar);

            self.uiChatTitleBarClose = $('<a href="#"></a>');
            var uiChatTitleBarClose = self.uiChatTitleBarClose
                    .addClass('ui-corner-all ui-chat-icon')
                    .attr('role', 'button')
                    .hover(function() {uiChatTitleBarClose.addClass('ui-state-hover');},function() {uiChatTitleBarClose.removeClass('ui-state-hover');})
                    .click(function() {
                            uiChat.hide();
                            self.options.chatClosed(self.options.id);
                            return false;
                    })
                    .appendTo(uiChatTitleBar);

            var uiChatTitlebarCloseText = $('<span></span>')
                    .addClass('ui-icon ui-icon-closethick')
                    .text('close')
                    .appendTo(uiChatTitleBarClose);

            var uiChatTitlebarMinimize = $('<a href="javascript:;"></a>')
                    .addClass('ui-corner-all ui-chat-icon')
                    .attr('role', 'button')
                    .hover(function() {uiChatTitlebarMinimize.addClass('ui-state-hover');},function() {uiChatTitlebarMinimize.removeClass('ui-state-hover');})
                    .click(function(event) {
                        self.toggleContent(event);
                        return false;
                    })
                    .appendTo(uiChatTitleBar);

            self.uiChatComposing = $('<div></div>');
                                    var uiChatComposing = self.uiChatComposing
                                            .addClass('ui-chat-composing')
                                            .appendTo(uiChatTitleBar);
            self.uiChatPaused =    $('<div></div>');
                                    var uiChatPaused = self.uiChatPaused
                                            .addClass('ui-chat-paused')
                                            .appendTo(uiChatTitleBar);


            var uiChatTitlebarMinimizeText = $('<span></span>')
                    .addClass('ui-icon ui-icon-minusthick')
                    .text('minimize')
                    .appendTo(uiChatTitlebarMinimize);

            self.uiChatContent = $('<div></div>');
            var uiChatContent = self.uiChatContent
                    .addClass('ui-widget-content ui-chat-content')
                    .appendTo(uiChat);

            self.uiChatLog = self.element;
            var uiChatLog = self.uiChatLog
                    .addClass('ui-widget-content ui-chat-log')
                    .appendTo(uiChatContent);


            self.uiChatInputWrapper = $('<div></div>');
            var uiChatInputWrapper = self.uiChatInputWrapper
                    .addClass('ui-widget-content ui-chat-input')
                    .appendTo(uiChatContent);

            self.uiChatInput = $('<textarea></textarea>');
            var uiChatInput = self.uiChatInput
                    .addClass('ui-widget-content ui-chat-input-box ui-corner-all')
                    .attr('id', 'ui-chat-input-box-'+options.username)
                    .appendTo(uiChatInputWrapper)
                    .keyup(function(event) {
                        if(event.keyCode) {
                            var msg = $.trim($(this).val());
                            if(event.keyCode == $.ui.keyCode.ENTER) {
                                if(msg.length > 0) {
                                    self.options.messageSent(self.options.id, self.options.username, msg);
                                }
                                $(this).val('');
                                self.options.isComposing = false;
                                self.options.hasChanged = false;
                                return false;
                            }
                            else {
                                self.options.hasChanged = true;
                                if(!self.options.isComposing && msg.length > 0) {
                                    self.options.isComposing = true;
                                    self.options.stateSent(self.options.username,'composing');
                                } if(msg.length == 0){
                                  self.options.isComposing = false;
                                  self.options.stateSent(self.options.username,'active');
                                }
                            }
                        }
                    })
                    .focusin(function() {
                        uiChatInput.addClass('ui-chat-input-focus');
                        var box = $(this).parent().prev();
                        box.scrollTop(box.get(0).scrollHeight);
                    })
                    .focusout(function() {
                        uiChatInput.removeClass('ui-chat-input-focus');
                    });
            
            self.uiChatSmiley = $('<div></div>');
            var uiChatSmiley = self.uiChatSmiley
                    .addClass('ui-chat-emoticons')
                    .appendTo(uiChatInputWrapper);

            uiChatTitleBar.find('*').add(uiChatTitleBar).disableSelection();

            // switch focus to input box when whatever clicked
            uiChatContent.children().click(function(){
                self.uiChatInput.focus();
            });

            self._setWidth(self.options.width);
            self._position(self.options.offset);

            self.options.chatManager.init(self);

            if(!self.options.hidden) {
                uiChat.show();
            }
        },

        _setOption: function(option, value) {
            if(value != null){
            switch(option) {
            case "hidden":
                if(value) {
                    this.uiChat.hide();
                } else {
                this.uiChat.show();
                }
                break;
            case "offset":
                this._position(value);
                break;
            case "width":
                this._setWidth(value);
                break;
            }
            }
            $.Widget.prototype._setOption.apply(this, arguments);
        },

        _setWidth: function(width) {
            this.uiChatTitleBar.width(width + "px");
            this.uiChatLog.width(width + "px");
            this.uiChatInput.css("width", (width - 28) + "px");
        },

        _position: function(offset) {
            this.uiChat.css("right", offset);
        }
    });

}(jQuery));