using ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.UpdateProcurementActivityType;
using FluentValidation.TestHelper;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.ProcurementActivityType;

public class UpdateProcurementActivityTypeCommandValidatorTests
{
    private readonly UpdateProcurementActivityTypeCommandValidator validator = new();

    [Fact]
    public void Should_Pass_When_Command_Is_Valid_With_ActivityCode()
    {
        var command = new UpdateProcurementActivityTypeCommand
        {
            Id = Guid.NewGuid(),
            Name = "Updated Name",
            ActivityCode = "ACT01",
            Description = "Updated Description",
            MinDays = 2,
            MaxDays = 10
        };

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Should_Pass_When_ActivityCode_Is_Null_Or_Empty(string? activityCode)
    {
        var command = new UpdateProcurementActivityTypeCommand
        {
            Id = Guid.NewGuid(),
            ActivityCode = activityCode
        };

        var result = validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.ActivityCode);
    }

    [Fact]
    public void Should_Fail_When_ActivityCode_Exceeds_10_Characters()
    {
        var command = new UpdateProcurementActivityTypeCommand
        {
            Id = Guid.NewGuid(),
            ActivityCode = "ABCDEFGHIJK" // 11 characters
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ActivityCode)
            .WithErrorMessage("Activity code cannot exceed 10 characters.");
    }

    [Theory]
    [InlineData("act01")]
    [InlineData("Act01")]
    [InlineData("ACT-01")]
    [InlineData("ACT_01")]
    [InlineData("ACT 01")]
    [InlineData("ACT#1")]
    public void Should_Fail_When_ActivityCode_Contains_Invalid_Characters(string activityCode)
    {
        var command = new UpdateProcurementActivityTypeCommand
        {
            Id = Guid.NewGuid(),
            ActivityCode = activityCode
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ActivityCode)
            .WithErrorMessage("Activity code must contain only uppercase letters and digits.");
    }

    [Fact]
    public void Should_Fail_When_Id_Is_Empty()
    {
        var command = new UpdateProcurementActivityTypeCommand
        {
            Id = Guid.Empty,
            ActivityCode = "ACT01"
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Id)
            .WithErrorMessage("Id is required.");
    }

    [Fact]
    public void Should_Fail_When_MaxDays_Is_Less_Than_MinDays()
    {
        var command = new UpdateProcurementActivityTypeCommand
        {
            Id = Guid.NewGuid(),
            MinDays = 15,
            MaxDays = 5
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x)
            .WithErrorMessage("MaxDays must be greater than or equal to MinDays.");
    }
}
