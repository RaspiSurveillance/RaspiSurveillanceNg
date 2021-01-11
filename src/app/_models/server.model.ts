export class Server {

    constructor(
        public id: string,
        public name: string,
        public urlMaster: string,
        public idMaster: string,
        public usernameMaster: string,
        public passwordMaster: string,
        public url: string,
        public username: string,
        public password: string,
        public isMaster: boolean,
        public hasServiceCamerastream: boolean,
        public hasServiceSurveillance: boolean,
        public urlCamerastream: string,
        public usernameCamerastream: string,
        public passwordCamerastream: string,
        public attributesCamerastream: Map<string, string>,
        public attributesSurveillance: Map<string, string>,
        public status: string,
        public jsonData: string
    ) {
        // Nothing to see here...
    }

}
