export declare const middlewares: {
    requestMiddleWare(config: any): any;
    requestError(error: any): any;
    responseMiddleWare(response: any): any;
    responseError(error: any): any;
};
declare const nextAxiosNetwork: (axios: any) => void;
export default nextAxiosNetwork;
