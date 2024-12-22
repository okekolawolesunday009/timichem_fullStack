class ResponseHelper {
  static success(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    })
  }

  static error(res, message = "Internal Server Error", statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    }

    if (errors) {
      response.errors = errors
    }

    if (process.env.NODE_ENV === "development" && statusCode === 500) {
      response.stack = new Error().stack
    }

    return res.status(statusCode).json(response)
  }

  static validationError(res, errors) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
      timestamp: new Date().toISOString(),
    })
  }

  static notFound(res, resource = "Resource") {
    return res.status(404).json({
      success: false,
      message: `${resource} not found`,
      timestamp: new Date().toISOString(),
    })
  }

  static unauthorized(res, message = "Unauthorized access") {
    return res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    })
  }

  static forbidden(res, message = "Insufficient permissions") {
    return res.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    })
  }
}

module.exports = ResponseHelper
