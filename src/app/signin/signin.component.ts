﻿import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { LoggerService, UserService, AlertService, I18nService } from '../_services';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: 'signin.component.html',
    styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit, OnDestroy {
    public form: FormGroup;
    public loading = false;
    public submitted = false;
    public returnUrl: string;
    public signupEnabled: boolean;
    private sgSub: Subscription;

    constructor(
        public i18nService: I18nService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private alertService: AlertService,
        private logger: LoggerService
    ) {
        // Nothing to see here...
    }

    ngOnInit() {
        this.logger.log('Initializing SigninComponent');

        this.form = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        this.signupEnabled = environment.signup;
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    ngOnDestroy() {
        this.logger.log('Destroying SigninComponent');

        if (this.sgSub) {
            this.sgSub.unsubscribe();
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

        this.sgSub = this.userService.signin(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.logger.log('Signed in successfully');

                    this.router.navigate([this.returnUrl]);
                    this.alertService.clearAll();
                    this.alertService.success(this.i18nService.translate('signin.component.sign_in_success', 'Signed in successfully.'));
                },
                error => {
                    this.logger.error(error);
                    this.alertService.error(this.i18nService.translate('signin.component.sign_in_fail', 'User could not be signed in.'));
                    this.loading = false;
                });
    }

}
