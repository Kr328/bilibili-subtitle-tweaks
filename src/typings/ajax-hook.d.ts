import 'ajax-hook';

declare module 'ajax-hook' {
    interface XhrRequestConfig {
        originUrl?: string;
        transform?: boolean;
        translate?: boolean;
        inject?: boolean;
    }
}
