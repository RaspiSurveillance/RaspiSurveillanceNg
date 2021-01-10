import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { LoggerService } from './logger.service';
import { environment } from '../environments/environment';
import { Server } from '../_models/server.model';

@Injectable({
    providedIn: 'root'
})
export class ServerService {

    constructor(
        private http: HttpClient,
        private logger: LoggerService
    ) {
        // Nothing to see here...
    }

    getAll() {
        let url = `${environment.apiUrl}/${environment.serversPath.main}`;
        this.logger.log('Getting all servers, URL: ' + url);

        return this.http.get<Server[]>(url);
    }

    getById(id: string) {
        let url = `${environment.apiUrl}/${environment.serversPath.main}/${id}`;
        this.logger.log('Getting server, URL: ' + url);

        return this.http.get<Server>(url);
    }

    create(server: Server) {
        let url = `${environment.apiUrl}/${environment.serversPath.main}`;
        this.logger.log('Creating server, URL: ' + url);

        return this.http.post(url, server);
    }

    update(id, params) {
        let url = `${environment.apiUrl}/${environment.serversPath.main}/${id}`;
        this.logger.log('Updating server, URL: ' + url);

        return this.http.put(url, params);
    }

    delete(id: string) {
        let url = `${environment.apiUrl}/${environment.serversPath.main}/${id}`;
        this.logger.log('Deleting server, URL: ' + url);

        return this.http.delete(url);
    }

    startCamerastream(id) {
        let url = `${environment.apiUrl}/${environment.serversPath.main}/${id}/${environment.serversPath.start.main}/${environment.serversPath.start.camerastream}`;
        this.logger.log('Starting camerastream, URL: ' + url);

        return this.http.put(url, {});
    }

    startSurveillance(id) {
        let url = `${environment.apiUrl}/${environment.serversPath.main}/${id}/${environment.serversPath.start.main}/${environment.serversPath.start.surveillance}`;
        this.logger.log('Starting surveillance, URL: ' + url);

        return this.http.put(url, {});
    }

    stopServices(id) {
        let url = `${environment.apiUrl}/${environment.serversPath.main}/${id}/${environment.serversPath.stop}`;
        this.logger.log('Stopping serices, URL: ' + url);

        return this.http.put(url, {});
    }

    shutdown(id: string) {
        let url = `${environment.apiUrl}/${environment.serversPath.main}/${id}/${environment.serversPath.shutdown}`;
        this.logger.log('Shutting down server, URL: ' + url);

        return this.http.put(url, {});
    }

    refreshServer(id) {
        let url = `${environment.apiUrl}/${environment.serversPath.main}/${id}/${environment.serversPath.refresh}`;
        this.logger.log('Refreshing server, URL: ' + url);

        return this.http.put(url, {});
    }

}
