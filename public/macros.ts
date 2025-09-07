import mock from './test/mock.json'

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

export async function fetchFacebookFeeds(this) {
  this?.invalidateOnEnvChange('FACEBOOK_PAGE_ID')
  this?.invalidateOnEnvChange('FACEBOOK_ACCESS_TOKEN')
  if (process.env.NODE_ENV !== 'production') {
    return mock
  }
  const res = await fetch(`https://graph.facebook.com/v23.0/${process.env.FACEBOOK_PAGE_ID}/feed?fields=${fields.join(',')}`, {
    headers: {
      Authorization: `Bearer ${process.env.FACEBOOK_ACCESS_TOKEN}`,
    },
  })
  const json = await res.json()
  return json.data
}
