'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

export default function ClientDate({ value }: { value: string }) {
  const [formatted, setFormatted] = useState('');

  useEffect(() => {
    const date = dayjs(value).locale('id'); 
    setFormatted(date.format('D MMM YYYY'));
  }, [value]);

  return <span>{formatted}</span>;
}
