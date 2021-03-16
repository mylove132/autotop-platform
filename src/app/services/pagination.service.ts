import { MatPaginatorIntl } from '@angular/material/paginator';

const dutchRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) { return `0, 共 ${length} 条`; }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;

    // 如果起始索引超过列表长度，尝试将结束索引固定在末尾。
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

    return `${startIndex + 1} - ${endIndex} , 共 ${length} 条`;
};

/**
 * 分页国际化，使用方法：
 * providers: [
 *     { provide: MatPaginatorIntl, useValue: getDutchPaginatorIntl() }
 * ]
 */
export function getDutchPaginatorIntl() {
    const paginatorIntl = new MatPaginatorIntl();

    paginatorIntl.itemsPerPageLabel = '每页数目:';
    paginatorIntl.firstPageLabel = '第一页';
    paginatorIntl.lastPageLabel = '最后一页';
    paginatorIntl.nextPageLabel = '下一页';
    paginatorIntl.previousPageLabel = '上一页';
    paginatorIntl.getRangeLabel = dutchRangeLabel;

    return paginatorIntl;
}
