#!/bin/sh
rm -rf /usr/share/nginx/html/assets/env.js
echo "(function (window) { window['env'] = window['env'] || {}; window['env']['apiUrl'] = '${API_URL}'; window['env']['version'] = '${VERSION}'; window['env']['signup'] = '${SIGNUP}'; window['env']['appname'] = '${APPNAME}'; window['env']['appname_de'] = '${APPNAME_DE}'; window['env']['emoji'] = '${EMOJI}'; window['env']['issueTracker'] = '${ISSUE_TRACKER_URL}'; })(this);" >> /usr/share/nginx/html/assets/env.js
# cat /usr/share/nginx/html/assets/env.js