/**
 *
 *  @param (Strophe.Request) req - The current request.
 */
Strophe.Connection.prototype._connect_cb_live = function (req) {
        Strophe.info("_connect_cb_live was called");
        this.connected = true;
        var bodyWrap = req.getResponse();
        if (!bodyWrap) { return; }

        this.xmlInput(bodyWrap);
        this.rawInput(Strophe.serialize(bodyWrap));

        var typ = bodyWrap.getAttribute("type");
        var cond, conflict;
        if (typ !== null && typ == "terminate") {
            // an error occurred
            cond = bodyWrap.getAttribute("condition");
            conflict = bodyWrap.getElementsByTagName("conflict");
            if (cond !== null) {
                if (cond == "remote-stream-error" && conflict.length > 0) {
                    cond = "conflict";
                }
                this._changeConnectStatus(Strophe.Status.CONNFAIL, cond);
            } else {
                this._changeConnectStatus(Strophe.Status.CONNFAIL, "unknown");
            }
            return;
        }

        // check to make sure we don't overwrite these if _connect_fb is
        // called multiple times in the case of missing stream:features
        if (!this.sid) {
            this.sid = bodyWrap.getAttribute("sid");
        }
        if (!this.stream_id) {
            this.stream_id = bodyWrap.getAttribute("authid");
        }
        var wind = bodyWrap.getAttribute('requests');
        if (wind) { this.window = wind; }
        var hold = bodyWrap.getAttribute('hold');
        if (hold) { this.hold = hold; }
        var wait = bodyWrap.getAttribute('wait');
        if (wait) { this.wait = wait; }

        var mechanisms = bodyWrap.getElementsByTagName("mechanism");
        var i, mech, auth_str, hashed_auth_str, xlive;
        if (mechanisms.length == 0) {
            // we didn't get stream:features yet, so we need wait for it
            // by sending a blank poll request
            var body = this._buildBody();
            this._requests.push(
            	new Strophe.Request(body.tree(),
                                this._onRequestStateChange.bind(
                                    this, this._connect_cb_live.bind(this)),
                                body.tree().getAttribute("rid")));
                                    
            this._throttledRequestHandler();
            return;
        } else {
        	for (i = 0; i < mechanisms.length; i++) {
                mech = Strophe.getText(mechanisms[i]);
                if (mech == 'X-MESSENGER-OAUTH2') {
                    xlive = true;
                	break;
                }
            }
        }
        
        if (!xlive)	{
        	return;
        }
        
        this._changeConnectStatus(Strophe.Status.AUTHENTICATING, null);
        this._sasl_success_handler = this._addSysHandler(
                this._sasl_success_cb.bind(this), null,
                "success", null, null);

        this.send($build("auth", {
            xmlns: Strophe.NS.SASL,
            mechanism: "X-MESSENGER-OAUTH2"
        }).t(this.oauth_accessToken).tree());
};

Strophe.Connection.prototype.oauth_live_login = function(clientid, redirect, resource, callback, accessToken, wait, hold) {
    var conn = this;
    conn.oauth_provider = 'live';
    conn.oauth_callback = callback;
    conn.connect_callback = callback;
    conn.oauth_live_url =   'https://oauth.live.com/authorize?';
    conn.oauth_live_validurl = 'https://apis.live.net/v5.0/me?access_token=';
    conn.oauth_accessToken = accessToken || null;
    conn._connect_callback = conn._connect_cb_live;
    conn.wait = wait || conn.wait;
    conn.hold = hold || conn.hold;
    conn.oauth_resource = resource || 'strophe';
    if (!conn.oauth_accessToken){
        var win  = window.open(conn.oauth_live_url + 'scope=wl.emails wl.messenger&client_id=' + clientid + '&redirect_uri=' + redirect + '&response_type=token', "oauth", 'width=750, height=350');
        var pollTimer = window.setInterval(function() {
            if (!win){
                window.clearInterval(pollTimer);
                alert('Can\'t open popup to connect to live messenger (check popup blocker)');
                conn._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
            }
            else if (win.closed){
                window.clearInterval(pollTimer);
                conn._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
            }else if (win.document && win.document.URL.indexOf(redirect) != -1) {
                window.clearInterval(pollTimer);
                var url =   win.document.URL;
                conn.oauth_accessToken = conn.gup(url, 'access_token');
                win.close();
                if (conn.oauth_accessToken){
                    conn.oauth_validate_token_live(clientid, redirect);
                }else{
                    conn._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
                }
            }
        }, 500);
    }else{
        conn.oauth_validate_token_live(clientid, redirect);
    }
};

Strophe.Connection.prototype.oauth_validate_token_live = function(clientid, redirect) {
    var conn = this;
    $.ajax({
        url: conn.oauth_live_validurl + conn.oauth_accessToken,
        success: function(data){
            conn.connect(data.id + "@messenger.live.com/" + conn.oauth_resource, null, conn.oauth_callback);
        },
        error:function(){
            conn.oauth_live_login(clientid, redirect, conn.oauth_resource, conn.oauth_callback, null, conn.wait, conn.hold);
        },
        dataType:'json'
    });
};

//credits: http://www.netlobo.com/url_query_string_javascript.html
Strophe.Connection.prototype.gup = function(url, name) {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\#&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    if( results == null )
        return "";
    else
        return results[1];
};