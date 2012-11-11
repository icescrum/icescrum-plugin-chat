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

modules = {
  'chat' {
      dependsOn 'jquery-plugins'
      resource url: [dir: "css", file: 'chat.css', plugin:'icescrum-plugin-chat'], attrs: [media: 'screen,projection'], bundle: 'icescrum'
      resource url: [dir: 'js/jquery', file: 'jquery.icescrum.chat.js', plugin:'icescrum-plugin-chat'], bundle: 'icescrum'
      resource url: [dir: 'js/jquery', file: 'jquery.icescrum.chat.video.js', plugin:'icescrum-plugin-chat'], bundle: 'icescrum'
      resource url: [dir: 'js/flXHR', file: 'flXHR.js', plugin:'icescrum-plugin-chat'], bundle: 'icescrum'
      resource url: [dir: 'js/Strophe', file: 'strophe.min.js', plugin:'icescrum-plugin-chat'], bundle: 'icescrum'
      resource url: [dir: 'js/Strophe/plugins', file: 'strophe.flxhr.min.js', plugin:'icescrum-plugin-chat'], bundle: 'icescrum'
      resource url: [dir: 'js/Strophe/plugins', file: 'strophe.facebook.js', plugin:'icescrum-plugin-chat'], bundle: 'icescrum'
      resource url: [dir: 'js/Strophe/plugins', file: 'strophe.gtalk.js', plugin:'icescrum-plugin-chat'], bundle: 'icescrum'
      resource url: [dir: 'js/Strophe/plugins', file: 'strophe.live.js', plugin:'icescrum-plugin-chat'], bundle: 'icescrum'
      resource url: [dir: 'js/Strophe/plugins', file: 'strophe.roster.js', plugin:'icescrum-plugin-chat'], bundle: 'icescrum'
      resource url: [dir: 'js/Strophe/plugins', file: 'strophe.chatstates.js', plugin:'icescrum-plugin-chat'], bundle: 'icescrum'
      resource url: [dir: 'js/jquery', file: 'jquery.icescrum.ui.chat.js', plugin:'icescrum-plugin-chat'], bundle: 'icescrum'
      resource url: [dir: 'js/jquery', file: 'jquery.caret.js', plugin:'icescrum-plugin-chat'], bundle: 'icescrum'
      resource url: [dir: 'js/jquery', file: 'jquery.emoticons.js', plugin:'icescrum-plugin-chat'], bundle: 'icescrum'
  }
}