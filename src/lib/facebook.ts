import mock from './facebook-mock.json' with { type: 'json' }

export type FacebookPost = {
  id: string
  created_time: string
  message?: string
  permalink_url: string
  attachments?: {
    data: Array<{
      media?: { image?: { src: string; width: number; height: number } }
      subattachments?: { data: unknown[] }
    }>
  }
}

const fields = [
  'actions',
  'admin_creator',
  'allowed_advertisig_objects',
  'application',
  'attachments',
  'backdated_time',
  'call_to_action',
  'can_reply_privately',
  'child_attachments',
  'created_time',
  'feed_targeting',
  'from',
  'full_picture',
  'icon',
  'instagram_eligibility',
  'is_eligible_for_promotion',
  'is_expired',
  'is_hidden',
  'is_instagram_eligible',
  'is_popular',
  'is_published',
  'is_spherical',
  'message',
  'message_tags',
  'parent_id',
  'permalink_url',
  'place',
  'privacy',
  'promotable_id',
  'properties',
  'sheduled_publish_time',
  'shares',
  'status_type',
  'story',
  'story_tags',
  'subscribed',
  'targeting',
  'to',
  'updated_time',
  'video_buying_eligibility',
  'with_tags',
]

export async function fetchFacebookFeeds(): Promise<FacebookPost[]> {
  const pageId = process.env.FACEBOOK_PAGE_ID
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN

  if (!pageId || !accessToken) {
    return mock as FacebookPost[]
  }

  const res = await fetch(
    `https://graph.facebook.com/v23.0/${pageId}/feed?fields=${fields.join(',')}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  if (!res.ok) {
    console.warn(`Facebook API responded with ${res.status}, falling back to mock`)
    return mock as FacebookPost[]
  }
  const json = (await res.json()) as { data: FacebookPost[] }
  return json.data
}
