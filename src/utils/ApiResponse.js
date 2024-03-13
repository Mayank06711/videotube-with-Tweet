class ApiResponse {
    constructor(statusCode, data, message = "Success from server ApiResponse") {
        // Initialize properties of the ApiResponse instance
        this.statusCode = statusCode; // HTTP status code of the response
        this.message = message; // Optional message describing the response (default value provided)
        this.data = data; // Data returned in the response
        this.success = statusCode < 400; // Indicates whether the request was successful (status code < 400)
    }
}

export {
    ApiResponse,
}