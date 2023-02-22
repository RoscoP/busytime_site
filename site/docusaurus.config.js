// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'BusyTime',
  tagline: 'Lights for Busy Times',
  favicon: 'img/busytime.ico',

  // Set the production url of your site here
  url: 'https://busytime.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'RoscoP', // Usually your GitHub org/user name.
  projectName: 'busytime_site', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          breadcrumbs: false,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/busytime.png',
      sidebar: { hidable: true, autoCollapseCategories: true, pagination_prev: null, pagination_next: null },
      navbar: {
        title: 'BusyTime',
        logo: {
          alt: 'BusyTime Logo',
          src: 'img/busytime.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'hardware',
            position: 'left',
            label: 'Hardware',
          },
          {to: '/guide', label: 'Guide', position: 'left'},
          {to: '/privacy', label: 'Privacy', position: 'right'},
          {to: '/terms', label: 'Terms', position: 'right'},
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} BusyTime, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
