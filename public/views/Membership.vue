<template>
  <h1>
    入会案内
  </h1>
  <p>
    遠山郷応援会の企画する活動には誰でも参加することができますが、会員になるとその運営にも深く携わっていただけます。あるいは日頃の活動にはなかなか立ち会えなくても、会員として議論や意思決定に参加することで、当会の運営面を支えていただくことができます。
  </p>
  <p>
    当会の活動趣旨にご賛同いただけましたら、是非入会についてご検討下さいますようご案内致します。
  </p>
  <h2>
    会員の権限
  </h2>
  <p>
    会員は法律と当会定款に基づき、会員総会に参加し議決権を行使することができます。
  </p>
  <p>
    また必要条件を満たせば会員総会の招集を請求することができます。
  </p>
  <p>
    詳しくは<RouterLink to="/articles" class="underline">本会定款</RouterLink>をご覧下さい。
  </p>
  <h2>
    年会費
  </h2>
  <p>
    現在の年会費は、5,000円です。
  </p>
  <p>
    年会費は会員総会にて定めますので、変更になる場合があります。
  </p>
  <h2>
    入会手続き
  </h2>
  <p>
    ただいま準備中です。理事会の決定をお待ち下さい。
  </p>
</template>

<style scoped>
h1 {
  @apply mx-auto w-fit my-8 text-lg relative;
  @apply before:border-x-[1rem] before:border-x-transparent before:border-b-[1.73rem] before:border-b-green-500 before:absolute before:-left-12 before:-top-1 before:scale-90;
  @apply after:border-x-[1rem] after:border-x-transparent after:border-b-[1.73rem] after:border-b-green-700 after:absolute after:-left-10;
}

p {
  @apply indent-4 mx-8 my-2;
}

h2 {
  @apply mx-auto w-fit mt-8 mb-4 font-normal relative;
  @apply before:border-x-[.5rem] before:border-x-transparent before:border-b-[.87rem] before:border-b-green-500 before:absolute before:-left-6 before:top-0.5 before:scale-90;
  @apply after:border-x-[.5rem] after:border-x-transparent after:border-b-[.87rem] after:border-b-green-700 after:absolute after:-left-5 after:top-1.5;
}
</style>
