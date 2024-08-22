import { Icons } from '@/components/icons';

export interface NavItem {
    title: string;
    href?: string;
    external?: boolean;
    icon?: keyof typeof Icons;
    label?: string;
}

export interface NavItemWithChildren extends NavItem {
    items: NavItemWithChildren[];
}

// export interface MainNavItem extends NavItem { }

// export interface SidebarNavItem extends NavItemWithChildren { }
// export interface BlogNavItem extends NavItemWithChildren { }
