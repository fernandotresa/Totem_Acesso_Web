import { Observable } from "rxjs/Observable";

export interface SideMenuOption {

    iconName?: string;    
    displayText: string;    
    badge?: Observable<any>;
    component?: any;
    custom?: any;
    selected?: boolean;
    suboptions?: Array<SideMenuOption>;
}
