export type HolidayType = 'national' | 'religious' | 'cultural' | 'observance';

export interface LaoHoliday {
  id: string;
  nameLao: string;
  nameEn: string;
  date: string; // YYYY-MM-DD for 2026
  isOfficialDayOff: boolean; // ວັນພັກລັດຖະການ (Paid public holiday)
  type: HolidayType;
  lunarInfoLao: string; // e.g. "ຂຶ້ນ 15 ຄ່ຳ ເດືອນ 11"
  descriptionLao: string;
  descriptionEn: string;
  traditionsLao: string[]; // e.g. ["ຕັກບາດຍາມເຊົ້າ", "ຊ່ວງເຮືອ", "ໄຫຼເຮືອໄຟ"]
  daysOffDuration?: number; // How many days of official leave
  celebrationLocationsLao?: string[]; // e.g. ["ນະຄອນຫຼວງວຽງຈັນ", "ຫຼວງພະບາງ", "ທົ່ວປະເທດ"]
}

export type LunarPhase = 'waxing_8' | 'waxing_15' | 'waning_8' | 'waning_14_15';

export interface WanSinDay {
  date: string; // YYYY-MM-DD
  phase: LunarPhase;
  phaseNameLao: string; // e.g. "ຂຶ້ນ 15 ຄ່ຳ (ວັນສິນເພັງໃຫຍ່)"
  lunarMonthLao: string; // e.g. "ເດືອນ 11"
  isMajor: boolean; // 15 ຄ່ຳ / 14 ດັບ = ວັນສິນໃຫຍ່
  dharmaAdviceLao: string;
  meritActivitiesLao: string[];
}

export type AuspiciousRating = 'excellent' | 'good' | 'neutral' | 'caution';

export interface AuspiciousDay {
  date: string;
  rating: AuspiciousRating;
  ratingNameLao: string; // e.g. "ວັນທຸງໄຊ (ຍອດຢ້ຽມ)", "ວັນອະທິບໍດີ (ດີຫຼາຍ)"
  suitableFor: string[]; // e.g. ["ຂຶ້ນເຮືອນໃໝ່", "ແຕ່ງດອງ", "ອອກລົດໃໝ່", "ເປີດຮ້ານຄ້າ"]
  avoidFor: string[]; // e.g. ["ງານສົບ", "ເດີນທາງໄກກາງຄືນ"]
  goodHoursLao: string; // e.g. "09:09 - 11:30 ແລະ 13:00 - 15:30"
  elementLao: string; // e.g. "ທາດໄມ້ / ລົມດີ"
}

export type Language = 'lo' | 'en';

export type EventCategory = 'merit' | 'birthday' | 'work' | 'travel' | 'bill' | 'personal';

export interface UserEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category: EventCategory;
  notes?: string;
  reminder: boolean;
  color?: string;
  completed?: boolean;
  isDaily?: boolean; // Repeat every day / ທຸກມື້
  createdAt: string;
}

export interface LongWeekendPlan {
  id: string;
  titleLao: string;
  titleEn: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  holidaysIncluded: string[];
  leaveDaysNeeded: number; // ມື້ລາພັກທີ່ຕ້ອງຂໍເພີ່ມ
  tipLao: string;
  suggestedDestinationsLao: string[];
}

export interface Heed12Tradition {
  monthIndex: number; // 1 to 12
  monthNameLao: string; // e.g. "ເດືອນ ຈຽງ", "ເດືອນ ຍີ່", "ເດືອນ 3"
  festivalNameLao: string; // e.g. "ບຸນເຂົ້າກັມ", "ບຸນຄູນລານ", "ບຸນເຂົ້າຈີ່"
  gregorianMonthName: string;
  summaryLao: string;
  ritualsLao: string[];
  meaningLao: string;
}

export type ThemeId = 
  | 'champa_gold' 
  | 'mekong_blue' 
  | 'emerald_nature' 
  | 'silk_violet' 
  | 'saffron_orange' 
  | 'dark_luxury';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  pageBg: string;
  cardBg: string;
  cardSubtleBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  secondary: string;
  headerGradient: string;
  headerBorder: string;
  accentBarGradient: string;
  btnPrimaryBg: string;
  btnPrimaryText: string;
  todayBg: string;
  todayText: string;
  todayRing: string;
  holidayColor: string;
  holidayBg: string;
  holidayBorder: string;
  wanSinColor: string;
  patternColor: string;
}

export interface ColorTheme {
  id: ThemeId;
  nameLao: string;
  nameEn: string;
  descriptionLao: string;
  primaryColor: string;
  secondaryColor: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export interface ActiveThemeConfig {
  id: ThemeId;
  nameLao: string;
  nameEn: string;
  descriptionLao: string;
  isDark: boolean;
  colors: ThemeColors;
  // Convenience properties for components
  headerGradient: string;
  headerBorder: string;
  accentBarGradient: string;
  pageBgClass: string;
  primaryColor: string;
  secondaryColor: string;
}
