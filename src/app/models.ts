export interface Member { id: string; name: string; color: string; }
export interface Expense {
  id: string; title: string; amount: number; paidBy: string;
  splitAmong: string[]; category: string; date: string;
}
export interface Settlement { from: string; to: string; amount: number; }
export const CATEGORIES = ['Food', 'Travel', 'Stay', 'Fun', 'Bills', 'Other'];
export const PALETTE = ['#E5484D', '#12A594', '#3E63DD', '#F5A524', '#8E4EC6', '#D6409F'];
