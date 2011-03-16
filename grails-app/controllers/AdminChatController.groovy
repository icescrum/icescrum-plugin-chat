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

import grails.plugins.springsecurity.Secured

import grails.converters.JSON
import org.icescrum.components.UtilsWebComponents
import org.icescrum.plugins.chat.ChatUtils

@Secured('ROLE_ADMIN')
class AdminChatController {

    static final id = 'adminChat'
    static ui = true
    //static menuBar = [show:[visible:UtilsWebComponents.rendered(renderedOnRoles:"ROLE_ADMIN"),pos:0],title:'is.ui.admin']
    static window =  [title:'is.ui.admin',help:'is.ui.admin.help',toolbar:false]

    def springSecurityService

    def index = {

      def server = ChatUtils.chatConfig.icescrum.chat.server
      def port = ChatUtils.chatConfig.icescrum.chat.port
      def resource = ChatUtils.chatConfig.icescrum.chat.resource
      def enabled = 1
      if(ChatUtils.chatConfig.icescrum.chat.enabled)
        enabled = 0
      render template:'adminChat',plugin:'icescrum-chat',
              model:[server: server,
                      port: port,
                      resource: resource,
                      enabled: enabled
              ]
    }

    def modify = {
      ChatUtils.chatConfig.icescrum.chat.server = params.server
      ChatUtils.chatConfig.icescrum.chat.port = params.port
      ChatUtils.chatConfig.icescrum.chat.resource = params.resource
      System.out.println(params.enabled.equals("0"))
      if(params.enabled.equals("0"))
        ChatUtils.chatConfig.icescrum.chat.enabled = true
      else
        ChatUtils.chatConfig.icescrum.chat.enabled = false
      render(status:200, contentType: 'application/json', text: [notice: [text: message(code: 'is.chat.ui.ismodify')]] as JSON)

    }
}
