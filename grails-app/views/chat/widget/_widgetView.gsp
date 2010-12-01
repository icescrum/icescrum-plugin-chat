<%-- resourceLink is only used in dev env / production env will bundle chat.css in application css --%>
<r:resourceLink url="[dir:'css',file:'chat.css',plugin:'icescrum-chat']"  media="screen, projection"/>

<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/flXHR', file: 'flXHR.js')}"></script>
<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/Strophe', file: 'strophe.min.js')}"></script>
<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/Strophe/plugins', file: 'strophe.flxhr.min.js')}"></script>

<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/jquery', file: 'jquery.icescrum.ui.chat.js')}"></script>
<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/jquery', file: 'jquery.icescrum.chat.js')}"></script>
<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/jquery', file: 'jquery.caret.js')}"></script>
<script type="text/javascript" src="${resource(plugin: 'icescrum-chat', dir: '/js/jquery', file: 'jquery.emoticons.js')}"></script>



<is:loadChatJSContext teamList="${teamList}"/>
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
    <g:message code="is.chat.ui.show"/> <g:message code="is.chat.ui.connected"/> <span class=nb-contacts></span>
  </is:link>
  <is:link id="chat-list-hide" onClick="jQuery.icescrum.chat.displayRoster();" disabled="true">
    <g:message code="is.chat.ui.hide"/> <g:message code="is.chat.ui.connected"/> <span class=nb-contacts></span>
  </is:link>
 <div id="chat-roster-list">
 </div>

<jq:jquery>
  $('#chatstatus-button .ui-selectmenu-status')
    .bind('mousedown', function(event){
        event.stopPropagation();
    })
    .editable($.icescrum.chat.customPresence,{
      type : 'statut-editable',
      onsubmit:function(settings,original){
        if($(this).find('input').val() == ''){
          original.reset();
          return false;
        }
      },
      width:'75px',
      height:'10px',
      onblur:'submit'
    });
</jq:jquery>