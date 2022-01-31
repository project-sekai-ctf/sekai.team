import Script from 'next/script'

import siteMetadata from '@/data/siteMetadata'

const CloudflareAnalytics = () => {
  return (
    <>
      <Script
        strategy="lazyOnload"
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon={`{"token": "${siteMetadata.analytics.cloudflareAnalytics}"}`}
      />
    </>
  )
}

export default CloudflareAnalytics
