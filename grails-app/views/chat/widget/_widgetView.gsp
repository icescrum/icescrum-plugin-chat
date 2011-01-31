<r:use module="chat"/>

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

<is:loadChatVar teamList="${teamList}"/>

  <is:link id="chat-list-show" onClick="jQuery.icescrum.chat.displayRoster();" disabled="true">
    <g:message code="is.chat.ui.show"/> <g:message code="is.chat.ui.connected"/> <span class=nb-contacts></span>
  </is:link>
  <is:link id="chat-list-hide" onClick="jQuery.icescrum.chat.displayRoster();" disabled="true">
    <g:message code="is.chat.ui.hide"/> <g:message code="is.chat.ui.connected"/> <span class=nb-contacts></span>
  </is:link>
 <div id="chat-roster-list">
 </div>