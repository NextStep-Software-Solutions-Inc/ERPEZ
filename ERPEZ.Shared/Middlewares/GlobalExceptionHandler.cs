using System.Net;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Shared.Middlewares;

public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        // Handle FluentValidation.ValidationException specifically
        if (exception is FluentValidation.ValidationException fluentValidationException)
        {
            httpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;

            var errors = fluentValidationException.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );

            var validationProblem = new ValidationProblemDetails(errors)
            {
                Status = (int)HttpStatusCode.BadRequest,
                Title = "Validation failed",
                Detail = "One or more validation errors occurred."
            };

            await httpContext.Response.WriteAsJsonAsync(ApiResponse<object>.Fail(validationProblem.Detail ?? "Validation failed"), cancellationToken);
            return true;
        }

        var (statusCode, title) = exception switch
        {
            ValidationException => ((int)HttpStatusCode.BadRequest, "Validation failed"),
            BadRequestException => ((int)HttpStatusCode.BadRequest, "Bad request"),
            UnauthorizedException => ((int)HttpStatusCode.Unauthorized, "Unauthorized"),
            ForbiddenException => ((int)HttpStatusCode.Forbidden, "Forbidden"),
            TooManyRequestsException => ((int)HttpStatusCode.TooManyRequests, "Too many requests"),
            ServiceUnavailableException => ((int)HttpStatusCode.ServiceUnavailable, "Service unavailable"),
            ConflictException => ((int)HttpStatusCode.Conflict, "Conflict occurred"),
            NotFoundException => ((int)HttpStatusCode.NotFound, "Resource not found"),
            _ => ((int)HttpStatusCode.InternalServerError, "An unexpected error occurred")
        };

        httpContext.Response.StatusCode = statusCode;

        if (exception is ValidationException vex && vex.Errors is not null)
        {
            var validationProblem = new ValidationProblemDetails(vex.Errors)
            {
                Status = statusCode,
                Title = "Validation failed",
                Detail = vex.Message
            };

            await httpContext.Response.WriteAsJsonAsync(ApiResponse<object>.Fail(validationProblem.Detail ?? vex.Message), cancellationToken);
            return true;
        }

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exception.Message
        };

        await httpContext.Response.WriteAsJsonAsync(ApiResponse<object>.Fail(problemDetails.Detail), cancellationToken);

        return true;
    }
}