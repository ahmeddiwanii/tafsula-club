import { redirect } from "next/navigation"

/** Duplicate feed entry — news lives at /dashboard/member/posts */
export default function MemberFeedRedirect() {
  redirect("/dashboard/member/posts")
}
