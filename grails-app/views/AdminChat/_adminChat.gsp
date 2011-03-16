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

<%@ page import="org.codehaus.groovy.grails.commons.ConfigurationHolder" %>

<form id="adminForm" name="adminForm" method="post" class='box-form box-form-small-legend box-content box-form-180' onsubmit="$('input[name=adminButton]').click();return false;">
  <is:fieldInformation nobordertop="true">
    <g:message code="is.chat.ui.chatadmin"/>
  </is:fieldInformation>
  <is:fieldRadio for="enabled" label="is.chat.ui.enabled">
      <is:radio from="[(message(code: 'is.chat.ui.yes')): '0', (message(code: 'is.chat.ui.no')): '1']" id="enabled" name="enabled" value="${enabled}"/>
    </is:fieldRadio>
  <is:fieldInput for="server" label="is.chat.ui.server">
    <is:input id="server" name="server" value="${server.encodeAsHTML()}" />
  </is:fieldInput>
  <is:fieldInput for="port" label="is.chat.ui.port">
    <is:input id="port" name="port" value="${port.encodeAsHTML()}" />
  </is:fieldInput>
  <is:fieldInput for="resource" label="is.chat.ui.resource">
    <is:input id="resource" name="resource" value="${resource.encodeAsHTML()}" />
  </is:fieldInput>
  <is:buttonBar id="admin-button-bar">
    <is:button
              targetLocation="chatAdmin"
              id="modify"
              type="submitToRemote"
              url="[controller:'chatAdmin', action:'modify']"
              value="${message(code:'is.chat.ui.modify')}"/>
   </is:buttonBar>
</form>
