modules = {
  'chat' {
      dependsOn 'icescrum'
      resource url: [dir: "css", file: 'chat.css', plugin:'icescrum-chat'], attrs: [media: 'screen,projection'], bundle:'icescrum'
      resource url: [dir: 'js/jquery', file: 'jquery.icescrum.chat.js', plugin:'icescrum-chat'],disposition: 'head', bundle:'icescrum'
      resource url: [dir: 'js/flXHR', file: 'flXHR.js', plugin:'icescrum-chat'],disposition: 'head', bundle:'icescrum'
      resource url: [dir: 'js/Strophe', file: 'strophe.min.js', plugin:'icescrum-chat'],disposition: 'head', bundle:'icescrum'
      resource url: [dir: 'js/Strophe/plugins', file: 'strophe.flxhr.min.js', plugin:'icescrum-chat'],disposition: 'head', bundle:'icescrum'
      resource url: [dir: 'js/jquery', file: 'jquery.icescrum.ui.chat.js', plugin:'icescrum-chat'],disposition: 'head', bundle:'icescrum'
      resource url: [dir: 'js/jquery', file: 'jquery.caret.js', plugin:'icescrum-chat'],disposition: 'head', bundle:'icescrum'
      resource url: [dir: 'js/jquery', file: 'jquery.emoticons.js', plugin:'icescrum-chat'],disposition: 'head', bundle:'icescrum'
  }
}