/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: 'Project SEKAI',
  author: 'Project SEKAI',
  headerTitle: 'Project SEKAI',
  description: 'Website of Project SEKAI, yet another CTF team.',
  language: 'en-us',
  theme: 'dark', // system, dark or light
  siteUrl: 'https://sekai.team',
  siteRepo: 'https://github.com/blueset/sekai.team',
  siteLogo: '/static/images/fullLogo.svg',
  image: '/static/images/avatar.png',
  socialBanner: '/static/images/twitter-card.png?v=2',
  email: 'project.sekai@sekai.team',
  github: 'https://github.com/project-sekai-ctf',
  twitter: 'https://twitter.com/ProjectSEKAIctf',
  facebook: '',
  youtube: '',
  linkedin: 'https://www.linkedin.com/company/project-sekai-ctf/',
  ctftime: 'https://ctftime.org/team/169557',
  discord: '',
  locale: 'en-US',
  dateLocale: 'en-GB',
  analytics: {
    // supports plausible, simpleAnalytics or googleAnalytics
    plausibleDataDomain: '', // e.g. tailwind-nextjs-starter-blog.vercel.app
    simpleAnalytics: false, // true or false
    googleAnalyticsId: '', // e.g. UA-000000-2 or G-XXXXXXX
    cloudflareAnalytics: 'a743232028f24754b6bbe0b63373fc97',
  },
  // newsletter: {
  //     // supports mailchimp, buttondown, convertkit, klaviyo, revue, emailoctopus
  //     // Please add your .env file and modify it according to your selection
  //     provider: 'buttondown',
  // },
  comments: {
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // Select a provider and use the environment variables associated to it
    // https://vercel.com/docs/environment-variables
    provider: 'giscus', // supported providers: giscus, utterances, disqus
    giscusConfig: {
      // Visit the link below, and follow the steps in the 'configuration' section
      // https://giscus.app/
      repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
      repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
      category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
      categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
      mapping: 'pathname', // supported options: pathname, url, title
      reactions: '1', // Emoji reactions: 1 = enable / 0 = disable
      // Send discussion metadata periodically to the parent window: 1 = enable / 0 = disable
      metadata: '0',
      // theme example: light, dark, dark_dimmed, dark_high_contrast
      // transparent_dark, preferred_color_scheme, custom
      theme: 'light',
      // theme when dark mode
      darkTheme: 'transparent_dark',
      // If the theme option above is set to 'custom`
      // please provide a link below to your custom theme css file.
      // example: https://giscus.app/themes/custom_example.css
      themeURL: '',
      // This corresponds to the `data-lang="en"` in giscus's configurations
      lang: 'en',
    },
  },
  search: {
    provider: 'kbar', // kbar or algolia
    kbarConfig: {
      searchDocumentsPath: 'search.json', // path to load documents to search
    },
    // provider: 'algolia',
    // algoliaConfig: {
    //   // The application ID provided by Algolia
    //   appId: 'R2IYF7ETH7',
    //   // Public API key: it is safe to commit it
    //   apiKey: '599cec31baffa4868cae4e79f180729b',
    //   indexName: 'docsearch',
    // },
  },
}

module.exports = siteMetadata
