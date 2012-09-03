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
<is:select
    container="#widget-content-${controllerName}"
    width="125"
    styleSelect="dropdown"
    from="${statusLabels}"
    keys="${statusKeys}"
    icons="${statusIcons}"
    value="${needConfiguration ? 'disc' : 'online'}"
    name="chatstatus"
    onchange="${needConfiguration ? '$(\'#chatstatus\').selectmenu(\'value\',$(\'#chatstatus option:last\').index()); return false;' : ''}jQuery.icescrum.chat.presenceChanged(jQuery('.ui-selectmenu-status').text(),jQuery(this).find('option:selected').val());"/>

<is:loadChatVar teamList="${teamList}"/>

  <a id="chat-list-show" onClick="jQuery.icescrum.chat.toggleRoster();" disabled="true">
    <g:message code="is.chat.ui.show"/> <span class=nb-contacts></span>
  </a>
  <a id="chat-list-hide" onClick="jQuery.icescrum.chat.toggleRoster();" disabled="true">
    <g:message code="is.chat.ui.hide"/> <span class=nb-contacts></span>
  </a>
<g:if test="${needConfiguration}">
  <div class="chat-need-configuration">
      <is:remoteDialog
              action="openProfile"
              controller="user"
              valid="[action:'update',controller:'user',onSuccess:'jQuery.event.trigger(\'updateProfile_user\',[data])']"
              title="is.dialog.profile"
              width="600"
              noprefix="true"
              resizable="false"
              draggable="false">
            <g:message code='is.chat.ui.needConfiguration'/>
      </is:remoteDialog>
      <br/>
  </div>
</g:if>
<div id="chat-manage">
     <div class="add-contact">
        <is:input id="chat-add-contact" name="addcontact"/><button onclick="$.icescrum.chat.requestNewContact();" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">${message(code:'is.chat.ui.add')}</button>
     </div>
 </div>
 <div id="chat-roster-list">
 </div>