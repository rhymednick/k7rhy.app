import { MainNavItem, SidebarNavItem } from "../types/nav"

export interface DocsConfig {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Products",
      href: "/products",
    },
    {
      title: "Documentation",
      href: "/docs",
    },
  ],
  sidebarNav: [
    {
      title: "Assembly Guides",
      items: [
        {
          title: "20W Dummy Load",
          href: "/docs/dl20w_bnc",
          items: [],
        },
      ],
    },
    {
      title: "Tech Guides",
      items: [
        {
          title: "Measuring Power",
          href: "/docs/power_measurement",
          items: [],
        },
      ],
    },
  ],

}