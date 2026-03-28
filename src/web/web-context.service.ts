import { Injectable } from "@nestjs/common";
export interface NavLink {
    href:string;
    label:string;
    active:boolean;
}

const NAV:Omit<NavLink,'active'>[] = [
    {
        href:'/',
        label:'home'
    },
    {
        href:'/feed',
        label:'Feed'
    },
    {
        href:'/profile',
        label:'Profile'
    },
] 

@Injectable()
export class webContextService {
    build(
        currentPath:string,
        user:any | null,
        extra: Record<string,unknown> = {},
    ):Record<string,unknown> {
        return{
            user,
            navLinks:NAV.map(x=>({...x,active:x.href === currentPath})),
            error:null,
            title:'App',
            ...extra,
        };
    }
}
