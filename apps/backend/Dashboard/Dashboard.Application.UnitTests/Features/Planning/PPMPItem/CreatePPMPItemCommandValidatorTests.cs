using ERPEZ.Application.Features.Planning.PPMPItem.Commands.CreatePPMPItem;
using ERPEZ.Domain.Enums;
using FluentValidation.TestHelper;
using Xunit;

namespace ERPEZ.Application.UnitTests.Features.Planning.PPMPItem;

public class CreatePPMPItemCommandValidatorTests
{
    private readonly CreatePPMPItemCommandValidator validator = new();

    [Fact]
    public void Should_Pass_For_Legacy_CSE_Item()
    {
        var command = new CreatePPMPItemCommand
        {
            PPMPExpenditureItemId = Guid.NewGuid(),
            ProcurementModeId = Guid.NewGuid(),
            CSEItemId = Guid.NewGuid(),
            NonCSEItemId = null,
            PlannedQuantity = 10,
            ProjectType = ProcurementProjectType.Goods
        };

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_For_Approved_NonCSE_Item()
    {
        var command = new CreatePPMPItemCommand
        {
            PPMPExpenditureItemId = Guid.NewGuid(),
            ProcurementModeId = Guid.NewGuid(),
            CSEItemId = null,
            NonCSEItemId = Guid.NewGuid(),
            PlannedQuantity = 50,
            ProjectType = ProcurementProjectType.Goods
        };

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Pass_For_PSDBM_CSE_Direct_Snapshot()
    {
        var command = new CreatePPMPItemCommand
        {
            PPMPExpenditureItemId = Guid.NewGuid(),
            ProcurementModeId = Guid.NewGuid(),
            CSEItemId = null,
            NonCSEItemId = null,
            Name = "CLIP, Backfold, 50mm",
            Unit = "Box",
            UnitPrice = 62.66m,
            PlannedQuantity = 100,
            ProjectType = ProcurementProjectType.Goods
        };

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Fail_When_PlannedQuantity_Is_Zero_Or_Negative()
    {
        var command = new CreatePPMPItemCommand
        {
            PPMPExpenditureItemId = Guid.NewGuid(),
            ProcurementModeId = Guid.NewGuid(),
            CSEItemId = Guid.NewGuid(),
            PlannedQuantity = 0,
            ProjectType = ProcurementProjectType.Goods
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.PlannedQuantity);
    }

    [Fact]
    public void Should_Fail_When_Both_CSEItemId_And_NonCSEItemId_Are_Provided()
    {
        var command = new CreatePPMPItemCommand
        {
            PPMPExpenditureItemId = Guid.NewGuid(),
            ProcurementModeId = Guid.NewGuid(),
            CSEItemId = Guid.NewGuid(),
            NonCSEItemId = Guid.NewGuid(),
            ProjectType = ProcurementProjectType.Goods
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x);
    }

    [Fact]
    public void Should_Fail_When_Direct_Snapshot_Missing_Required_Fields()
    {
        // Missing Unit and non-positive UnitPrice
        var command = new CreatePPMPItemCommand
        {
            PPMPExpenditureItemId = Guid.NewGuid(),
            ProcurementModeId = Guid.NewGuid(),
            CSEItemId = null,
            NonCSEItemId = null,
            Name = "CLIP, Backfold, 50mm",
            Unit = "",
            UnitPrice = 0m,
            ProjectType = ProcurementProjectType.Goods
        };

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x);
    }
}
