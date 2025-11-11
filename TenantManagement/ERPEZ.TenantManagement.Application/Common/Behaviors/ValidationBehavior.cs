using FluentValidation;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior that automatically validates requests using FluentValidation.
/// This behavior runs before the request handler and throws a ValidationException if validation fails.
/// Follows the Open/Closed Principle - validators can be added without modifying this behavior.
/// </summary>
/// <typeparam name="TRequest">The request type</typeparam>
/// <typeparam name="TResponse">The response type</typeparam>
public class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> validatorCollection = validators;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // If no validators are registered for this request type, skip validation
        if (!validatorCollection.Any())
        {
            return await next(cancellationToken);
        }

        // Create validation context
        var context = new ValidationContext<TRequest>(request);

        // Run all validators in parallel for better performance
        var validationResults = await Task.WhenAll(
            validatorCollection.Select(v => v.ValidateAsync(context, cancellationToken)));

        // Collect all validation failures
        var failures = validationResults
            .Where(r => !r.IsValid)
            .SelectMany(r => r.Errors)
            .ToList();

        // If there are validation failures, throw ValidationException
        if (failures.Count != 0)
        {
            throw new ValidationException(failures);
        }

        // Proceed to the next behavior or handler
        return await next(cancellationToken);
    }
}
