export class Server {

    constructor(
        public id: string,
        public name: string,
        public url: string,
        public username: string,
        public password: string,
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
