import { NoticeOfAwardWorkspace } from '../components/NoticeOfAwardWorkspace'

export function ManageNoticeOfAwardsPage() {
  return (
    <NoticeOfAwardWorkspace
      role="hope"
      title="Manage NOA"
      description="Approval queue for reviewing, returning, and approving public bidding NOAs."
      defaultFilter="for-approval"
      detailsTo="/v2/manage-noa/$noaId"
    />
  )
}
