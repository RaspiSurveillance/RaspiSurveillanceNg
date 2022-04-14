import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { LoggerService, ServerService, AlertService, I18nService } from '../_services';
import { Server } from '../_models';

@Component({
    templateUrl: 'add-edit.component.html',
    styleUrls: ['./servers.component.scss']
})
export class AddEditComponent implements OnInit, OnDestroy {
    public form: FormGroup;
    public isAddMode: boolean;
    public loading = false;
    public submitted = false;
    public id: string;
    private rtSub: Subscription;
    private wssSub: Subscription;

    constructor(
        public i18nService: I18nService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private serverService: ServerService,
        private alertService: AlertService,
        private logger: LoggerService
    ) {
        // Nothing to see here...
    }

    ngOnInit() {
        this.rtSub = this.route.params.subscribe(params => this.init());
    }

    ngOnDestroy() {
        this.logger.log('Destroying AddEditComponent (Server)');

        if (this.rtSub) {
            this.rtSub.unsubscribe();
        }
    }

    init() {
        this.logger.log('Initializing AddEditComponent (Server)');

        this.loading = true;

        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        this.form = this.formBuilder.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            urlMaster: ['', [Validators.maxLength(100)]],
            idMaster: ['', [Validators.maxLength(100)]],
            usernameMaster: ['', [Validators.maxLength(100)]],
            passwordMaster: ['', [Validators.maxLength(100)]],
            url: ['', [Validators.required, Validators.maxLength(100)]],
            username: ['', [Validators.maxLength(100)]],
            password: ['', [Validators.maxLength(100)]],
            isMaster: [false],
            hasServiceCamerastream: [false],
            hasServiceSurveillance: [false],
            urlCamerastream: ['', [Validators.maxLength(100)]],
            usernameCamerastream: ['', [Validators.maxLength(100)]],
            passwordCamerastream: ['', [Validators.maxLength(100)]],
            attributesCamerastream: [null],
            attributesSurveillance: [null]
        });

        if (!this.isAddMode) {
            if (this.wssSub) {
                this.wssSub.unsubscribe();
            }
            this.wssSub = this.serverService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.f.name.setValue(x.name);
                    this.f.urlMaster.setValue(x.urlMaster);
                    this.f.idMaster.setValue(x.idMaster);
                    this.f.usernameMaster.setValue(x.usernameMaster);
                    this.f.passwordMaster.setValue(x.passwordMaster);
                    this.f.url.setValue(x.url);
                    this.f.username.setValue(x.username);
                    this.f.password.setValue(x.password);
                    this.f.isMaster.setValue(x.isMaster);
                    this.f.hasServiceCamerastream.setValue(x.hasServiceCamerastream);
                    this.f.hasServiceSurveillance.setValue(x.hasServiceSurveillance);
                    this.f.urlCamerastream.setValue(x.urlCamerastream);
                    this.f.usernameCamerastream.setValue(x.usernameCamerastream);
                    this.f.passwordCamerastream.setValue(x.passwordCamerastream);
                    this.f.attributesCamerastream.setValue(this.getAttributeString(x.attributesCamerastream));
                    this.f.attributesSurveillance.setValue(this.getAttributeString(x.attributesSurveillance));
                    this.loading = false;
                },
                    error => {
                        this.logger.error(error);
                        this.router.navigate(['/']);
                        this.alertService.error(this.i18nService.translate('servers.addedit.component.error.server_load', 'Server could not be loaded.'));
                    });
        } else {
            this.loading = false;
        }
    }

    get f() {
        return this.form.controls;
    }

    onSubmit() {
        this.loading = true;
        this.submitted = true;

        this.alertService.clearAll();

        if (this.form.invalid) {
            this.loading = false;
            return;
        }

        if (this.isAddMode) {
            this.createServer();
        } else {
            this.updateServer();
        }
    }

    // --o1 v1, --o2 v2
    private getAttributeMap(str: string): Map<string, string> {
        let strJson = new Map<string, string>();
        if (str) {
            let allAttrs = str.trim().split(',');
            for (let attrDupI in allAttrs) {
                let keyVal = allAttrs[attrDupI].trim().split(' ');
                if (keyVal.length != 2) {
                    this.logger.warn('Could not parse attribute "' + allAttrs[attrDupI] + '"');
                    continue;
                }
                strJson[keyVal[0].trim()] = keyVal[1].trim();
            }
            this.logger.log(strJson);
        }

        return strJson;
    }

    private getAttributeString(map: Map<string, string>): string {
        let str = '';
        let i = 0;
        for (let key in map) {
            let tmpStr = '';
            if (i > 0) {
                tmpStr += ', ';
            }
            ++i;
            tmpStr += key + ' ' + map[key];
            str += tmpStr;
        }

        return str;
    }

    private createServer() {
        this.logger.log('Creating server');

        this.loading = true;

        let server = new Server(
            null,
            this.form.controls.name.value,
            this.form.controls.urlMaster.value,
            this.form.controls.idMaster.value,
            this.form.controls.usernameMaster.value,
            this.form.controls.passwordMaster.value,
            this.form.controls.url.value,
            this.form.controls.username.value,
            this.form.controls.password.value,
            this.form.controls.isMaster.value,
            this.form.controls.hasServiceCamerastream.value,
            this.form.controls.hasServiceSurveillance.value,
            this.form.controls.urlCamerastream.value,
            this.form.controls.usernameCamerastream.value,
            this.form.controls.passwordCamerastream.value,
            this.getAttributeMap(this.form.controls.attributesCamerastream.value),
            this.getAttributeMap(this.form.controls.attributesSurveillance.value),
            null,
            null);
        if (this.wssSub) {
            this.wssSub.unsubscribe();
        }
        this.wssSub = this.serverService.create(server)
            .pipe(first())
            .subscribe(
                data => {
                    this.logger.log('Server successfully created');
                    this.router.navigate(['/servers', data['id']]);
                    this.alertService.success(this.i18nService.translate('servers.addedit.component.success.server_created', 'Server successfully created.'));
                },
                error => {
                    this.logger.error(error);
                    this.alertService.error(this.i18nService.translate('servers.addedit.component.error.server_created', 'Server could not be created.'));
                    this.loading = false;
                });
    }

    private updateServer() {
        this.logger.log('Updating server');

        this.loading = true;

        let server = new Server(
            null,
            this.form.controls.name.value,
            this.form.controls.urlMaster.value,
            this.form.controls.idMaster.value,
            this.form.controls.usernameMaster.value,
            this.form.controls.passwordMaster.value,
            this.form.controls.url.value,
            this.form.controls.username.value,
            this.form.controls.password.value,
            this.form.controls.isMaster.value,
            this.form.controls.hasServiceCamerastream.value,
            this.form.controls.hasServiceSurveillance.value,
            this.form.controls.urlCamerastream.value,
            this.form.controls.usernameCamerastream.value,
            this.form.controls.passwordCamerastream.value,
            this.getAttributeMap(this.form.controls.attributesCamerastream.value),
            this.getAttributeMap(this.form.controls.attributesSurveillance.value),
            null,
            null);
        if (this.wssSub) {
            this.wssSub.unsubscribe();
        }
        this.wssSub = this.serverService.update(this.id, server)
            .pipe(first())
            .subscribe(
                data => {
                    this.logger.log('Server successfully updated');
                    this.router.navigate(['/servers', data['id']]);
                    this.alertService.success(this.i18nService.translate('servers.addedit.component.success.server_updated', 'Server successfully updated.'));
                },
                error => {
                    this.logger.error(error);
                    this.alertService.error(this.i18nService.translate('servers.addedit.component.error.server_updated', 'Server could not be updated.'));
                    this.loading = false;
                });
    }

}
