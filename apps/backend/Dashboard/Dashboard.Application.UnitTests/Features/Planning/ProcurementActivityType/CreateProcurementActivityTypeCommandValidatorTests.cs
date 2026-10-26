using ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.CreateProcurementActivityType;
using FluentValidation.TestHelper;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.ProcurementActivityType;

public class CreateProcurementActivityTypeCommandValidatorTests
{
    private readonly CreateProcurementActivityTypeCommandValidator validator = new();

    [Fact]
    public void Should_Pass_When_Command_Is_Valid()
    {
        var command = new CreateProcurementActivityTypeCommand
        {
            Name = "Notice of Award",
            ActivityCode = "NOA01",
            Description = "Notice of award activity description",
            MinDays = 1,
            MaxDays = 5
        };

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Should_Fail_When_ActivityCode_Is_Empty(string activityCode)
    {
        var command = new CreateProcurementActivityTypeCommand
        {
            Name = "Valid Name",
            ActivityCode = activityCode,
            Description = "Valid Description"
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ActivityCode)
            .WithErrorMessage("Activity code is required.");
    }

    [Fact]
    public void Should_Fail_When_ActivityCode_Exceeds_10_Characters()
    {
        var command = new CreateProcurementActivityTypeCommand
        {
            Name = "Valid Name",
            ActivityCode = "CODEEXCEEDS10",
            Description = "Valid Description"
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
    [InlineData("ACT@1")]
    public void Should_Fail_When_ActivityCode_Contains_Invalid_Characters(string activityCode)
    {
        var command = new CreateProcurementActivityTypeCommand
        {
            Name = "Valid Name",
            ActivityCode = activityCode,
            Description = "Valid Description"
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ActivityCode)
            .WithErrorMessage("Activity code must contain only uppercase letters and digits.");
    }

    [Theory]
    [InlineData("A")]
    [InlineData("1")]
    [InlineData("ACT01")]
    [InlineData("1234567890")]
    [InlineData("ABCDEFGHIJ")]
    public void Should_Pass_When_ActivityCode_Is_Valid_Uppercase_Alphanumeric(string activityCode)
    {
        var command = new CreateProcurementActivityTypeCommand
        {
            Name = "Valid Name",
            ActivityCode = activityCode,
            Description = "Valid Description"
        };

        var result = validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.ActivityCode);
    }

    [Fact]
    public void Should_Fail_When_Name_Is_Empty()
    {
        var command = new CreateProcurementActivityTypeCommand
        {
            Name = "",
            ActivityCode = "ACT01",
            Description = "Valid Description"
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("Name is required.");
    }

    [Fact]
    public void Should_Fail_When_Description_Is_Empty()
    {
        var command = new CreateProcurementActivityTypeCommand
        {
            Name = "Valid Name",
            ActivityCode = "ACT01",
            Description = ""
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Description)
            .WithErrorMessage("Description is required.");
    }

    [Fact]
    public void Should_Fail_When_MaxDays_Is_Less_Than_MinDays()
    {
        var command = new CreateProcurementActivityTypeCommand
        {
            Name = "Valid Name",
            ActivityCode = "ACT01",
            Description = "Valid Description",
            MinDays = 10,
            MaxDays = 5
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x)
            .WithErrorMessage("MaxDays must be greater than or equal to MinDays.");
    }
}
