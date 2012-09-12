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
    <is:fieldRadio for="chatPreferencesEnabled" label="is.chat.ui.dialog.chat.enabled">
      <is:radio id="chatPreferencesEnabled" name="chatPreferencesEnabled" value="${!chatPreferences.disabled}"/>
    </is:fieldRadio>
    <is:fieldRadio for="chatPreferencesHideOffline" label="is.chat.ui.dialog.chat.hideOffline">
      <is:radio id="chatPreferencesHideOffline" name="chatPreferencesHideOffline" value="${chatPreferences.hideOffline}"/>
    </is:fieldRadio>
    <is:fieldSelect for="method" label="is.story.type" noborder="${chatPreferences.oauth?true:false}" class="select-auth">
        <is:select
                width="240"
                maxHeight="200"
                styleSelect="dropdown"
                from="${oauthKeys}"
                keys="${oauthValues}"
                name="method"
                change="if (jQuery(this).val() == 'manual'){ jQuery('.manual-auth').show(); jQuery('p.select-auth').removeClass('field-noseparator'); }else{jQuery('.manual-auth').hide(); jQuery('p.select-auth').addClass('field-noseparator');}"
                value="${chatPreferences.oauth?:'manual'}"/>
    </is:fieldSelect>
    <is:fieldInput class="manual-auth" style="display:${chatPreferences.oauth?'none':'block'};" for="chatPreferences.username" label="is.chat.ui.dialog.chat.username">
      <is:input id="chatPreferences.username" name="chatPreferences.username" value="${chatPreferences.username}"/>
    </is:fieldInput>
    <is:fieldInput class="manual-auth" style="display:${chatPreferences.oauth?'none':'block'};" for="chatPreferences.password" label="is.chat.ui.dialog.chat.password">
      <is:password id="chatPreferences.password" name="chatPreferences.password" value="${chatPreferences.password}"/>
    </is:fieldInput>
    <is:fieldInput class="oauth_saved" style="display:none;" for="oauth_saved" label="is.chat.ui.dialog.chat.oauthSaved">
        <jq:jquery>
            $.icescrum.chat.displaySavedOauth();
        </jq:jquery>
    </is:fieldInput>
</is:accordionSection>