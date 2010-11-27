<%-- resourceLink is only used in dev env / production env will bundle chat.css in application css --%>
<r:resourceLink url="[dir:'css',file:'chat.css',plugin:'icescrum-chat']"  media="screen, projection"/>

<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/flXHR', file: 'flXHR.js')}"></script>
<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/Strophe', file: 'strophe.min.js')}"></script>
<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/Strophe/plugins', file: 'strophe.flxhr.min.js')}"></script>

<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/jquery', file: 'jquery.icescrum.ui.chat.js')}"></script>
<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/jquery', file: 'jquery.icescrum.chat.js')}"></script>

<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/jquery', file: 'jquery.emoticons.js')}"></script>



<is:loadChatJSContext teamList="${jsonTeamList}"/>
<jq:jquery>
  jQuery.icescrum.emoticons.initialize("${resource(plugin: 'icescrum-chat', dir: '/images/emoticons')}");
</jq:jquery>

  <is:select
    container="#widget-content-${id}"
    width="125"
    styleSelect="dropdown"
    from="${statusLabels}"
    keys="${statusKeys}"
    icons="${statusIcons}"
    value="${message(code:'is.chat.status.disconnected')}"
    name="chatstatus"
    onchange="jQuery.icescrum.chat.presenceChanged(jQuery('.ui-selectmenu-status span').text(),jQuery(this).find('option:selected').val());"/>

  <is:link id="chat-list-show" onClick="jQuery.icescrum.chat.displayRoster();" disabled="true">
    <g:message code="is.chat.ui.show"/> <g:message code="is.chat.ui.connected" args="${[nbTeamMembers,hasTeamMembers]}" />
  </is:link>
  <is:link id="chat-list-hide" onClick="jQuery.icescrum.chat.displayRoster();" disabled="true">
    <g:message code="is.chat.ui.hide"/> <g:message code="is.chat.ui.connected" args="${[nbTeamMembers,hasTeamMembers]}" />
  </is:link>
  <div id="chat-roster-list">
    <g:if test="${nbTeamMembers > 0}">
      <g:each in="${teamList}" var="t">
        <ul class="chat-group">
          <span class="chat-group-title">${t.name}</span>
          <g:each in="${t.members}" var="m">
            <g:if test="${m.id != user.id}">
              <li>
                <div id="chat-user-status-${m.username}" class="ui-chat-user-status-${m.username} ui-chat-status ui-chat-status-offline" status="offline" title="">
                  <is:link id="chat-user-${m.id}" disabled="true" class="chat-user-link" username="${m.username}" name="${m.firstName} ${m.lastName}">
                    <is:truncated size="20">${m.firstName} ${m.lastName}</is:truncated>
                  </is:link>
                </div>
                <is:tooltipChat id="${m.id}"/>
              </li>
            </g:if>
          </g:each>
        </ul>
      </g:each>
    </g:if>
  </div>
