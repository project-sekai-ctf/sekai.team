import { writeFileSync } from 'fs'
import GithubSlugger from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'
import { allBlogs } from '../.contentlayer/generated/index.mjs'
import siteMetadata from '../data/siteMetadata.js'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Count the occurrences of all tags across blog posts and write to json file
 */
export async function createTagCount() {
  const tagCount = {}
  allBlogs.forEach((file) => {
    if (file.tags && (!isProduction || file.draft !== true)) {
      file.tags.forEach((tag) => {
        const formattedTag = GithubSlugger.slug(tag)
        if (!tagCount[formattedTag]) {
          // Initialize the object if it doesn't exist
          tagCount[formattedTag] = { count: 0 }
        }
        if (tagCount[formattedTag].count) {
          tagCount[formattedTag].count += 1
        } else {
          tagCount[formattedTag].slug = formattedTag
          tagCount[formattedTag].proper = tag
          tagCount[formattedTag].count = 1
        }
      })
    }
  })
  writeFileSync('./app/tag-data.json', JSON.stringify(tagCount))
}

export async function createSearchIndex() {
  if (
    siteMetadata?.search?.provider === 'kbar' &&
    siteMetadata.search.kbarConfig.searchDocumentsPath
  ) {
    writeFileSync(
      `public/${siteMetadata.search.kbarConfig.searchDocumentsPath}`,
      JSON.stringify(allCoreContent(sortPosts(allBlogs)))
    )
    console.log('Local search index generated...')
  }
}

async function postContentlayer() {
  await createTagCount()
  await createSearchIndex()
}

postContentlayer()
