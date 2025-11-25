// API Carto IGN base URL
export const API_BASE_URL = "https://apicarto.ign.fr/api";
// Character limit for responses
export const CHARACTER_LIMIT = 50000;
// Response format enum
export var ResponseFormat;
(function (ResponseFormat) {
    ResponseFormat["JSON"] = "json";
    ResponseFormat["MARKDOWN"] = "markdown";
})(ResponseFormat || (ResponseFormat = {}));
// API Error
export class ApiCartoError extends Error {
    statusCode;
    details;
    constructor(message, statusCode, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = "ApiCartoError";
    }
}
//# sourceMappingURL=types.js.map