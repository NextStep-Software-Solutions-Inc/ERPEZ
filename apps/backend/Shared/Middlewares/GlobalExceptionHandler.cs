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
                Detail = "One or more validation errors occurred. Check the data property for details."
            };

            // Pass the detailed ValidationProblemDetails object as the data payload
            var failResponse = new ApiResponse<object>
            {
                Succeeded = false,
                Message = validationProblem.Detail,
                Errors = validationProblem.Errors
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
        if (exception is DbUpdateException dbEx)
        {
            httpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            string detailMessage;

            if (dbEx.InnerException is PostgresException pgEx)
            {
                var (errorMessage, _) = Common.PostgresErrorCodes.GetErrorMessage(pgEx.SqlState);
                detailMessage = !string.IsNullOrWhiteSpace(pgEx.Detail)
                    ? $"{errorMessage}: {pgEx.Detail}"
                    : (!string.IsNullOrWhiteSpace(pgEx.MessageText) ? $"{errorMessage}: {pgEx.MessageText}" : errorMessage);
            }
            else if (dbEx.InnerException != null)
            {
                detailMessage = dbEx.InnerException.Message;
            }
            else
            {
                detailMessage = dbEx.Message;
            }

            await httpContext.Response.WriteAsJsonAsync(ApiResponse<object>.Fail(detailMessage), cancellationToken);
            return true;
        }

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
