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

<is:accordionSection title="is.chat.ui.dialog.chat.title">
    <is:fieldInput for="chatPreferences.username" label="is.chat.ui.dialog.chat.username">
      <is:input id="chatPreferences.username" name="chatPreferences.username" value="${chatPreferences.username}"/>
    </is:fieldInput>
    <is:fieldInput for="chatPreferences.password" label="is.chat.ui.dialog.chat.password">
      <is:password id="chatPreferences.password" name="chatPreferences.password" value="${chatPreferences.password}"/>
    </is:fieldInput>
    <is:fieldRadio for="chatPreferencesHideOffline" label="is.chat.ui.dialog.chat.hideOffline">
      <is:radio id="chatPreferencesHideOffline" name="chatPreferencesHideOffline" value="${chatPreferences.hideOffline}"/>
    </is:fieldRadio>
    <is:fieldInput for="chatPreferences.server" label="is.chat.ui.dialog.chat.server">
      <is:input id="chatPreferences.server" name="chatPreferences.server" value="${chatPreferences.server}"/>
    </is:fieldInput>
    <is:fieldInput for="chatPreferences.port" label="is.chat.ui.dialog.chat.port">
      <is:input id="chatPreferences.port" name="chatPreferences.port" value="${chatPreferences.port}"/>
    </is:fieldInput>
    <is:fieldInput for="chatPreferences.boshPath" label="is.chat.ui.dialog.chat.boshPath">
      <is:input id="chatPreferences.boshPath" name="chatPreferences.boshPath" value="${chatPreferences.boshPath}"/>
    </is:fieldInput>
    <is:fieldRadio for="chatPreferencesSecure" label="is.chat.ui.dialog.chat.secure" noborder="true">
      <is:radio id="chatPreferencesSecure" name="chatPreferencesSecure" value="${chatPreferences.secure}"/>
    </is:fieldRadio>
</is:accordionSection>