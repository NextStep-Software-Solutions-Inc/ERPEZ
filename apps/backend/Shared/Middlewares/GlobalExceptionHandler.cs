using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Net;

namespace ERPEZ.Shared.Middlewares;

public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is OperationCanceledException || cancellationToken.IsCancellationRequested)
        {
            return true;
        }

        if (exception is FluentValidation.ValidationException fluentValidationException)
        {
            httpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;

            var errors = fluentValidationException.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );

            var firstError = fluentValidationException.Errors.FirstOrDefault()?.ErrorMessage;

            var fallbackMessage = !string.IsNullOrWhiteSpace(fluentValidationException.Message) && !fluentValidationException.Message.StartsWith("Validation failed:", StringComparison.OrdinalIgnoreCase)
                ? fluentValidationException.Message
                : "One or more validation errors occurred.";

            var message = !string.IsNullOrWhiteSpace(firstError)
                ? firstError
                : fallbackMessage;

            if (errors.Count == 0 && !string.IsNullOrWhiteSpace(message))
            {
                errors["General"] = [message];
            }

            var failResponse = new ApiResponse<object>
            {
                Succeeded = false,
                Message = message,
                Errors = errors
            };

            await httpContext.Response.WriteAsJsonAsync(failResponse, cancellationToken);
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
            DbUpdateException => ((int)HttpStatusCode.BadRequest, "Database operation failed"),
            _ => ((int)HttpStatusCode.InternalServerError, "An unexpected error occurred")
        };

        httpContext.Response.StatusCode = statusCode;

        // Handle database-specific exceptions with user-friendly messages
        if (exception is DbUpdateException dbEx && dbEx.InnerException is PostgresException pgEx)
        {
            // Use the comprehensive PostgreSQL error dictionary
            var (errorMessage, _) = Common.PostgresErrorCodes.GetErrorMessage(pgEx.SqlState);

            await httpContext.Response.WriteAsJsonAsync(ApiResponse<object>.Fail(errorMessage), cancellationToken);
            return true;
        }

        if (exception is ValidationException vex)
        {
            var errors = vex.Errors ?? new Dictionary<string, string[]> { { "General", [vex.Message] } };

            await httpContext.Response.WriteAsJsonAsync(ApiResponse<object>.Fail(errors, vex.Message), cancellationToken);
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
