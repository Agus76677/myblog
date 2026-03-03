import type { CardListData, Config, IntegrationUserConfig, ThemeUserConfig } from 'astro-pure/types'

export const theme: ThemeUserConfig = {
  title: 'My Research Blog',
  author: 'Agus76677',
  description: 'A personal site for paper reading notes, daily logs, and projects.',
  favicon: '/favicon/favicon.ico',
  locale: {
    lang: 'zh-CN',
    attrs: 'zh_CN',
    dateLocale: 'zh-CN',
    dateOptions: {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  },
  logo: {
    src: 'src/assets/avatar.webp',
    alt: 'Avatar'
  },
  titleDelimiter: ' | ',
  prerender: true,
  npmCDN: 'https://cdn.jsdelivr.net/npm',
  customCss: [],
  header: {
    menu: [
      { title: 'Blog', link: '/blog' },
      { title: 'Research', link: '/blog/research' },
      { title: 'Daily', link: '/blog/daily' },
      { title: 'Projects', link: '/projects' },
      { title: 'About', link: '/about' }
    ]
  },
  footer: {
    registration: {
      url: 'https://agus76677.github.io/',
      text: 'Published via GitHub Pages'
    },
    credits: true,
    social: { github: 'https://github.com/Agus76677/Agus76677.github.io' }
  },
  content: {
    externalLinksContent: ' ->',
    blogPageSize: 15,
    externalLinkArrow: true,
    share: ['x']
  }
}

export const integ: IntegrationUserConfig = {
  links: {
    logbook: [],
    applyTip: [
      { name: 'Name', val: theme.title },
      { name: 'Desc', val: theme.description || 'Null' },
      { name: 'Link', val: 'https://agus76677.github.io/' },
      { name: 'Avatar', val: 'https://agus76677.github.io/avatar/avatar.webp' }
    ]
  },
  pagefind: true,
  quote: {
    server: 'https://api.quotable.io/quotes/random?maxLength=60',
    target: `(data) => data[0].content || 'Error'`
  },
  typography: {
    class:
      'break-words prose prose-pure dark:prose-invert dark:prose-pure prose-headings:font-medium'
  },
  mediumZoom: {
    enable: true,
    selector: '.prose .zoomable',
    options: {
      className: 'zoomable'
    }
  },
  waline: {
    enable: false,
    server: '',
    emoji: ['bmoji'],
    additionalConfigs: {
      pageview: false,
      comment: false
    }
  }
}

export const terms: CardListData = {
  title: 'Terms content',
  list: [
    {
      title: 'Privacy Policy',
      link: '/terms/privacy-policy'
    },
    {
      title: 'Terms and Conditions',
      link: '/terms/terms-and-conditions'
    },
    {
      title: 'Copyright',
      link: '/terms/copyright'
    },
    {
      title: 'Disclaimer',
      link: '/terms/disclaimer'
    }
  ]
}

const config = { ...theme, integ } as Config
export default config
