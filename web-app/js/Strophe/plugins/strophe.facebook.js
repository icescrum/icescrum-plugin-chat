/*
    most of code is from (https://github.com/javierfigueroa/turedsocial).
    
    modified to remove app_secret from html and javascript
    
    MIT license.
*/

/**
 * Split a string by string
 * @param delimiter string The boundary string.
 * @param string string The input string.
 * @param limit int[optional] If limit is set and positive, the returned array will contain
 * 		a maximum of limit elements with the last
 * 		element containing the rest of string.
 * 
 * 		If the limit parameter is negative, all components
 * 		except the last -limit are returned.
 * 
 * 		If the limit parameter is zero, then this is treated as 1.
 * 
 * @returns array If delimiter is an empty string (""),
 * 		explode will return false.
 * 		If delimiter contains a value that is not
 * 		contained in string and a negative
 * 		limit is used, then an empty array will be
 * 		returned. For any other limit, an array containing
 * 		string will be returned.
 */
function explode(delimiter, string, limit) {
         var emptyArray = { 0: '' };
        
        // third argument is not required
        if ( arguments.length < 2 ||
            typeof arguments[0] == 'undefined' || typeof arguments[1] == 'undefined' ) {
            return null;
        }
     
        if ( delimiter === '' || delimiter === false ||
            delimiter === null ) {
            return false;
        }
        
        if ( typeof delimiter == 'function' || typeof delimiter == 'object' ||
            typeof string == 'function' || typeof string == 'object' ) {
            	return emptyArray;    
        }
     
        if ( delimiter === true ) {
            delimiter = '1';
        }  
        
        if (!limit) {
            return string.toString().split(delimiter.toString());
        } else {
            // support for limit argument        
        	var splitted = string.toString().split(delimiter.toString());
            var partA = splitted.splice(0, limit - 1);
            var partB = splitted.join(delimiter.toString());
            partA.push(partB);
            return partA;   
        }   
};

/**
 *  Handler for X-FACEBOOK-PLATFORM SASL authentication.
 *
 *  @param (XMLElement) elem - The challenge stanza.
 *
 *  @returns false to remove the handler.
 */
Strophe.Connection.prototype._sasl_challenge1_fb = function (elem)
    {
        var challenge = Base64.decode(Strophe.getText(elem));
        var nonce = "";
        var method = "";
        var version = "";

        // remove unneeded handlers
        this.deleteHandler(this._sasl_failure_handler);

        var challenges = explode("&", challenge);
        for(i=0; i<challenges.length; i++) 
        {
        	map = explode("=", challenges[i]);
        	switch (map[0]) 
        	{
        		case "nonce":
        			nonce = map[1];
        			break;
        		case "method":
        			method = map[1];
        			break;
        		case "version":
        			version = map[1];
        			break;
          }
        }

        var responseText = "";

        responseText += 'api_key=' + this.oauth_apiKey;
        responseText += '&call_id=' + (Math.floor(new Date().getTime()/1000));
        responseText += '&method=' + method;
        responseText += '&nonce=' + nonce;
        responseText += '&access_token=' + this.oauth_accessToken;
        responseText += '&v=' + '1.0';
        
        this._sasl_challenge_handler = this._addSysHandler(
            this._sasl_digest_challenge2_cb.bind(this), null,
            "challenge", null, null);
        this._sasl_success_handler = this._addSysHandler(
            this._sasl_success_cb.bind(this), null,
            "success", null, null);
        this._sasl_failure_handler = this._addSysHandler(
            this._sasl_failure_cb.bind(this), null,
            "failure", null, null);
        
        this.send($build('response', {
            xmlns: Strophe.NS.SASL
        }).t(Base64.encode(responseText)).tree());

        return false;
};

/**
 *  Handler for initial connection request with Facebokk.
 *
 *  This handler is used to process the initial connection request
 *  response from the BOSH server. It is used to set up authentication
 *  handlers and start the authentication process.
 *
 *  SASL authentication will be attempted if available, otherwise
 *  the code will fall back to legacy authentication.
 *
 *  @param (Strophe.Request) req - The current request.
 */
Strophe.Connection.prototype._connect_cb_facebook = function (req) {
        Strophe.info("_connect_cb_facebook was called");

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

        // check to make sure we don't overwrite these if _connect_cb_facebook is
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
        var i, mech, auth_str, hashed_auth_str, xfacebook;
        if (mechanisms.length == 0) {
            // we didn't get stream:features yet, so we need wait for it
            // by sending a blank poll request
            var body = this._buildBody();
            this._requests.push(
            	new Strophe.Request(body.tree(),
                                this._onRequestStateChange.bind(
                                    this, this._connect_cb_facebook.bind(this)),
                                body.tree().getAttribute("rid")));
                                    
            this._throttledRequestHandler();
            return;
        } else {
        	for (i = 0; i < mechanisms.length; i++) {
                mech = Strophe.getText(mechanisms[i]);
                if (mech == 'X-FACEBOOK-PLATFORM') {
                	xfacebook = true;
                	break;
                }
            }
        }
        
        if (!xfacebook)	{
        	return;
        }
        
        this._changeConnectStatus(Strophe.Status.AUTHENTICATING, null);
        this._sasl_challenge_handler = this._addSysHandler(
            this._sasl_challenge1_fb.bind(this), null,
            "challenge", null, null);
        this._sasl_failure_handler = this._addSysHandler(
            this._sasl_challenge1_fb.bind(this), null,
            "failure", null, null);

        this.send($build("auth", {
            xmlns: Strophe.NS.SASL,
            mechanism: "X-FACEBOOK-PLATFORM"
        }).tree());
};

Strophe.Connection.prototype.oauth_facebook_login = function(apiKey, redirect, resource, callback, accessToken, wait, hold) {
    var conn = this;
    conn.oauth_provider = 'facebook';
    conn.oauth_callback = callback;
    conn.connect_callback = callback;
    conn.oauth_apiKey = apiKey;
    conn.oauth_facebook_url =   'http://www.facebook.com/dialog/oauth/?';
    conn._connect_callback = conn._connect_cb_facebook;
    conn.oauth_accessToken = accessToken || null;
    conn.wait = wait || conn.wait;
    conn.hold = hold || conn.hold;
    conn.oauth_resource = resource || 'strophe';
    if (!conn.oauth_accessToken){
        var win  = window.open(conn.oauth_facebook_url + 'scope=xmpp_login&client_id=' + conn.oauth_apiKey + '&redirect_uri=' + redirect + '&response_type=token', "oauth", 'width=750, height=350');
        var pollTimer = window.setInterval(function() {
            if (!win){
                window.clearInterval(pollTimer);
                alert('Can\'t open popup to connect to facebook');
                conn._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
            }
            if (win.closed){
                window.clearInterval(pollTimer);
                conn._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
            }
            else if (win.document && win.document.URL.indexOf(redirect) != -1) {
                window.clearInterval(pollTimer);
                var url =   win.document.URL;
                conn.oauth_accessToken = conn.gup(url, 'access_token');
                win.close();
                if (conn.oauth_accessToken){
                    conn.oauth_get_username_facebook(apiKey, redirect);
                }else{
                    conn._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
                }
            }
        }, 2000);
    }else{
        conn.oauth_get_username_facebook(apiKey, redirect);
    }
};

Strophe.Connection.prototype.oauth_get_username_facebook = function(apiKey, redirect) {
    var conn = this;
    $.ajax({
        url: "https://graph.facebook.com/me?access_token=" + conn.oauth_accessToken,
        success: function(data){
            conn.connect(data.username + "@chat.facebook.com/" + conn.oauth_resource, null, conn.oauth_callback);
        },
        error:function(){
            conn.oauth_facebook_login(apiKey, redirect, conn.oauth_resource, conn.oauth_callback, null, conn.wait, conn.hold);
        },
        dataType:'json'
    });
};