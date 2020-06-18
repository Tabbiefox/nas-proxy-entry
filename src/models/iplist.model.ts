/**
 * IP List Item model
 */
export class IPListItem {
    /**
     * IP address
     */
    public ip: string;

    /**
     * Time listed
     */
    public listedDate: Date;

    /**
     * Item type
     */
    public allow: boolean;
}
