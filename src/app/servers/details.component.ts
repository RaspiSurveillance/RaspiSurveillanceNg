import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { first } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { faInfo, faCamera, faVideo, faServer, faTrashAlt, faPlusCircle, faEdit, faList, faListOl, faCircle, faPlay, faStop, faSync } from '@fortawesome/free-solid-svg-icons';

import { ModalConfirm } from '../_modals/confirmation.modal';
import { LoggerService, AlertService, ServerService, I18nService, UserService } from '../_services';

@Component({
    templateUrl: 'details.component.html',
    styleUrls: ['./servers.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
    public loading = false;
    public deletingServer = false;
    public server = null;
    public shortenSName: number = 15;
    public id: string;
    public isAdmin: boolean;
    public refreshing = false;
    private rtSub: Subscription;
    private sSub: Subscription;
    private obSub: Subscription;

    public faSync = faSync;
    public faInfo = faInfo;
    public faServer = faServer;
    public faCamera = faCamera;
    public faVideo = faVideo;
    public faTrashAlt = faTrashAlt;
    public faPlusCircle = faPlusCircle;
    public faEdit = faEdit;
    public faList = faList;
    public faListOl = faListOl;
    public faCircle = faCircle;
    public faPlay = faPlay;
    public faStop = faStop;

    constructor(
        public i18nService: I18nService,
        private observer: BreakpointObserver,
        private router: Router,
        private route: ActivatedRoute,
        private alertService: AlertService,
        private serverService: ServerService,
        private logger: LoggerService,
        private userService: UserService,
        private modalService: NgbModal
    ) {
        // Nothing to see here...
    }

    ngOnInit() {
        this.rtSub = this.route.params.subscribe(params => this.init());

        this.observerScreenSize();
        this.isAdmin = this.userService.isAdmin();
    }

    ngOnDestroy() {
        this.logger.log('Destroying DetailsComponent (Server)');

        if (this.rtSub) {
            this.rtSub.unsubscribe();
        }
        if (this.sSub) {
            this.sSub.unsubscribe();
        }
        if (this.obSub) {
            this.obSub.unsubscribe();
        }
    }

    init() {
        this.logger.log('Initializing DetailsComponent (Server)');

        this.loading = true;
        this.refreshing = true;

        this.id = this.route.snapshot.params['id'];

        if (this.sSub) {
            this.sSub.unsubscribe();
        }
        this.sSub = this.serverService.getById(this.id)
            .pipe(first())
            .subscribe(x => {
                this.server = x;
                this.loading = false;
                this.refreshing = false;
            },
                error => {
                    this.logger.error(error);
                    this.router.navigate(['/']);
                    this.alertService.error(this.i18nService.translate('servers.details.component.error.server_load', 'Server could not be loaded.'));
                });
    }

    refresh() {
        this.logger.log('Refreshing server');

        this.refreshing = true;
        if (this.sSub) {
            this.sSub.unsubscribe();
        }
        this.sSub = this.serverService.refreshServer(this.id)
            .pipe(first())
            .subscribe(x => {
                this.server = x;
                this.loading = false;
                this.refreshing = false;
            },
                error => {
                    this.logger.error(error);
                    this.router.navigate(['/']);
                    this.alertService.error(this.i18nService.translate('servers.details.component.error.server_load', 'Server could not be loaded.'));
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
                    this.shortenSName = 85;
                } else if (result.breakpoints['(min-width: 700px)']) {
                    this.shortenSName = 60;
                } else if (result.breakpoints['(min-width: 600px)']) {
                    this.shortenSName = 60;
                } else if (result.breakpoints['(min-width: 500px)']) {
                    this.shortenSName = 50;
                } else if (result.breakpoints['(min-width: 400px)']) {
                    this.shortenSName = 32;
                } else if (result.breakpoints['(min-width: 300px)']) {
                    this.shortenSName = 24;
                } else {
                    this.shortenSName = 20;
                }
            } else {
                this.shortenSName = 20;
            }
        });
    }

    deleteServer(id: string) {
        this.logger.log('Delete server.');

        this.deletingServer = true;

        const activeModal = this.modalService.open(ModalConfirm);
        activeModal.componentInstance.header = this.i18nService.translate('servers.details.component.modal.delete.header', 'Confirm server deletion');
        activeModal.componentInstance.text = this.i18nService.translate('servers.details.component.modal.delete.text', 'Are you sure that you want to delete the server "%sName%"?', { 'sName': this.server.name });
        activeModal.componentInstance.text2 = this.i18nService.translate('servers.details.component.modal.delete.text2', 'This server will be permanently deleted.');
        activeModal.componentInstance.textDanger = this.i18nService.translate('servers.details.component.modal.delete.textDanger', 'This operation can not be made undone.');
        activeModal.result.then(() => {
            this.logger.log('Deleting server.');

            if (this.sSub) {
                this.sSub.unsubscribe();
            }
            this.sSub = this.serverService.delete(id)
                .pipe(first())
                .subscribe(() => {
                    this.logger.log('Server deleted');
                    this.router.navigate(['/servers']);
                    this.alertService.info(this.i18nService.translate('servers.details.component.success.server_delete', 'Server "%sName%" deleted.', { 'sName': this.server.name }), { autoClose: true });
                },
                    error => {
                        this.logger.error(error);
                        this.alertService.error(this.i18nService.translate('servers.details.component.error.server_delete', 'Server "%sName%" could not be deleted.', { 'sName': this.server.name }));
                        this.deletingServer = false;
                    });
        },
            () => {
                this.logger.log('Canceling server deletion.');
                this.deletingServer = false;
            });
    }

    startCamerastream(id: string) {
        this.logger.log('Starting camerastream.');

        this.sSub = this.serverService.startCamerastream(id)
            .pipe(first())
            .subscribe(s => {
                this.server = s;
                this.logger.log('Started camerastream');
                this.alertService.info(this.i18nService.translate('servers.details.component.success.camerastream_start', 'Started camerastream on server "%sName%".', { 'sName': this.server.name }), { autoClose: true });
            },
                error => {
                    this.logger.error(error);
                    this.alertService.error(this.i18nService.translate('servers.details.component.error.camerastream_start', 'Camerastream on server "%sName%" could not be started.', { 'sName': this.server.name }));
                });
    }

    startSurveillance(id: string) {
        this.logger.log('Starting surveillance.');

        this.sSub = this.serverService.startSurveillance(id)
            .pipe(first())
            .subscribe(s => {
                this.server = s;
                this.logger.log('Started surveillance');
                this.alertService.info(this.i18nService.translate('servers.details.component.success.surveillance_start', 'Started surveillance on server "%sName%".', { 'sName': this.server.name }), { autoClose: true });
            },
                error => {
                    this.logger.error(error);
                    this.alertService.error(this.i18nService.translate('servers.details.component.error.surveillance_start', 'Surveillance on server "%sName%" could not be started.', { 'sName': this.server.name }));
                });
    }

    stopServices(id: string) {
        this.logger.log('Stopping services.');

        this.sSub = this.serverService.stopServices(id)
            .pipe(first())
            .subscribe(s => {
                this.server = s;
                this.logger.log('Stopped services');
                this.alertService.info(this.i18nService.translate('servers.details.component.success.stop', 'Stopped services on server "%sName%".', { 'sName': this.server.name }), { autoClose: true });
            },
                error => {
                    this.logger.error(error);
                    this.alertService.error(this.i18nService.translate('servers.details.component.error.stop', 'Services on server "%sName%" could not be stopped.', { 'sName': this.server.name }));
                });
    }

}
