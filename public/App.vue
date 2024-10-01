<template>
  <main>
    <RouterView/>
  </main>
  <footer>一般社団法人遠山郷応援会</footer>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply h-dvh flex flex-col;
}
</style>

<style module>
main {
  @apply grow;
}

footer {
  @apply text-center text-sm py-0.5 shadow;
}
</style>
