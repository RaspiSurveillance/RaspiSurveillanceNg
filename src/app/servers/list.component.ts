import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { first } from 'rxjs/operators';
import { faServer, faPlusCircle, faInfoCircle, faSync, faCircle, faVideo, faCamera } from '@fortawesome/free-solid-svg-icons';

import { LoggerService, ServerService, AlertService, I18nService, UserService } from '../_services';
import { Server } from '../_models';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: 'list.component.html',
    styleUrls: ['./servers.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
    public loading = false;
    public refreshing = false;
    public error = false;
    public servers = [];
    public shortenSName: number = 15;
    public isAdmin: boolean;
    private sSub: Subscription;
    private obSub: Subscription;

    public faServer = faServer;
    public faPlusCircle = faPlusCircle;
    public faInfoCircle = faInfoCircle;
    public faSync = faSync;
    public faCircle = faCircle;
    public faVideo = faVideo;
    public faCamera = faCamera;

    constructor(
        public i18nService: I18nService,
        private observer: BreakpointObserver,
        private alertService: AlertService,
        private serverService: ServerService,
        private userService: UserService,
        private logger: LoggerService
    ) {
        this.observerScreenSize();
    }

    ngOnInit() {
        this.logger.log('Initializing ListComponent (Servers)');

        this.loading = true;
        this.isAdmin = this.userService.isAdmin();
        this.refresh();
    }

    ngOnDestroy() {
        this.logger.log('Destroying ListComponent (Servers)');

        if (this.sSub) {
            this.sSub.unsubscribe();
        }
        if (this.obSub) {
            this.obSub.unsubscribe();
        }
    }

    refresh() {
        this.logger.log('Refreshing servers');

        this.refreshing = true;
        if (this.sSub) {
            this.sSub.unsubscribe();
        }
        this.sSub = this.serverService.getAll()
            .pipe(first())
            .subscribe(servers => {
                this.servers = servers;
                servers.sort(function (a: Server, b: Server) {
                    return a.name.localeCompare(b.name);
                });
                this.loading = false;
                this.refreshing = false;
                this.error = false;
            },
                error => {
                    this.logger.error(error);
                    this.alertService.error(this.i18nService.translate('servers.list.component.error.servers_load', 'Servers could not be loaded.'));
                    this.loading = false;
                    this.refreshing = false;
                    this.error = true;
                });
    }

    observerScreenSize(): void {
        this.obSub = this.observer.observe([
            '(min-width: 300px)',
            '(min-width: 400px)',
            '(min-width: 500px)',
            '(min-width: 600px)',
            '(min-width: 700px)',
            '(min-width: 800px)'
        ]).subscribe(result => {
            if (result.matches) {
                if (result.breakpoints['(min-width: 800px)']) {
                    this.shortenSName = 90;
                } else if (result.breakpoints['(min-width: 700px)']) {
                    this.shortenSName = 65;
                } else if (result.breakpoints['(min-width: 600px)']) {
                    this.shortenSName = 60;
                } else if (result.breakpoints['(min-width: 500px)']) {
                    this.shortenSName = 50;
                } else if (result.breakpoints['(min-width: 400px)']) {
                    this.shortenSName = 40;
                } else if (result.breakpoints['(min-width: 300px)']) {
                    this.shortenSName = 30;
                } else {
                    this.shortenSName = 25;
                }
            } else {
                this.shortenSName = 25;
            }
        });
    }

    deleteServer(id: string) {
        const server = this.servers.find(x => x.id === id);
        server.isDeleting = true;
        if (this.sSub) {
            this.sSub.unsubscribe();
        }
        this.sSub = this.serverService.delete(id)
            .pipe(first())
            .subscribe(() => {
                this.servers = this.servers.filter(x => x.id !== id)
            });
    }

}
