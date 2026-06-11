/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Applicant {
  id: string;
  name: string;
  department: string;
  position: string;
  email?: string;
  motivation: string;
  taskToAutomate: string;
  aiToolUsageLevel: number; // 1 to 5
  automationInterest: number; // 1 to 5
  laptopAvailable: '가능' | '불가';
  appliedAt: string; // ISO Date String
}

export type TabType = 'guide' | 'apply' | 'admin';
export type InnerTabType = 'example' | 'process' | 'output';

export interface SalesRecord {
  date: string;       // YYYY-MM-DD
  revenue: number;    // 실매출액
  totalRevenue: number; // 총매출액
  discount: number;   // 할인액
  netRevenue: number; // 순매출액
  quantity: number;   // 수량
  gender: string;     // 성별
  age: string;        // 연령대
  channel: string;    // 채널
  store: string;      // 통합매장명
  premium: string;    // 프리미엄
  region: string;     // 거주지역
  category: string;   // 카테고리
  productName: string; // 상품명
  receiptNo: string;  // 영수증번호
  customerId: string; // 고객ID
}

