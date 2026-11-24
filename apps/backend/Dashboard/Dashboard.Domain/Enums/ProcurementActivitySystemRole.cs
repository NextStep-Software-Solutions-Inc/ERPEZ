namespace ERPEZ.Domain.Enums;

/// <summary>
/// Discriminator for seeded GPPB-standard activity types.
/// Allows the system to reliably identify key schedule dates
/// without fragile name-string matching.
/// User-created custom activity types leave SystemRole = null.
/// </summary>
public enum ProcurementActivitySystemRole
{
    AdvertisementPosting    = 1,
    PreBidConference        = 2,
    SubmissionOpeningOfBids = 3,
    BidEvaluation           = 4,
    PostQualification       = 5,
    NoticeOfAward           = 6,
    ContractSigning         = 7,
    NoticeToProceed         = 8
}