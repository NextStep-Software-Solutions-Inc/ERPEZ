using FluentAssertions;
using FluentValidation;
using FluentValidation.TestHelper;

namespace ERPEZ.TenantManagement.Application.UnitTests;

/// <summary>
/// Base class for validator unit tests providing common testing utilities.
/// </summary>
public abstract class ValidatorTestBase<TValidator, TCommand>
    where TValidator : AbstractValidator<TCommand>, new()
    where TCommand : class
{
    protected readonly TValidator validator;

    protected ValidatorTestBase()
    {
        validator = new TValidator();
    }

    /// <summary>
    /// Asserts that validation passes for a valid command.
    /// </summary>
    protected void AssertValidationPasses(TCommand command)
    {
        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    /// <summary>
    /// Asserts that validation fails for an invalid command with specific error messages.
    /// </summary>
    protected void AssertValidationFails(TCommand command, params string[] expectedErrorMessages)
    {
        var result = validator.TestValidate(command);
        result.ShouldHaveAnyValidationError();

        foreach (var expectedMessage in expectedErrorMessages)
        {
            result.Errors.Should().Contain(error => error.ErrorMessage.Contains(expectedMessage));
        }
    }

    /// <summary>
    /// Asserts that a specific property has validation errors.
    /// </summary>
    protected void AssertPropertyHasError(TCommand command, string propertyName, string expectedErrorMessage)
    {
        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(propertyName)
              .WithErrorMessage(expectedErrorMessage);
    }
}