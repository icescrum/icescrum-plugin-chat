/*
 * Copyright (c) 2010 iceScrum Technologies.
 *
 * This file is part of iceScrum.
 *
 * iceScrum is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.
 *
 * iceScrum is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with iceScrum.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Authors:
 *
 * Vincent Barrier (vincent.barrier@icescrum.com)
 *
 */

import org.icescrum.components.UtilsWebComponents
import grails.plugins.springsecurity.Secured

@Secured('ROLE_ADMIN')
class ChatAdminController {

    static final id = 'chatAdmin'
    static ui = true
    static menuBar = [show:[visible:UtilsWebComponents.rendered(renderedOnRoles:"ROLE_ADMIN"),pos:1],title:'is.ui.admin']
    static window =  [title:'is.ui.admin',help:'is.ui.admin.help',toolbar:false]

    def index = {
      render 'test'
    }
}
