import { Injectable } from "@nestjs/common";
import { user_role } from "src/users/entities/user.entity";
export interface NavLink {
    href: string;
    label: string;
    active: boolean;
}

const NAV: Omit<NavLink, 'active'>[] = [
    {
        href: '/',
        label: 'home'
    },
    {
        href: '/feed',
        label: 'Feed'
    },
    {
        href: '/profile',
        label: 'Profile'
    },
    {
        href: '/search',
        label: 'Search'
    },
    {
        href: '/admin',
        label: 'Admin'
    }
]

@Injectable()
export class webContextService {
    build(
        currentPath: string,
        user: any | null,
        extra: Record<string, unknown> = {},
    ): Record<string, unknown> {

        const userNav = NAV.filter(x => x.label !== 'Admin');
        if (user && user.role === user_role.ADMIN) {
            return {
                user,
                navLinks: NAV.map(x => ({ ...x, active: x.href === currentPath })),
                error: null,
                title: 'App',
                ...extra,
            };
        }
        else {
            return {
                user,
                navLinks: userNav.map(x => ({ ...x, active: x.href === currentPath })),
                error: null,
                title: 'App',
                ...extra,
            };
        }


    }
}
