export interface DragData {
    tag: string;
    data: any;
}

export interface DropData {
    drag: {
        tag: any;
        data: any;
    };
    drop: {
        tag: any;
        data: any;
    };
}
