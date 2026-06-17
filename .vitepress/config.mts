import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Ordo',
  description: 'A modern project orchestrator for C and C++',
  base: '/ordo-docs/',

  head: [
    ['meta', { name: 'theme-color', content: '#1a1a1a' }],
  ],

  locales: {
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/introduction' },
          { text: 'Reference', link: '/en/reference/cli' },
          { text: 'Changelog', link: '/en/changelog' },
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Guide',
              items: [
                { text: 'Introduction', link: '/en/guide/introduction' },
                { text: 'Getting Started', link: '/en/guide/getting-started' },
                { text: 'Dependencies', link: '/en/guide/dependencies' },
                { text: 'Workspace', link: '/en/guide/workspace' },
                { text: 'Lua Build Scripts', link: '/en/guide/lua-build-scripts' },
              ],
            },
          ],
          '/en/reference/': [
            {
              text: 'Reference',
              items: [
                { text: 'CLI Commands', link: '/en/reference/cli' },
                { text: 'Ordo.toml', link: '/en/reference/ordo-toml' },
                { text: 'Ordo.lock', link: '/en/reference/ordo-lock' },
                { text: 'Lua API', link: '/en/reference/lua-api' },
                { text: 'Error Codes', link: '/en/reference/error-codes' },
              ],
            },
          ],
        },
      },
    },
    ja: {
      label: '日本語',
      lang: 'ja',
      link: '/ja/',
      themeConfig: {
        nav: [
          { text: 'ガイド', link: '/ja/guide/introduction' },
          { text: 'リファレンス', link: '/ja/reference/cli' },
          { text: '変更履歴', link: '/ja/changelog' },
        ],
        sidebar: {
          '/ja/guide/': [
            {
              text: 'ガイド',
              items: [
                { text: 'はじめに', link: '/ja/guide/introduction' },
                { text: 'クイックスタート', link: '/ja/guide/getting-started' },
                { text: '依存関係', link: '/ja/guide/dependencies' },
                { text: 'ワークスペース', link: '/ja/guide/workspace' },
                { text: 'Lua ビルドスクリプト', link: '/ja/guide/lua-build-scripts' },
              ],
            },
          ],
          '/ja/reference/': [
            {
              text: 'リファレンス',
              items: [
                { text: 'CLI コマンド', link: '/ja/reference/cli' },
                { text: 'Ordo.toml', link: '/ja/reference/ordo-toml' },
                { text: 'Ordo.lock', link: '/ja/reference/ordo-lock' },
                { text: 'Lua API', link: '/ja/reference/lua-api' },
                { text: 'エラーコード', link: '/ja/reference/error-codes' },
              ],
            },
          ],
        },
      },
    },
  },

  themeConfig: {
    siteTitle: 'Ordo',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/NaruseNia/ordo' },
    ],

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/narusenia/ordo-docs/edit/main/:path',
    },

    footer: {
      message: 'Released under the MIT / Apache-2.0 License.',
      copyright: 'Copyright © 2025-present Naruse Nia',
    },
  },
})
