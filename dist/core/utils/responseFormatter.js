/**
 * Formats a successful API response.
 */
export const success = (res, data, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, data });
};
/**
 * Formats an error API response.
 */
export const error = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({ success: false, error: message });
};
//# sourceMappingURL=responseFormatter.js.map