import { NavItem, NavItemWithChildren } from '../types/nav';

export interface NavigationConfig {
    mainNav: NavItem[];
    hamRadioNav: NavItemWithChildren[];
}

export const navConfig: NavigationConfig = {
    mainNav: [
        { title: 'Ham Radio', href: '/ham-radio' },
        { title: 'Guitars', href: '/guitars' },
        { title: 'Shop', href: '/shop' },
        { title: 'Community', href: '/community' },
    ],
    hamRadioNav: [
        {
            title: 'Documentation',
            items: [
                { title: '20W Dummy Load', href: '/docs/dl20w_bnc', items: [] },
                { title: 'Measuring Power', href: '/docs/power_measurement', items: [] },
            ],
        },
    ],
};
