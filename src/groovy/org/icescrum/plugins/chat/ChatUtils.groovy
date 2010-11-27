package org.icescrum.plugins.chat

import grails.util.Environment

/**
 * Created by IntelliJ IDEA.
 * User: pollo
 * Date: 28/10/10
 * Time: 20:01
 * To change this template use File | Settings | File Templates.
 */
class ChatUtils {
	private static ConfigObject chatConfig;

    public static synchronized ConfigObject getChatConfig() {
		if (chatConfig == null) {
			reloadChatConfig()
		}
		return chatConfig
	}

    public static reloadChatConfig(){
      GroovyClassLoader classLoader = new GroovyClassLoader(ChatUtils.class.getClassLoader());
      ConfigSlurper slurper = new ConfigSlurper(Environment.getCurrent().getName());
      ConfigObject config = new ConfigObject()
	  try {
         config = slurper.parse(classLoader.loadClass('DefaultChatConfig'))
      } catch (Exception e) {}
      chatConfig = config
    }

}
