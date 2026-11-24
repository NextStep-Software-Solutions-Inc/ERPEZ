using ERPEZ.Application.Features.Planning.KPIAssignment.Validators;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.KPIAssignment;

public class KPIAssignmentBehaviorValidatorTests
{
    private readonly KPIAssignmentBehaviorValidator validator = new();

    [Fact]
    public void ValidateUniformQuarterly_WhenAllFourQuartersMatchAnnual_Succeeds()
    {
        // Act
        var act = () => validator.ValidateUniformQuarterly(
            "Program Implementation Rate",
            assignedAnnualTarget: 90m,
            q1: 90m, q2: 90m, q3: 90m, q4: 90m);

        // Assert
        act.Should().NotThrow();
    }

    [Fact]
    public void ValidateUniformQuarterly_WhenTwoQuartersAre90AndOthersAreZero_Succeeds()
    {
        // Act: User's exact case - Q2=90, Q4=90, Q1=0, Q3=0, Annual=90
        var act = () => validator.ValidateUniformQuarterly(
            "Program Implementation Rate",
            assignedAnnualTarget: 90m,
            q1: 0m, q2: 90m, q3: 0m, q4: 90m);

        // Assert
        act.Should().NotThrow();
    }

    [Fact]
    public void ValidateUniformQuarterly_WhenOnlyOneQuarterIs90AndOthersAreNullOrZero_Succeeds()
    {
        // Act
        var act = () => validator.ValidateUniformQuarterly(
            "Program Implementation Rate",
            assignedAnnualTarget: 90m,
            q1: 90m, q2: 0m, q3: null, q4: 0m);

        // Assert
        act.Should().NotThrow();
    }

    [Fact]
    public void ValidateUniformQuarterly_WhenNonZeroQuarterDoesNotMatchAnnual_ThrowsValidationException()
    {
        // Act: Q1 is 45, Annual is 90
        var act = () => validator.ValidateUniformQuarterly(
            "Program Implementation Rate",
            assignedAnnualTarget: 90m,
            q1: 45m, q2: 90m, q3: 0m, q4: 90m);

        // Assert
        act.Should().Throw<ValidationException>()
            .WithMessage("*Q1 target must equal assigned annual target (90)*");
    }

    [Fact]
    public void ValidateUniform_WhenAssignedDoesNotMatchAgencyAnnual_ThrowsValidationException()
    {
        // Act
        var act = () => validator.ValidateUniform(
            "Program Implementation Rate",
            agencyAnnualTarget: 90m,
            assignedAnnualTarget: 80m);

        // Assert
        act.Should().Throw<ValidationException>()
            .WithMessage("*Each office must receive the exact agency annual target (90)*");
    }
}
