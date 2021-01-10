export const environment = {
    production: false,
    apiUrl: (window['env'] && window['env']['apiUrl']) ? window['env']['apiUrl'] : 'http://localhost:9090/api',
    version: (window['env'] && window['env']['version']) ? window['env']['version'] : ' unregistered',
    signup: (window['env'] && window['env']['signup']) ? window['env']['signup'] != 'DISABLED' : true,
    appname: (window['env'] && window['env']['appname']) ? window['env']['appname'] : 'RaspiSurveillance',
    emoji: (window['env'] && window['env']['emoji']) ? window['env']['emoji'] != 'DISABLED' : false,
    issueTracker: (window['env'] && window['env']['issueTracker']) ? window['env']['issueTracker'] : 'https://github.com/RaspiSurveillance/RaspiSurveillanceNg/issues',
    connectionPath: {
        main: 'connection',
        available: 'available',
        authorized: 'authorized',
    },
    authPath: {
        main: 'auth',
        signup: 'signup',
        signin: 'signin'
    },
    i18nPath: {
        main: 'i18n',
        languages: 'languages'
    },
    usersPath: {
        main: 'users',
        password: {
            main: 'password',
            forgot: 'forgot',
            reset: 'reset'
        },
        verify: {
            main: 'verify',
            resend: 'resend'
        }
    },
    serversPath: {
        main: 'servers',
        start: {
            main: 'start',
            camerastream: 'camerastream',
            surveillance: 'surveillance'
        },
        stop: 'stop',
        refresh: 'refresh',
        shutdown: 'shutdown'
    }
};
