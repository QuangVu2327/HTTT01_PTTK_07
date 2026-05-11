export interface TTKH {
    TenKH: string;
    Email: string;
}

export interface TTChoO {
    TenKH: string;    // Tên khách hàng đại diện
    DiaChi: string;
    Email: string;
}

export interface XuLiMailPayload {
    Mail: string;     // email body text
    File?: File;      // attached file
}