import { NoticeOfAwardWorkspace } from '../components/NoticeOfAwardWorkspace'

export function NoticeOfAwardsPage() {
  return (
    <NoticeOfAwardWorkspace
      role="procurement-staff"
      title="Notice of Award (NOA)"
      description="Combined inbox for drafting, printing, submission, and status tracking for public bidding NOAs."
      detailsTo="/v2/notice-of-award-noa/$noaId"
    />
  )
}
