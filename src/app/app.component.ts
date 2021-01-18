import { Title } from '@angular/platform-browser';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { faAddressCard, faTimes, faHome, faAddressBook, faClock, faServer, faSignOutAlt, faUserCircle, faUser, faFlag } from '@fortawesome/free-solid-svg-icons';

import { environment } from './environments/environment';
import { LoggerService, AlertService, UserService, I18nService, LanguageService, EmojiService, DesktopNotificationService } from './_services';
import { User } from './_models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public loaded: boolean;
  public languagesLoading: boolean;
  public languagesLoaded: boolean;
  public askDesktopNotificationPermissions: boolean;
  public user: User;
  public isAdmin: boolean;
  public isMin: boolean;
  public version = environment.version;
  public emojiEnabled = environment.emoji;
  public showCurtain: boolean;
  public showEmoji: boolean;
  private ussSub: Subscription;
  private obSub: Subscription;
  private langsSub: Subscription;
  private langSub: Subscription;
  private rtSub: Subscription;
  private refreshInterval;
  private desktopNotificationTimeout = 60 * 1000;
  private desktopNotificationIntervalTimeout = 15 * 60 * 1000;

  public faAddressCard = faAddressCard;
  public faHome = faHome;
  public faAddressBook = faAddressBook;
  public faServer = faServer;
  public faUserCircle = faUserCircle;
  public faSignOutAlt = faSignOutAlt;
  public faUser = faUser;
  public faFlag = faFlag;
  public faClock = faClock;
  public faTimes = faTimes;

  constructor(
    private titleService: Title,
    public emojiService: EmojiService,
    public i18nService: I18nService,
    private languageService: LanguageService,
    private router: Router,
    private observer: BreakpointObserver,
    private logger: LoggerService,
    private alertService: AlertService,
    private userService: UserService,
    private desktopNotificationService: DesktopNotificationService
  ) {
    this.loaded = false;
    this.languagesLoaded = false;
    this.showCurtain = true;

    this.titleService.setTitle(i18nService.translate('app.name', 'RaspiSurveillance'));

    if (this.rtSub) {
      this.rtSub.unsubscribe();
    }
    this.rtSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.refreshRandomEmoji();
      }
    });
    if (this.ussSub) {
      this.ussSub.unsubscribe();
    }
    this.ussSub = this.userService.user.subscribe(x => {
      this.user = x;
      if (this.user) {
        this.isAdmin = this.userService.isAdmin();
        this.loaded = true;

        if (this.languagesLoaded) {
          this.enableRefresh();
        }
      } else {
        clearTimeout(this.refreshInterval);
      }
    },
      error => {
        this.logger.error(error);
        this.router.navigate(['/']);
        this.alertService.error(this.i18nService.translate('app.component.error.user.load', 'User could not be loaded.'));
      });

    if (this.obSub) {
      this.obSub.unsubscribe();
    }
    this.obSub = this.observer.observe(['(min-width: 520px)']).subscribe(result => {
      if (result.matches) {
        this.isMin = result.breakpoints['(min-width: 520px)'];
      } else {
        this.isMin = false;
      }
    });
  }

  ngOnInit() {
    this.logger.log('Initializing AppComponent');

    this.askDesktopNotificationPermissions = false; // TODO: this.desktopNotificationService.askForPermissions();

    // To prevent cyclic dependencies, we have to set up langauge and i18n services here
    this.prepareLanguages();
  }

  ngOnDestroy() {
    this.logger.log('Destroying AppComponent');

    clearTimeout(this.refreshInterval);
    if (this.langsSub) {
      this.langsSub.unsubscribe();
    }
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
    if (this.ussSub) {
      this.ussSub.unsubscribe();
    }
    if (this.obSub) {
      this.obSub.unsubscribe();
    }
  }

  removeDesktopNotificationsAlert() {
    this.logger.log('Removing alert');

    this.askDesktopNotificationPermissions = false;
  }

  refresh(logger, userService, sendNotificationFunc, desktopNotificationService, i18nService, desktopNotificationTimeout) {
    logger.log('Refreshing');
  }

  sendNotification(logger, desktopNotificationService, i18nService, desktopNotificationTimeout) {
    logger.log('Loading last desktop notification time from localStorage');
    let lastTimeStr = JSON.parse(localStorage.getItem('lastdesktopnotification'));
    let display = false;
    if (lastTimeStr) {
      let lastTime = parseInt(JSON.parse(localStorage.getItem('lastdesktopnotification')));
      if ((new Date().getTime() - lastTime) > desktopNotificationTimeout) {
        display = true;
      }
    } else {
      display = true;
    }
    if (display) {
      /*
      let url = `/${environment.usersPath.todos.due}`;
      desktopNotificationService.sendNotification(
        i18nService.translate('duetodos.notification.newduetodos.header', 'Due Todos'),
        i18nService.translate('duetodos.notification.newduetodos.body', 'There are due Todos. Click here to get to the overview.'),
        i18nService.translate('duetodos.notification.newduetodos.shortbody', 'There are due Todos. Navigate to "Due Todos" via the menu to get an overview.'),
        url
      );
      localStorage.setItem('lastdesktopnotification', '' + new Date().getTime());
      */
    }
  }

  setUpDesktopNotifications() {
    this.desktopNotificationService.askPermission().then(result => {
      this.askDesktopNotificationPermissions = false;
      if (result) {
        this.logger.log('Setting up refresh, desktop notifications are enabled');
        this.enableRefresh();
      } else {
        this.logger.log('Not setting up refresh, desktop notifications are not enabled');
      }
    });
  }

  enableRefresh() {
    clearTimeout(this.refreshInterval);
    this.refreshInterval = setInterval(this.refresh, this.desktopNotificationIntervalTimeout,
      this.logger, this.userService, this.sendNotification, this.desktopNotificationService, this.i18nService, this.desktopNotificationTimeout);
    this.refresh(this.logger, this.userService, this.sendNotification, this.desktopNotificationService, this.i18nService, this.desktopNotificationTimeout);
  }

  refreshRandomEmoji() {
    if (this.emojiEnabled) {
      this.showEmoji = Math.random() > 0.1;
      if (this.showEmoji) {
        this.emojiService.refreshRandomEmoji();
      }
    } else {
      this.showEmoji = false;
    }
  }

  prepareLanguages() {
    this.languagesLoading = true;

    if (this.langsSub) {
      this.langsSub.unsubscribe();
    }
    this.langsSub = this.languageService.getLanguages()
      .pipe(first())
      .subscribe(languages => {
        let langs = [];
        for (let key in languages) {
          langs.push({
            id: key,
            name: languages[key]
          });
        }
        this.logger.log('Available languages:');
        this.logger.log(langs);

        let loadLanguage = this.i18nService.setLanguages(langs);

        this.logger.log('Loading language "' + loadLanguage + '"');
        this.setLanguage(loadLanguage);
      },
        error => {
          this.logger.error(error);
          this.languagesLoaded = false;
          this.languagesLoading = false;
          this.showCurtain = false;
          this.alertService.error(this.i18nService.translate('app.component.error.language_load', 'Language information could not be loaded.'));
        });
  }

  setLanguage(language: string) {
    this.logger.log('Setting language to \"' + language + '\"');

    if (this.langSub) {
      this.langSub.unsubscribe();
    }
    this.langSub = this.languageService.getLanguage(language)
      .pipe(first())
      .subscribe(translations => {
        this.logger.log('Successfully loaded language');
        this.i18nService.setCurrentTranslations(language, translations);
        this.titleService.setTitle(this.i18nService.translate('app.name', 'RaspiSurveillance'));
        this.languagesLoaded = true;
        this.languagesLoading = false;
        this.showCurtain = false;

        if (this.user) {
          this.enableRefresh();
        }
      },
        error => {
          this.logger.error(error);
          this.languagesLoaded = false;
          this.languagesLoading = false;
          this.showCurtain = false;
          this.alertService.error(this.i18nService.translate('app.component.error.language_load', 'Language translations could not be loaded.'));
        });
    localStorage.setItem('language', JSON.stringify(language));
  }

  signout() {
    this.isAdmin = false;
    this.userService.signout();

    localStorage.removeItem('lastdesktopnotification');
    clearTimeout(this.refreshInterval);
    this.alertService.info(this.i18nService.translate('app.component.info.sign_out', 'Signed out successfully'), { autoClose: true });
  }

}
