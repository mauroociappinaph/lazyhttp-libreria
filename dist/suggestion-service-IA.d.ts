export declare class SuggestionService {
    private serviceUrl;
    private enabled;
    constructor(serviceUrl?: string);
    enable(): Promise<boolean>;
    getSuggestion(error: any, request?: Request): Promise<string>;
    provideFeedback(error: any, request: Request | undefined, suggestion: string, wasHelpful: boolean): Promise<void>;
}
export declare const suggestionService: SuggestionService;
