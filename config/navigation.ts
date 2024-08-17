import { NavItem, NavItemWithChildren } from "../types/nav"
import { Blog } from '@/.content-collections/generated';
import { allBlogs } from 'content-collections';

export interface NavigationConfig {
  mainNav: NavItem[]
  docNav: NavItemWithChildren[]
  blogNav: NavItemWithChildren[]
}

function generateBlogNavItems(): NavItemWithChildren[] {
  const blogNavItems: NavItemWithChildren[] = [];

  allBlogs.sort((a: Blog, b: Blog) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  allBlogs.forEach((blog: Blog) => {
    const date = new Date(blog.date).toLocaleDateString();
    const blogNavItem: NavItemWithChildren = {
      title: `${blog.title} [${date}]`,
      href: `/${blog._meta.path}`,
      label: !blog.publish ? "Draft" : "",
      items: [],
    };

    blogNavItems.push(blogNavItem);
  });

  return blogNavItems;
}

const blogNavItems = generateBlogNavItems();

export const navConfig: NavigationConfig = {
  mainNav: [
    {
      title: "Products",
      href: "/products",
    },
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "Blog",
      href: "/blog",
    },

  ],
  docNav: [
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
  blogNav: [
    {
      title: "Blog Posts (By Date)",
      items: blogNavItems,
    },
    // {
    //   title: "By Tagged Topic",
    //   items: [
    //     {
    //       title: "#product",
    //       href: "/blog/#product",
    //       items: [],
    //     },
    //     {
    //       title: "#news",
    //       href: "/blog/#news",
    //       items: [],
    //     },
    //   ],
    // },
  ],

}