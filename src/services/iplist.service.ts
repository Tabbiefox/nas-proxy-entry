import { IIPListConfig } from '../config';
import { IPListItem } from '../models';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { equals } from '../helpers'

/**
 * IP List service
 * Holds current state of IP whitelist and blacklist and updates them in time
 */
export class IPListService {
    /**
     * Configuration of IP List service
     */
    private config: IIPListConfig;

    /**
     * Array of listed IPs
     */
    private list: IPListItem[];

    /**
     * Subject emiting on IP list change
     */
    private listChangeSubject: Subject<IPListItem[]>;

    /**
     * IP List pooling holder
     */
    private pooling: NodeJS.Timeout;


    /**
     * Create IP List service instance
     * @param config
     */
    constructor(config: IIPListConfig) {
        this.config = config;
        this.listChangeSubject = new Subject<IPListItem[]>();
    }

    /**
     * Load IP List and start pooling
     *
     * @param list optional list of IP addresses to load on start
     * @returns IP List service
     */
    public start(list?: IPListItem[]): IPListService {
        this.loadList(list || []);
        this.commit();
        this.setPooling();

        return this;
    }

    /**
     * Clear IP List and disable pooling
     */
    public stop() {
        this.list = [];
        this.unsetPooling();
    }

    /**
     * Load list of IP addresses provided in the parameter list
     *
     * @param list list of IP addresses to load
     */
    public loadList(list: IPListItem[]) {
        this.list = list.map(x => { x.listedDate = new Date(x.listedDate); return x });
    }

    /**
     *
     */
    public clearList() {
        this.list = [];
    }

    /**
     *
     */
    public add(ip: string, allow: boolean) {
        if (!this.has(ip, allow)) {
            let listItem = new IPListItem();
            listItem.ip = ip;
            listItem.listedDate = new Date();
            listItem.allow = allow;
            this.list.push(listItem);
        }
    }

    /**
     *
     */
    public remove(ip: string, allow: boolean) {

    }

    /**
     *
     */
    public commit() {
        this.check();
    }

    /**
     * Get IP list change subject as observable
     *
     * @returns IP list change observable
     */
    public getListChange() {
        return this.listChangeSubject
            .pipe(distinctUntilChanged((a, b) => equals(a, b)));
    }

    /**
     *
     */
    public has(ip: string, allow: boolean): boolean {
        return (!!this.list.find(x => x.ip == ip && x.allow == allow));
    }

    /**
     * Checks whether an IP List Item is currently valid
     *
     * @param item single IP List Item
     * @returns Boolean indicating validity of item
     */
    private isItemValid(item: IPListItem): boolean {
        if (item.allow && new Date(item.listedDate.getTime() + this.config.allowTimeout) >= new Date())
            return true;
        if (!item.allow && new Date(item.listedDate.getTime() + this.config.denyTimeout) >= new Date())
            return true;

        return false;
    }

    /**
     * Clean invalid items, ensure presence of mandatory items and emit changes
     */
    private check() {
        // remove invalid items
        this.list = this.list.filter(x => this.isItemValid(x));

        // check and add defaults
        for (let ip of this.config.allow) {
            this.add(ip, true);
        }
        for (let ip of this.config.deny) {
            this.add(ip, false);
        }

        // emit current list
        this.listChangeSubject.next(Array.from(this.list));
    }

    /**
     *
     */
    private setPooling() {
        if (this.config.poolingInterval) {
            this.pooling = setTimeout(() => {
                this.check()
                this.setPooling();
            }, this.config.poolingInterval);
        }
    }

    /**
     *
     */
    private unsetPooling() {
        clearTimeout(this.pooling);
    }
}
