// Constants for WFP Objective Target Form
export const TIMELINE_TYPES = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'] as const

export const MONTH_ABBREVIATIONS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const

export const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4'] as const

export const MONTH_NAMES: Record<string, string> = {
  Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June',
  Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December'
}

export const TIMELINE_CONFIG: Record<string, {
  label: string
  bg: string
  border: string
  text: string
  active: string
  count: number
}> = {
  Daily: {
    label: 'Day',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    active: 'bg-blue-600 text-white',
    count: 31
  },
  Weekly: {
    label: 'Week',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    active: 'bg-purple-600 text-white',
    count: 52
  },
  Monthly: {
    label: 'Month',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    active: 'bg-[#10b981] text-white',
    count: 12
  },
  Quarterly: {
    label: 'Quarter',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    active: 'bg-orange-600 text-white',
    count: 4
  },
  Annual: {
    label: 'Year',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    active: 'bg-slate-600 text-white',
    count: 1
  },
}

// Helper functions
export const getFullMonthName = (abbr: string): string => {
  return MONTH_NAMES[abbr] || abbr
}

export const getPeriods = (type: string): ReadonlyArray<string> => {
  switch (type) {
    case 'Monthly':
      return [...MONTH_ABBREVIATIONS]
    case 'Weekly':
      return Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`)
    case 'Quarterly':
      return [...QUARTER_LABELS]
    case 'Annual':
      return [new Date().getFullYear().toString()]
    case 'Daily': {
      const now = new Date()
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      return Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`)
    }
    default: {
      const config = TIMELINE_CONFIG[type] || TIMELINE_CONFIG.Daily
      return Array.from({ length: Math.min(config.count, 31) }, (_, i) => `${config.label} ${i + 1}`)
    }
  }
}

export const getPeriodDates = (period: string, type: string, projectStart?: string): string => {
  const { startDate, endDate } = getPeriodDateObjects(period, type, projectStart);

  if (type === 'Daily') {
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return startDate.toLocaleDateString('en-US', options);
  }

  // endDate is inclusive
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  return `${startDate.toLocaleDateString('en-US', options)} → ${endDate.toLocaleDateString('en-US', options)}`;
};

export const getDayOfWeek = (period: string, type: string, projectStart?: string): string => {
  if (type === 'Daily') {
    if (projectStart) {
      // Parse date from format like "Jan 1"
      const dateParts = period.split(' ');
      if (dateParts.length === 2) {
        const monthName = dateParts[0];
        const day = parseInt(dateParts[1]);
        const monthIndex = MONTH_ABBREVIATIONS.indexOf(monthName as typeof MONTH_ABBREVIATIONS[number]);
        if (monthIndex !== -1) {
          const projectDate = new Date(projectStart);
          const year = projectDate.getFullYear();
          const date = new Date(year, monthIndex, day);
          const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
          return days[date.getDay()];
        }
      }
    }
    // Fallback
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[new Date().getDay()];
  }
  return '';
};

export const getPeriodDateObjects = (
  period: string,
  type: string,
  projectStart?: string
): { startDate: Date; endDate: Date } => {
  const today = new Date();
  const projectDate = projectStart ? new Date(projectStart) : today;
  const year = projectDate.getFullYear();
  const currentMonth = projectDate.getMonth();

  // MONTHLY
  if (type === 'Monthly') {
    // Handle formats like "Jan" or "Jan 2024"
    const parts = period.split(' ');
    const monthAbbr = parts[0];
    const periodYear = parts.length > 1 ? parseInt(parts[1]) : year;

    const monthIndex = MONTH_ABBREVIATIONS.indexOf(
      monthAbbr as typeof MONTH_ABBREVIATIONS[number]
    );

    const startDate = new Date(periodYear, monthIndex, 1);
    // last day of the month (inclusive)
    const endDate = new Date(periodYear, monthIndex + 1, 0);

    return { startDate, endDate };
  }

  // QUARTERLY
  if (type === 'Quarterly') {
    // Handle formats like "Q1" or "Q1 2024"
    const parts = period.split(' ');
    const quarterLabel = parts[0];
    const periodYear = parts.length > 1 ? parseInt(parts[1]) : year;

    const quarterIndex = QUARTER_LABELS.indexOf(
      quarterLabel as typeof QUARTER_LABELS[number]
    );

    const startMonth = quarterIndex * 3;
    const startDate = new Date(periodYear, startMonth, 1);
    // last day of the quarter (inclusive)
    const endDate = new Date(periodYear, startMonth + 3, 0);

    return { startDate, endDate };
  }

  // ANNUAL
  if (type === 'Annual') {
    const periodYear = parseInt(period);
    const startDate = new Date(periodYear, 0, 1);
    // last day of the year (inclusive)
    const endDate = new Date(periodYear, 11, 31);

    return { startDate, endDate };
  }

  // WEEKLY (Monday–Sunday) - now using date ranges like "Jan 1-7" or "Jan 30-Feb 5"
  if (type === 'Weekly') {
    // Matches "Jan 1-7" (Standard) or "Jan 30-Feb 5" (Cross-month)
    const match = period.match(/^(\w+)\s+(\d+)-(?:(\w+)\s+)?(\d+)$/);

    if (match && projectStart) {
      const [, startMonthName, startDayStr] = match;
      const monthIndex = MONTH_ABBREVIATIONS.indexOf(startMonthName as typeof MONTH_ABBREVIATIONS[number]);

      if (monthIndex !== -1) {
        const startDay = parseInt(startDayStr);
        const startDate = new Date(year, monthIndex, startDay);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        return { startDate, endDate };
      }
    }

    // Fallback logic if parsing fails
    const weekIndex = parseInt(period.replace('Week ', ''));
    if (!isNaN(weekIndex)) {
      const startOfYear = new Date(year, 0, 1);
      const dayOfWeek = startOfYear.getDay();
      const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const startDate = new Date(year, 0, 1 + (weekIndex - 1) * 7 - offset);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      return { startDate, endDate };
    }
  }

  // DAILY - now using dates like "Jan 1"
  if (type === 'Daily') {
    if (projectStart) {
      // Parse date from format like "Jan 1"
      const dateParts = period.split(' ');
      if (dateParts.length === 2) {
        const monthName = dateParts[0];
        const day = parseInt(dateParts[1]);
        const monthIndex = MONTH_ABBREVIATIONS.indexOf(monthName as typeof MONTH_ABBREVIATIONS[number]);
        if (monthIndex !== -1) {
          const startDate = new Date(year, monthIndex, day);
          return { startDate, endDate: new Date(startDate) };
        }
      }
    }
    // Fallback to old logic
    const dayMatch = period.match(/\d+/);
    const dayOffset = dayMatch ? parseInt(dayMatch[0]) - 1 : 0;
    const startDate = new Date(year, currentMonth, 1 + dayOffset);
    return { startDate, endDate: new Date(startDate) };
  }

  // FALLBACK
  const fallbackDate = new Date();
  return { startDate: fallbackDate, endDate: fallbackDate };
};
