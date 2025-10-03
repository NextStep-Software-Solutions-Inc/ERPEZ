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
        var (statusCode, title) = exception switch
        {
            ConflictException => ((int)HttpStatusCode.Conflict, "Conflict occurred"),
            NotFoundException => ((int)HttpStatusCode.NotFound, "Resource not found"),
            _ => ((int)HttpStatusCode.InternalServerError, "An unexpected error occurred")
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exception.Message
        };

        httpContext.Response.StatusCode = problemDetails.Status.Value;

        await httpContext.Response.WriteAsJsonAsync(ApiResponse<object>.Fail(problemDetails.Detail), cancellationToken);

        return true;
    }
}