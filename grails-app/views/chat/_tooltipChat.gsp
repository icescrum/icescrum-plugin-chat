<%--*
 * Copyright (c) 2011 BE ISI iSPlugins Université Paul Sabatier.
 *
 * This file is part of iceScrum.
 *
 * Chat plugin is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.
 *
 * Chat plugin is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Chat plugin.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Authors:	Claude AUBRY (claude.aubry@gmail.com)
 *		Vincent Barrier (vbarrier@kagilum.com)
 *		Marc-Antoine BEAUVAIS (marcantoine.beauvais@gmail.com)
 *		Jihane KHALIL (khaliljihane@gmail.com)
 *		Paul LABONNE (paul.labonne@gmail.com)
 *		Nicolas NOULLET (nicolas.noullet@gmail.com)
 *		Bertrand PAGES (pages.bertrand@gmail.com)
 *
 *
 *--%>

<div>
  <div class="chat-tooltip-left">
    <is:avatar userid="${m.id}" class="ico"/>
  </div>
  <div class="chat-tooltip-right">
    <span class="ui-chat-user-status-${escapedJid} ui-chat-status ui-chat-status-offline" title="">
      <is:scrumLink controller="user" action='profile' id="${escapedJid}">${m.firstName.encodeAsHTML()} ${m.lastName.encodeAsHTML()}</is:scrumLink>
    </span>
    <span class="ui-chat-user-status-text ui-chat-user-status-text-${escapedJid}"></span>
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
          jid="${escapedJid}"
          disabled="true"
          value="${message(code:'is.chat.ui.tooltip.talk')}"
          history="false"/>
  </div>
</div>
<jq:jquery>
  var user = $('#chat-user-status-${escapedJid}');
  $('.chat-tooltip-right .ui-chat-user-status-${escapedJid}')
        .removeClass()
        .addClass('ui-chat-user-status-${escapedJid} ui-chat-status ui-chat-status-'+user.attr('status'));
  $('.chat-tooltip-right .ui-chat-user-status-text-${escapedJid}').text(user.attr('title'));
</jq:jquery>