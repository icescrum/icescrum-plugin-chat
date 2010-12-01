<%@ page import="org.codehaus.groovy.grails.commons.ConfigurationHolder" %>
<%--
  Created by IntelliJ IDEA.
  User: Bertrand
  Date: 01/12/10
  Time: 11:19
  To change this template use File | Settings | File Templates.
--%>


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
