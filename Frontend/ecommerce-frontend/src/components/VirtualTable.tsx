import React, { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Skeleton,
  VStack,
} from '@chakra-ui/react';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  width?: string;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemHeight?: number;
  maxHeight?: number;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
}

const BUFFER_SIZE = 3; // Number of items to render outside visible area

function VirtualTableComponent<T>({
  data,
  columns,
  itemHeight = 60,
  maxHeight = 400,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
}: VirtualTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(maxHeight);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - BUFFER_SIZE);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + BUFFER_SIZE * 2;
    const endIndex = Math.min(data.length, startIndex + visibleCount);

    return { startIndex, endIndex, visibleCount };
  }, [scrollTop, containerHeight, itemHeight, data.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [data, visibleRange]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  // Handle container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Memoized row renderer
  const renderRow = useCallback((item: T, index: number, actualIndex: number) => (
    <Tr 
      key={actualIndex}
      _hover={{ bg: 'gray.50' }}
      cursor={onRowClick ? 'pointer' : 'default'}
      onClick={() => onRowClick?.(item, actualIndex)}
    >
      {columns.map((column) => (
        <Td key={String(column.key)} width={column.width}>
          {column.render 
            ? column.render(item[column.key], item, actualIndex)
            : String(item[column.key] || '')
          }
        </Td>
      ))}
    </Tr>
  ), [columns, onRowClick]);

  if (loading) {
    return (
      <TableContainer>
        <VStack spacing={2}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={`${itemHeight}px`} width="100%" />
          ))}
        </VStack>
      </TableContainer>
    );
  }

  if (data.length === 0) {
    return (
      <Box textAlign="center" py={8} color="gray.500">
        {emptyMessage}
      </Box>
    );
  }

  const totalHeight = data.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return (
    <TableContainer
      ref={containerRef}
      maxHeight={maxHeight}
      overflowY="auto"
      onScroll={handleScroll}
      sx={{
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          bg: 'gray.100',
        },
        '&::-webkit-scrollbar-thumb': {
          bg: 'gray.300',
          borderRadius: '4px',
        },
      }}
    >
      <Table variant="simple" size="sm">
        <Thead position="sticky" top={0} bg="white" zIndex={1}>
          <Tr>
            {columns.map((column) => (
              <Th key={String(column.key)} width={column.width}>
                {column.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {/* Virtual spacer before visible items */}
          {offsetY > 0 && (
            <Tr>
              <Td colSpan={columns.length} height={offsetY} p={0} />
            </Tr>
          )}
          
          {/* Visible items */}
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return renderRow(item, index, actualIndex);
          })}
          
          {/* Virtual spacer after visible items */}
          {visibleRange.endIndex < data.length && (
            <Tr>
              <Td 
                colSpan={columns.length} 
                height={totalHeight - (visibleRange.endIndex * itemHeight)} 
                p={0} 
              />
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const VirtualTable = memo(VirtualTableComponent) as <T>(
  props: VirtualTableProps<T>
) => React.ReactElement;