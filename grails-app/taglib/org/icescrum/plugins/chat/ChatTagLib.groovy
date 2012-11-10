/*
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
 */

package org.icescrum.plugins.chat
import org.icescrum.core.domain.User
import org.icescrum.core.domain.Task

class ChatTagLib {

  static namespace = 'is'

    def springSecurityService
    def chatService
    def grailsApplication

    def loadChatVar = { attrs,body ->
      def config = grailsApplication.config.icescrum.chat
      def user = User.get(springSecurityService.principal.id)
      def chatPreferences = chatService.getChatPreferences(user)
      def jsCode = """var icescrumChat = {
                            server: '${config.bosh.server}',
                            port: '${config.bosh.port}',
                            boshPath: '${config.bosh.path}',
                            hideOffline: ${chatPreferences.hideOffline},
                            teamList: '${attrs.teamList.encodeAsJavaScript()}',
                            disabled: ${chatPreferences.needConfiguration()},
                            emoticonsDir : '${resource(plugin: 'icescrum-plugin-chat', dir: '/images/emoticons')}',
                            resource : '${config.resource}',
                            currentStatus : {
                                show:'${chatPreferences.show}',
                                presence:'${chatPreferences.presence?chatPreferences.presence.encodeAsJavaScript():''}'
                            },"""
       if (chatPreferences.oauth){
            jsCode +=       """
                            ${chatPreferences.oauth}:{
                                apiKey: '${config[chatPreferences.oauth].apiKey}',
                                redirecturi: '${createLink(controller:'chat', action: 'oauth', absolute: true)}',
                            },"""
       }
       jsCode +=            """
                            i18n:{
                                teamNonIcescrum:'${message(code:'is.chat.ui.teamNonIcescrum').encodeAsJavaScript()}',
                                alertNewMessages:'${message(code:'is.chat.ui.alertNewMessages').encodeAsJavaScript()}',
                                me:'${message(code:'is.chat.me').encodeAsJavaScript()}',
                                connectionError:'${message(code:'is.chat.error.server').encodeAsJavaScript()}',
                                connecting:'${message(code:'is.chat.connecting').encodeAsJavaScript()}',
                                authenticating:'${message(code:'is.chat.authenticating').encodeAsJavaScript()}',
                                loginError:'${message(code:'is.chat.error.login').encodeAsJavaScript()}',
                                disconnected:'${message(code:'is.chat.disconnected').encodeAsJavaScript()}',
                                connected:'${message(code:'is.chat.connected').encodeAsJavaScript()}',
                                yes:'${message(code:'is.chat.ui.yes').encodeAsJavaScript()}',
                                no:'${message(code:'is.chat.ui.no').encodeAsJavaScript()}',
                                requestSent:'${message(code:'is.chat.ui.request.sent').encodeAsJavaScript()}',
                                accept:'${message(code:'is.chat.ui.accept').encodeAsJavaScript()}',
                                requestError:'${message(code:'is.chat.ui.request.error').encodeAsJavaScript()}',
                                authorization:'${message(code:'is.chat.ui.authorization').encodeAsJavaScript()}',
                                remove:'${message(code:'is.chat.ui.remove').encodeAsJavaScript()}',
                                video:{
                                        notSupported:'${message(code:'is.chat.ui.video.not.supported').encodeAsJavaScript()}',
                                        inCall:'${message(code:'is.chat.ui.video.in.call').encodeAsJavaScript()}',
                                        peerError:'${message(code:'is.chat.ui.video.error.peer').encodeAsJavaScript()}',
                                        streamError:'${message(code:'is.chat.ui.video.error.stream').encodeAsJavaScript()}',
                                        confirmHangup:'${message(code:'is.chat.ui.video.confirm.hangup').encodeAsJavaScript()}'
                                }
                            }
                        };"""
      out << g.javascript(null, jsCode)
    }
}
