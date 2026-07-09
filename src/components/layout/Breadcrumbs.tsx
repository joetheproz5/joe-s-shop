import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import clsx from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  const allItems = [{ label: 'Home', path: '/' }, ...items];

  // On mobile, truncate middle items if there are more than 3 total items
  const shouldTruncate = allItems.length > 3;
  const truncateIndex = allItems.length - 2;
  const truncatedItems = shouldTruncate
    ? [
        allItems[0],
        allItems[truncateIndex - 1] != null ? { label: '...', path: undefined } : allItems[truncateIndex],
        allItems[allItems.length - 2],
        allItems[allItems.length - 1],
      ]
    : allItems;

  const renderedItems = shouldTruncate
    ? [allItems[0], { label: '...' }, ...allItems.slice(-2)]
    : allItems;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {renderedItems.map((item, index) => {
        const isLast = index === renderedItems.length - 1;
        const isEllipsis = item.label === '...';

        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-gray-600" />
            )}

            {isLast ? (
              <span
                className={clsx(
                  'font-medium text-gray-900 dark:text-gray-100',
                  'truncate max-w-[200px] sm:max-w-none'
                )}
              >
                {item.label}
              </span>
            ) : isEllipsis ? (
              <span className="px-1 text-gray-400 dark:text-gray-600">...</span>
            ) : item.path ? (
              <Link
                to={item.path}
                className={clsx(
                  'flex items-center gap-1 transition-colors',
                  'text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400',
                  'truncate max-w-[150px] sm:max-w-none'
                )}
              >
                {index === 0 && <Home className="h-3.5 w-3.5 flex-shrink-0" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className="truncate max-w-[150px] sm:max-w-none text-gray-500 dark:text-gray-400">
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
