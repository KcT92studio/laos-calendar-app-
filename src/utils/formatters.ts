import { LAO_MONTHS, LAO_DAYS_OF_WEEK } from '../data/laoHolidays';
import { EventCategory } from '../types';

import { Language } from '../types';

export function toBuddhistYear(gregorianYear: number): number {
  return gregorianYear + 543;
}

export function formatLaoDateLong(date: Date | string, lang: Language = 'lo'): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const dayIndex = d.getDay();
  const dayNum = d.getDate();
  const monthIndex = d.getMonth();
  const beYear = toBuddhistYear(d.getFullYear());

  if (lang === 'en') {
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthName = LAO_MONTHS[monthIndex]?.nameEn || '';
    return `${daysEn[dayIndex]}, ${dayNum} ${monthName} ${d.getFullYear()} (B.E. ${beYear})`;
  }

  const dayOfWeek = LAO_DAYS_OF_WEEK[dayIndex]?.fullLao || '';
  const monthName = LAO_MONTHS[monthIndex]?.nameLao || '';
  return `${dayOfWeek}, ວັນທີ ${dayNum} ${monthName} ${d.getFullYear()} (ພ.ສ. ${beYear})`;
}

export function formatLaoDateShort(dateStr: string, lang: Language = 'lo'): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  if (lang === 'en') {
    const monthName = LAO_MONTHS[month]?.nameEn || parts[1];
    return `${day} ${monthName} ${year}`;
  }

  const monthName = LAO_MONTHS[month]?.nameLao || parts[1];
  return `${day} ${monthName} ${year}`;
}

// Calculate days remaining until target date
export function getDaysRemaining(targetDateStr: string, fromDateStr = '2026-10-20'): number {
  const start = new Date(fromDateStr + 'T00:00:00');
  const target = new Date(targetDateStr + 'T00:00:00');
  const diffTime = target.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Event Category Helpers
export function getCategoryLabelLao(cat: EventCategory): string {
  switch (cat) {
    case 'merit':
      return '🙏 ງານບຸນ/ໃສ່ບາດ';
    case 'birthday':
      return '🎂 ວັນເກີດ/ຄົບຮອບ';
    case 'work':
      return '💼 ວຽກງານ/ນັດໝາຍ';
    case 'travel':
      return '✈️ ທ່ອງທ່ຽວ/ເດີນທາງ';
    case 'bill':
      return '💳 ຈ່າຍຄ່າໄຟ/ຄ່ານ້ຳ/ໜີ້';
    case 'personal':
      return '📌 ເລື່ອງສ່ວນຕົວ';
  }
}

export function getCategoryBadgeClass(cat: EventCategory): string {
  switch (cat) {
    case 'merit':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'birthday':
      return 'bg-pink-100 text-pink-900 border-pink-300';
    case 'work':
      return 'bg-blue-100 text-blue-900 border-blue-300';
    case 'travel':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    case 'bill':
      return 'bg-purple-100 text-purple-900 border-purple-300';
    case 'personal':
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
}
