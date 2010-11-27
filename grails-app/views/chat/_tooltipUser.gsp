<div>
  <div class="chat-tooltip-left">
    <is:avatar userid="${m.id}" class="ico"/>
  </div>
  <div class="chat-tooltip-right">
    <span id="" class="ui-chat-user-status-${m.username} ui-chat-status ui-chat-status-offline" title="">
      <is:scrumLink controller="user" action='profile' id="${m.username}">${m.firstName} ${m.lastName}</is:scrumLink>
    </span>
    <span class="ui-chat-user-status-text">Status perso</span>
    <g:if test="${tasks}">
      <span class="chat-user-task-title">
        <strong>
          <g:message code="is.chat.ui.tooltip.currentTasks" args="[nbtasks]"/>
        </strong>
      </span>
      <g:each in="${tasks}" var="task" status="i">
        <g:if test="${i < 3}">
          <span class="chat-user-task">
            <is:scrumLink product="${task.backlog.parentRelease.parentProduct.pkey}" controller="sprintBacklog" id="${task.backlog.id}">
              ${task.name.encodeAsHTML()}
            </is:scrumLink>
          </span>
        </g:if>
      </g:each>
    </g:if>
    <g:else>
      <span class="chat-user-task-title">
        <strong><g:message code="is.chat.ui.tooltip.notasks"/></strong>
      </span>
    </g:else>
  </div>
  <div class="chat-tooltip-bottom">
    <is:button
          type="link"
          class="chat-user-link"
          username="${m.username}"
          disabled="true"
          value="${message(code:'is.chat.ui.talk')}"
          history="false"/>
  </div>
</div>
<jq:jquery>
  $('.chat-tooltip-right .ui-chat-user-status-${m.username}')
        .removeClass()
        .addClass('ui-chat-user-status-${m.username} ui-chat-status ui-chat-status-'+$('#chat-user-status-${m.username}').attr('status'));
</jq:jquery>