import { format, startOfMonth, endOfMonth, subMonths, isToday, isYesterday, parseISO } from 'date-fns';

export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatRelativeDate = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) return 'Today';
  if (isYesterday(dateObj)) return 'Yesterday';
  
  return format(dateObj, 'MMM dd, yyyy');
};

export const getCurrentMonth = () => ({
  start: startOfMonth(new Date()),
  end: endOfMonth(new Date()),
});

export const getPreviousMonth = () => {
  const prevMonth = subMonths(new Date(), 1);
  return {
    start: startOfMonth(prevMonth),
    end: endOfMonth(prevMonth),
  };
};

export const getDateRangeLabel = (startDate, endDate) => {
  if (!startDate || !endDate) return 'All time';
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
};