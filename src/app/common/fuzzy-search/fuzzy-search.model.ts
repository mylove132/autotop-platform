export interface FuzzySearchEntity {
    id: number;
    name: string;
    header: string;
    param: string;
    paramType: number;
    caseGrade: number;
    caseType: number;
    path: string;
    endpoint: string;
    type: string;
    createDate: string;
    updateDate: string;
    assertText: string;
    assertKey: string;
    isNeedToken?: boolean;
    isFailNotice?: boolean;
    isNeedSign?: boolean;
    tokenId?: number;
    alias?: boolean;
}
