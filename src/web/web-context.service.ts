import { Injectable } from "@nestjs/common";
export interface NavLink {
    herf:string;
    label:string;
    active:boolean;
}

const NAV:Omit<NavLink,'active'>[] = [
    {
        herf:'/',
        label:'home'
    },
    {
        herf:'/feed',
        label:'Feed'
    },
    {
        herf:'/profile',
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
            navLinks:NAV.map(x=>({...x,active:x.herf === currentPath})),
            error:null,
            title:'App',
            ...extra,
        };
    }
}
