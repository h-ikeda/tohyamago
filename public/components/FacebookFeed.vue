<template>
    <section class="grid gap-4 mx-5">
        <article v-for="post in filteredFeed" :key="post.id" class="bg-white border shadow-md rounded-xl px-6 pt-4 pb-4">
            <time class="text-xs font-medium block mb-2">
                {{ dateFormat(post.created_time) }}
            </time>
            <p class="whitespace-pre-wrap tracking-tighter text-justify">
                {{ post.message }}
            </p>
            <img v-for="item in post.attachments.data" :src="item.media.image.src" class="mt-4 border saturate-50 aspect-video object-cover">
            <nav class="w-fit ml-auto text-sm mt-3">
                <a :href="post.permalink_url" class="underline">
                    Facebookで詳しく見る→
                </a>
            </nav>
        </article>
    </section>
</template>

<script setup lang="ts">
import { fetchFacebookFeeds } from '../macros' with { type: 'macro' }

let feed = fetchFacebookFeeds()
feed.sort((a, b) => Date.parse(a.created_time) < Date.parse(b.created_time))
const filteredFeed = feed.filter(({ message }) => message)

function dateFormat(dateString) {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekDay = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
    return `${year}年${month}月${day}日(${weekDay})`
}
</script>
