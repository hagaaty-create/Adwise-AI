'use client';

import { useState, useEffect } from 'react';

interface SafeDateTimeProps {
  date: string | Date;
  options?: Intl.DateTimeFormatOptions;
  locale?: string;
}

/**
 * Renders a date and time string in a way that is safe from hydration errors.
 * It ensures that date formatting, which can be timezone-sensitive,
 * only runs on the client after the initial render.
 */
export function SafeDateTime({ date, options, locale = 'en-US' }: SafeDateTimeProps) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // This effect runs only on the client, after hydration.
    // It safely formats the date using the browser's locale and timezone.
    const dateObj = new Date(date);
    setFormattedDate(dateObj.toLocaleDateString(locale, options));
  }, [date, options, locale]);

  if (!formattedDate) {
    // Render nothing or a placeholder on the server and during the initial client render.
    return null;
  }

  return <span>{formattedDate}</span>;
}
