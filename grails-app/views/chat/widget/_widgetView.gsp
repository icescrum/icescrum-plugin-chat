<%-- resourceLink is only used in dev env / production env will bundle chat.css in application css --%>
<r:resourceLink url="[dir:'css',file:'chat.css',plugin:'icescrum-chat']"  media="screen, projection"/>

<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/flXHR', file: 'flXHR.js')}"></script>
<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/Strophe', file: 'strophe.min.js')}"></script>
<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/Strophe/plugins', file: 'strophe.flxhr.min.js')}"></script>

<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/jquery', file: 'jquery.icescrum.ui.chat.js')}"></script>
<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/jquery', file: 'jquery.icescrum.chat.js')}"></script>
<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/jquery', file: 'jquery.caret.js')}"></script>
<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/jquery', file: 'jquery.emoticons.js')}"></script>

<is:select
    container="#widget-content-${id}"
    width="125"
    styleSelect="dropdown"
    from="${statusLabels}"
    keys="${statusKeys}"
    icons="${statusIcons}"
    value="${message(code:'is.chat.status.disconnected')}"
    name="chatstatus"
    onchange="jQuery.icescrum.chat.presenceChanged(jQuery('.ui-selectmenu-status').text(),jQuery(this).find('option:selected').val());"/>

<is:loadChatJSContext teamList="${teamList}"/>

  <is:link id="chat-list-show" onClick="jQuery.icescrum.chat.displayRoster();" disabled="true">
    <g:message code="is.chat.ui.show"/> <g:message code="is.chat.ui.connected"/> <span class=nb-contacts></span>
  </is:link>
  <is:link id="chat-list-hide" onClick="jQuery.icescrum.chat.displayRoster();" disabled="true">
    <g:message code="is.chat.ui.hide"/> <g:message code="is.chat.ui.connected"/> <span class=nb-contacts></span>
  </is:link>
 <div id="chat-roster-list">
 </div>