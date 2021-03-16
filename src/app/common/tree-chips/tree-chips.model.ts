export class ItemNode {
    id: number;
    name: string;
    children: ItemNode[];
}

export class ItemFlatNode {
    id: number;
    name: string;
    level: number;
    expandable: boolean;
}
